
var dataChuva = new Array()

var leitorDeCSV = new FileReader()
window.onload = function init() {
    leitorDeCSV.onload = leCSV;
}

function pegaCSV(inputFile) {
    var file = inputFile.files[0];
    leitorDeCSV.readAsText(file);
}

function leCSV(evt) {

    var associados = new Array();

    var dataAux = "";
    var controladorRepetidorData = 0;

    var fileArr = evt.target.result

    associados = JSON.parse(fileArr);

    for (var i = 0; i < associados.length; i++) {

        var dadoEstacao = associados[i].dadoEstacao;
        for (var j = 0; j < dadoEstacao.length; j++) {
            var data = new Date(dadoEstacao[j].started.toString().split("T")[0] + ' 00:00');
            //Evitando duplicatas do arquivo
            if (dataAux != data.toLocaleDateString()) {
                dataAux = data.toLocaleDateString();
                controladorRepetidorData = 0;
            } else {
                controladorRepetidorData++;
            }

            if (controladorRepetidorData < 3) {
                preencherData(data.toLocaleDateString(), dadoEstacao[j])
            }

        }

        tirarMedias()

        var novoAssociado = {
            associado: pegarNomeAssociado(associados[i].associado.name),
            latitude: associados[i].associado.lat,
            longitude: associados[i].associado.lon,
            talhao: pegarTalhao(associados[i].associado.name),
            fazenda: pegarFazenda(associados[i].associado.name),
            dataChuva: dataChuva
        }


        associados[i] = novoAssociado;
        dataChuva = new Array();
    }

    //console.log(associados)
    controlePreenchimentoTabelaZeus(associados);
    //console.log(JSON.stringify(associados))

}

function controlePreenchimentoTabelaZeus(associados) {
    for (var i = 0; i < associados.length; i++) {

        try {
            var dadoChuva = associados[i].dataChuva;
            for (var j = 0; j < dadoChuva.length; j++) {
                preencherTabelaZeus(associados[i], dadoChuva[j])
            }
        } catch {
            // dados da estação
        }

    }

    gerarPlanilha();
}

function preencherTabelaZeus(associado, dadoChuva) {

    var table = document.getElementById('tabelaZeus');

    var row = table.insertRow(1);
    row.innerHTML = '<tr>' +
        '<td class="text-center">' + dadoChuva.data + '</td>' +
        '<td class="text-center">' + associado.associado + '</td>' +
        '<td class="text-center">' + associado.latitude + '</td>' +
        '<td class="text-center">' + associado.longitude + '</td>' +
        '<td class="text-center">' + associado.talhao + '</td>' +
        '<td class="text-center">' + associado.fazenda + '</td>' +
        '<td class="text-center">' + dadoChuva.chuva + '</td>' +
        '<td class="text-center">' + dadoChuva.temperaturaMinima + '</td>' +
        '<td class="text-center">' + dadoChuva.temperaturaMaxima + '</td>' +
        '<td class="text-center">' + dadoChuva.temperaturaInstantanea + '</td>' +
        '<td class="text-center">' + dadoChuva.umidadeMinima + '</td>' +
        '<td class="text-center">' + dadoChuva.umidadeMaxima + '</td>' +
        '<td class="text-center">' + dadoChuva.umidadeInstantanea + '</td>' +
        '<td class="text-center">' + dadoChuva.pressaoAtmosfericaMinima + '</td>' +
        '<td class="text-center">' + dadoChuva.pressaoAtmosfericaMaxima + '</td>' +
        '<td class="text-center">' + dadoChuva.pressaoAtmosfericaInstantanea + '</td>' +
        '<tr>';
}

async function gerarPlanilha() {


    wb = XLSX.utils.table_to_book(document.getElementById('tabelaZeus'), {
        sheet: "Sheet JS",
        raw: true
    });

    wbout = XLSX.write(wb, {
        bookType: 'xlsx',
        bookSST: true,
        type: 'binary',
    });

    saveAs(new Blob([s2ab(wbout)], {
        type: "application/octet-stream"
    }), "zeus.xlsx");

}

function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}

function tirarMedias() {
    for (var i = 0; i < dataChuva.length; i++) {
        dataChuva[i].temperaturaMinima = (dataChuva[i].temperaturaMinima / 24).toFixed(2);
        dataChuva[i].temperaturaMaxima = (dataChuva[i].temperaturaMaxima / 24).toFixed(2);
        dataChuva[i].temperaturaInstantanea = (dataChuva[i].temperaturaInstantanea / 24).toFixed(2);

        dataChuva[i].umidadeMinima = (dataChuva[i].umidadeMinima / 24).toFixed(2);
        dataChuva[i].umidadeMaxima = (dataChuva[i].umidadeMaxima / 24).toFixed(2);
        dataChuva[i].umidadeInstantanea = (dataChuva[i].umidadeInstantanea / 24).toFixed(2);

        dataChuva[i].pressaoAtmosfericaMinima = (dataChuva[i].pressaoAtmosfericaMinima / 24).toFixed(2);
        dataChuva[i].pressaoAtmosfericaMaxima = (dataChuva[i].pressaoAtmosfericaMaxima / 24).toFixed(2);
        dataChuva[i].pressaoAtmosfericaInstantanea = (dataChuva[i].pressaoAtmosfericaInstantanea / 24).toFixed(2);
    }
}

function pegarFazenda(name) {
    var talhoesGenericos = ['Mon. BE 1', 'Mon. BE 2', 'BE - Mon. 1', 'BE - Mon. 2', 'BE - Prev.',
        'BR - Prev.', 'BR - Mon.', 'SS - Prev.', 'SS - Mon.', 'PL - Prev.', 'PL - Mon.', 'VG-5A', 'VG-03 Genécio', 'Fazenda Segredo - monitoramento 2',
        'Fazenda Segredo - monitoramento 1', 'Fazenda Boa Vista - Paulo Bufon', 'Paineira', 'Tropical 2', 'Sede', 'Fazenda Pindaíbas - Monitoramento 1',
        'Fazenda Pindaíbas - Previsão', 'Fazenda Pindaíbas - Monitoramento 2', 'Fazenda Segredo - Paulo Bufon', 'Boa Esperança']

    var fazendas = ['Boa Esperaça', 'Boa Esperaça', 'Boa Esperaça', 'Boa Esperaça', 'Boa Esperaça',
        'Brasilanda', 'Brasilanda', 'São Sebastião', 'São Sebastião', 'Planalto', 'Planalto', 'VARGEM GRANDE', 'VARGEM GRANDE', 'SEGREDO',
        'SEGREDO', 'BOA VISTA', 'TROPICAL', 'TROPICAL', 'TROPICAL', 'PINDAÍBAS', 'PINDAÍBAS', 'PINDAÍBAS', 'SEGREDO', 'TROPICAL']

    for (var i = 0; i < talhoesGenericos.length; i++) {
        if (name == talhoesGenericos[i]) {
            return fazendas[i]
        }
    }

    return name
}

function pegarNomeAssociado(name) {

    if (name == "VG-03 Genécio" || name == 'VG-5A') {
        return "Agropecuária Peeters"
    } else if (name == "Fazenda Segredo - monitoramento 2" || name == "Fazenda Segredo - monitoramento 1"
        || name == "Fazenda Boa Vista - Paulo Bufon" || name == "Fazenda Segredo - Paulo Bufon") {
        return "GRUPO SEGREDO"
    } else if (name == "Paineira" || name == "Tropical 2" || name == "Boa Esperança" || name == "Sede") {
        return "Mario Maria Mateus Van Den Broek"
    } else if (name == "Fazenda Pindaíbas - Monitoramento 1" || name == "Fazenda Pindaíbas - Previsão"
        || name == "Fazenda Pindaíbas - Monitoramento 2") {
        return "José Oscar Durigan"
    } else if (name == "Fazenda CIT") {
        return "CIT"
    }
    else {
        return "Grupo Kompier"
    }
}

function pegarTalhao(name) {


    var talhoesGenericos = ['Mon. BE 1', 'Mon. BE 2', 'BE - Mon. 1', 'BE - Mon. 2', 'BE - Prev.',
        'BR - Prev.', 'BR - Mon.', 'SS - Prev.', 'SS - Mon.', 'PL - Prev.', 'PL - Mon.', 'VG-5A', 'VG-03 Genécio', 'Fazenda Segredo - monitoramento 2',
        'Fazenda Segredo - monitoramento 1', 'Fazenda Boa Vista - Paulo Bufon', 'Paineira', 'Tropical 2', 'Sede', 'Fazenda Pindaíbas - Monitoramento 1',
        'Fazenda Pindaíbas - Previsão', 'Fazenda Pindaíbas - Monitoramento 2', 'Fazenda Segredo - Paulo Bufon', 'Boa Esperança']

    var talhoesVerdadeiros = ['9', '2', '3', '8', '6',
        '1', '4', '1', '7', '1', '3', 'VG-5A', 'VG-03A', 'PEQUI', 'IVO 2', '03', 'Paineira', 'Tropical 2', 'Gleba 3', '10', '09',
        '01', 'SEDE', 'BOA ESPERANÇA B']

    for (var i = 0; i < talhoesGenericos.length; i++) {
        if (name == talhoesGenericos[i]) {
            return talhoesVerdadeiros[i]
        }
    }

    return name
}

function preencherData(data, dadoEstacao) {


    //console.log("Processando")
    for (var i = 0; i < dataChuva.length; i++) {
        if (dataChuva[i].data == data) {
            dataChuva[i].chuva = dataChuva[i].chuva + parseFloat(dadoEstacao.rain);
            //Linha abaixo foi comentada pois gera bug e a chuva vira string
            //dataChuva[i].chuva = parseFloat(dataChuva[i].chuva).toFixed(2)

            dataChuva[i].temperaturaMinima = dataChuva[i].temperaturaMinima + parseFloat(dadoEstacao.temperatureMin)
            dataChuva[i].temperaturaMaxima = dataChuva[i].temperaturaMaxima + parseFloat(dadoEstacao.temperatureMax);
            dataChuva[i].temperaturaInstantanea = dataChuva[i].temperaturaInstantanea + parseFloat(dadoEstacao.temperatureInst);

            dataChuva[i].umidadeMinima = dataChuva[i].umidadeMinima + parseFloat(dadoEstacao.humidityMin);

            dataChuva[i].umidadeMaxima = dataChuva[i].umidadeMaxima + parseFloat(dadoEstacao.humidityMax);
            dataChuva[i].umidadeInstantanea = dataChuva[i].umidadeInstantanea + parseFloat(dadoEstacao.humidityInst);

            dataChuva[i].pressaoAtmosfericaMinima = dataChuva[i].pressaoAtmosfericaMinima + parseFloat(dadoEstacao.atmosphericPressureMin);
            dataChuva[i].pressaoAtmosfericaMaxima = dataChuva[i].pressaoAtmosfericaMaxima + parseFloat(dadoEstacao.atmosphericPressureMax);
            dataChuva[i].pressaoAtmosfericaInstantanea = dataChuva[i].pressaoAtmosfericaInstantanea + parseFloat(dadoEstacao.atmosphericPressureInst);

            return;
        }
    }

    var objetoDataChuva = {
        data: data,
        chuva: parseFloat(dadoEstacao.rain),
        temperaturaMinima: parseFloat(dadoEstacao.temperatureMin),
        temperaturaMaxima: parseFloat(dadoEstacao.temperatureMax),
        temperaturaInstantanea: parseFloat(dadoEstacao.temperatureInst),
        umidadeMinima: parseFloat(dadoEstacao.humidityMin),
        umidadeMaxima: parseFloat(dadoEstacao.humidityMax),
        umidadeInstantanea: parseFloat(dadoEstacao.humidityInst),
        pressaoAtmosfericaMinima: parseFloat(dadoEstacao.atmosphericPressureMin),
        pressaoAtmosfericaMaxima: parseFloat(dadoEstacao.atmosphericPressureMax),
        pressaoAtmosfericaInstantanea: parseFloat(dadoEstacao.atmosphericPressureInst),
    }

    dataChuva[dataChuva.length] = objetoDataChuva;



}
