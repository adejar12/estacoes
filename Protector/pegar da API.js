//Variavel utilizada pela Zeus e Farmbox
var dataChuva = new Array()

document.addEventListener("DOMContentLoaded", async function () {

    await pegarDadosProtector();
   await pegarDadosMETOS()
    await pegarDadosFarmBox()
    await pegarDadosZeus()

});

/** PROTECTOR */

async function pegarDadosProtector() {
    var arrayFinal = new Array();

    let token = await pegarToken();
    let empresa = await pegarEmpresa(token.access_token);
    let propriedades = await pegarPropriedades(token.access_token, empresa[0].id);
    let i = 1;

    await propriedades.content.map(async (umaPropriedade) => {

        let res = umaPropriedade.name.split("-")

        let dado = {
            associado: res[0],
            fazenda: res[1],
            latitude: "",
            longitude: "",
            chuvas: "",
        }

        let pontosStaticos = await pegarPluviometria(token.access_token, empresa[0].id, umaPropriedade.id)
        
        pontosStaticos.map((umPontoStatico) => {
            if (umPontoStatico.static_point.class_name == "pluviometer") {
                dado.latitude = umPontoStatico.static_point.location.lat;
                dado.longitude = umPontoStatico.static_point.location.lng;

                let arrayChuvas = new Array();

                umPontoStatico.analytic_results_histogram.result_histogram.map((umHistograma) => {

                    let dadoChuva = {
                        data: new Date(umHistograma.local_date).toLocaleDateString(),
                        pluviometria: umHistograma.indicators[0].value
                    }
                    arrayChuvas.push(dadoChuva)
                })

                dado.chuvas = arrayChuvas;
            }
        })

        console.log("Pegando dados do Protector")

        arrayFinal.push(dado)
    

        if (i == propriedades.content.length) {
            exportarXLSX(gerarVetorXLSX(arrayFinal,"Protector"),"Protector")
        }
        i++;

    })
}

function exportarXLSX(vetor,id) {

        var workbook = XLSX.utils.book_new();
        let wb = XLSX.utils.aoa_to_sheet((vetor));
    
        XLSX.utils.book_append_sheet(workbook, wb, id)
    
        XLSX.writeFile(workbook, `Dados ${id}.xlsx`)

}

function gerarVetorXLSX(array,id) {

    let linha = new Array();
    let conteudo = new Array();
    linha.push("ASSOCIADO", "LATITUDE", "LONGITUDE", "FAZENDA", "DATA", "PLUVIOMETRIA");
    conteudo.push(linha)
    linha = [];
    if(id == "Protector"){
        array.forEach(umAssociado => {
            if (umAssociado.chuvas.length != 0) {
                umAssociado.chuvas.forEach(umaChuva => {
                    linha = [];
                    linha.push(umAssociado.associado)
                    linha.push(umAssociado.latitude)
                    linha.push(umAssociado.longitude)
                    linha.push(umAssociado.fazenda)
                    linha.push(umaChuva.data)
                    linha.push(umaChuva.pluviometria)
                    conteudo.push(linha)
                });
            }
    
    
        });
    

    }else if(id == "Farmbox"){
        array.forEach(umAssociado => {
                linha = [];
                linha.push(umAssociado.associado)
                linha.push(umAssociado.latitude)
                linha.push(umAssociado.longitude)
                linha.push(umAssociado.fazenda)
                linha.push(umAssociado.data)
                linha.push(umAssociado.pluviometria)
                linha.push(umAssociado.safra)
                conteudo.push(linha)   
        });
    }else if(id == "Zeus"){
        array.forEach(umAssociado => {
            umAssociado.dataChuva.forEach(umaChuva => {
                linha = [];
                linha.push(umAssociado.associado)
                linha.push(umAssociado.latitude)
                linha.push(umAssociado.longitude)
                linha.push(umAssociado.fazenda)
                linha.push(umaChuva.data)
                linha.push(umaChuva.chuva)
                conteudo.push(linha) 
            });
           
        });
    }else if(id == "METOS"){
        array.forEach(associado => {
            associado.estacoes.forEach(estacao => {
                estacao.pluviometria.forEach(umaPluviometria => {
                    linha = [];
                    linha.push(associado.nomeAssociado)
                    linha.push(estacao.lagitude)
                    linha.push(estacao.longitude)
                    linha.push(estacao.fazenda)
                    linha.push(new Date(umaPluviometria.data))
                    linha.push(umaPluviometria.pluviometria)
                    conteudo.push(linha)
                });
    
            });
    
        });
    }
    return conteudo;
}

async function pegarPropriedades(token, idEmpresa) {

    let propriedades;
    //Size é a quantidade de propriedades que quero

    var dado = {
        "url": `https://api.beta.protector.strider.ag/v1/companies/${idEmpresa}/properties`,
        "method": "GET",
        "timeout": 0,
        "headers": {
            "authorization": `Bearer ${token}`,
        },
        "data": {
            "page": "0",
            "size": "40",
        }

    };

    await $.ajax(dado).done(function (response) {
        propriedades = response;
    });

    return propriedades;

}

async function pegarEmpresa(token) {

    let empresa;

    var dado = {
        "url": "https://api.beta.protector.strider.ag/v1/panel/companies/",
        "method": "GET",
        "timeout": 0,
        "headers": {
            "authorization": `Bearer ${token}`,
        },
        "data": {
            "includePropertyCount": "yes",
            "includeTotalArea": "yes",
            "includeCrops": "yes",
            "IncludeSeasons": "yes"
        }

    };

    await $.ajax(dado).done(function (response) {
        empresa = response;
    });

    return empresa;

}

async function pegarToken() {

    var dadosLogin = {
        "url": "https://api.beta.protector.strider.ag/oauth/token",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "authorization": "Basic cHJvdGVjdG9yOnBhc3NvbGFyZ28=",
        },
        "data": {
            "grant_type": "password",
            "username": "adejar.junior@gapescna.agr.br",
            "password": "Gapes@2020"
        }

    };

    let token

    await $.ajax(dadosLogin).done(function (response) {
        token = response;
    });

    return token;
}

async function pegarPluviometria(token, idEmpresa, idPropriedade) {

    let pluviometro;

    await $.ajax({
        url: 'http://127.0.0.1:5000//pegarPluviometria',
        data: {
            "idPropriedade": idPropriedade,
            "idEmpresa": idEmpresa,
            "token": token
        },
        type: 'POST',
    }).done(function (response) {
        let teste = response;
        pluviometro = JSON.parse(teste);
    })

    return pluviometro;

}

/** METOS */

async function pegarDadosMETOS() {

    let arrayDados = new Array();
    let associados = new Array();

    
    arrayDados.push({
        publicKey: "01defad324f0b92a3f8f5c6aa55ac0d79c21b347e588c62f",
        privateKey: "72eaa0f73ae8cd7dcc996156ced847eb144ba8adba8e7d54",
        associado: 'Aredison',
        estacoes:[
            {idEstacao:"002042EE"},
            {idEstacao:"002042FB"},
        ]
    },{
        publicKey: "6c542b517c6382be0bcdb05aa0c2cf3451ec286600ed6d94",
        privateKey: "cc1460b5355a10a453c4a0880ce743444c4d654d3b69cb6c",
        associado: 'Flávio Faedo',
        estacoes:[
            {idEstacao:"00205549"}
        ]
    },{
        publicKey: "3da06d1851b923fefdb7f4452ad7a4ee323e87c7e9ddaa58",
        privateKey: "f766b2686b564ef76ed3d9bc6bd997e0030a07597ba39093",
        associado: 'Grupo Kompier',
        estacoes:[
            {idEstacao:"00203D6C"}
        ]
    },{
        publicKey: "9da55278fdae931bc39fca80e616ea9e8af077929f3f4b56",
        privateKey: "173e56905c956c7d355143065f532cdb6e096c3ca720a5e0",
        associado: 'Grupo Segredo',
        estacoes:[
            {idEstacao:"00203D7F"}
        ]
    },{
        publicKey: "b6a5ad748a15ba37d71863c0cbaff4185b3b0630b558f8f1",
        privateKey: "3326a2459102cc1e8aa7a30259d9bf4fd7c8a0562dcdbaa5",
        associado: 'Irmãos VanVlit',
        estacoes:[
            {idEstacao:"002042EC"},
            {idEstacao:"01204C5B"},
            {idEstacao:"01204C5C"},
            {idEstacao:"01206CEA"},
            {idEstacao:"01206CEE"},
        ]
    },{
        publicKey: "d24fe12fdfb48be1161bdbd599513b1828a93c93dcc53114",
        privateKey: "ff3859cd688e7fe9bac7a737b06e1b6ef65c545c13da1d11",
        associado: 'Flávia',
        estacoes:[
            {idEstacao:"00205366"}
        ]
    });

    await Promise.all(arrayDados.map(async umDado =>{
  
        let arrayPluviometriaAssociado = new Array();
        let arrayDadoEstacaoAssociado = new Array();

        let objetoAssociado = {
            nome_associado:umDado.associado,
            arrayPluviometria: "",
            arrayDadoEstacao:"",
        }

        await Promise.all(await umDado.estacoes.map(async umaEstacao =>{
                arrayPluviometriaAssociado.push(await pegarPluviometriaMetos(umaEstacao.idEstacao, umDado.publicKey,umDado.privateKey))
                arrayDadoEstacaoAssociado.push(await pegarDadoEstacaoMETOS(umaEstacao.idEstacao, umDado.publicKey,umDado.privateKey))
        }))
      
        objetoAssociado.arrayPluviometria = arrayPluviometriaAssociado;
        objetoAssociado.arrayDadoEstacao = arrayDadoEstacaoAssociado;
        associados.push(objetoAssociado)

    }))

    processarDadosMetos(associados);

}

function processarDadosMetos(dados){

    let associados = new Array();


    for (var i = 0; i < dados.length; i++) {
        let associado = {
            nomeAssociado: dados[i].nome_associado,
            estacoes: "",
        }

        let arrayDadoEstacao = dados[i].arrayDadoEstacao
        let arrayPluviometria = dados[i].arrayPluviometria;
        let estacoes = new Array();

  
        for (var j = 0; j < arrayDadoEstacao.length; j++) {

            let somaChuva;

            for (var k = 0; k < arrayPluviometria[j].data.length; k++) {
                let data = arrayPluviometria[j].data[k];
                if (data.name == "Precipitação" || data.name == "Precipitation") {
                    somaChuva = data.values.sum;
                }
            }

            if (somaChuva == null) {
                console.log(associado.nomeAssociado)
            }


            let objectEstacao = {

                longitude: "",
                lagitude: "",
                altitude: "",
                pluviometria: mesclarDataPluviometria(somaChuva, arrayPluviometria[j].dates),
                fazenda: arrayDadoEstacao[j].name.custom
            }

            objectEstacao.altitude = arrayDadoEstacao[j].position.altitude;
            objectEstacao.longitude = arrayDadoEstacao[j].position.geo.coordinates[0];
            objectEstacao.lagitude = arrayDadoEstacao[j].position.geo.coordinates[1];

            estacoes.push(objectEstacao)
            }

        associado.estacoes = estacoes
        associados.push(associado)

    }

    exportarXLSX(gerarVetorXLSX(associados,"METOS"),"METOS")


}

function mesclarDataPluviometria(somas, datas) {

    let arrayChuvaCompleta = new Array();

    for (var i = 0; i < somas.length; i++) {

        let chuva = {
            data: datas[i].toString().split(" ")[0],
            pluviometria: somas[i]
        }

        arrayChuvaCompleta.push(chuva);
    }

    let arrayDatasFiltradas = retirarDatas(arrayChuvaCompleta)

    return somarPluviometria(arrayChuvaCompleta, arrayDatasFiltradas)


}

function somarPluviometria(arrayChuvaCompleta, arrayDatasFiltradas) {


    for (var i = 1; i < arrayDatasFiltradas.length; i++) {

        for (var j = 0; j < arrayChuvaCompleta.length; j++) {
            if (arrayDatasFiltradas[i].data == arrayChuvaCompleta[j].data) {

                arrayDatasFiltradas[i].pluviometria += arrayChuvaCompleta[j].pluviometria
            }
        }

    }

    return arrayDatasFiltradas


}

function retirarDatas(arrayChuvaCompleta) {

    let arrayDatasFiltradas = new Array();


    for (var i = 0; i < arrayChuvaCompleta.length; i++) {
        let possui = false;
        for (var j = 0; j < arrayDatasFiltradas.length; j++) {
            if (arrayChuvaCompleta[i].data == arrayDatasFiltradas[j].data) {
                possui = true;
            }
        }

        if (possui == false) {
            arrayChuvaCompleta[i].pluviometria = 0;
            arrayDatasFiltradas.push(arrayChuvaCompleta[i])
        }

    }

    return arrayDatasFiltradas;

}

async function pegarPluviometriaMetos(idEstacao,publicKey,privateKey){

    let pluviometro;

    await $.ajax({
        url: 'http://127.0.0.1:5000//pegarPluviometriaMETOS',
        data: {
            "idEstacao": idEstacao,
            "publicKey":publicKey,
            "privateKey": privateKey
        },
        type: 'POST',
    }).done(function (response) {
        let teste = response;
        pluviometro = JSON.parse(teste);
    })

    return pluviometro;
}

async function pegarDadoEstacaoMETOS(idEstacao,publicKey,privateKey){

    let dadoEstacao;

    await $.ajax({
        url: 'http://127.0.0.1:5000//pegarDadoEstacaoMETOS',
        data: {
            "idEstacao": idEstacao,
            "publicKey":publicKey,
            "privateKey": privateKey
        },
        type: 'POST',
    }).done(function (response) {
        let teste = response;
        dadoEstacao = JSON.parse(teste);
    })

    return dadoEstacao;
}

/** FarmBox */

async function pegarDadosFarmBox() {
    dataChuva = new Array();

    let arrayDados = new Array();

   arrayDados.push({
        chave: "pAZjOxquDteDEfzyRuVERw",
        associado: 'FABIANO FERRARI',
        minimo: 45,
        maximo: 65
    },{
        chave: "07bv6rPK_yHvJ0il90lu-g",
        associado: 'Vam Ass',
        minimo: 127,
        maximo: 170
    },{
        chave: "cxNjer3qUrfnlJZPcfkv5Q",
        associado: 'Cereal Ouro',
        minimo: 340,
        maximo: 380
    },{
        chave: "rs8pOBu4ro9pBBQ4Gj8LZg",
        associado: 'Schwening',
        minimo: 220,
        maximo: 250
    },{
        chave: "oyJBmxbs4ZgRv-IT4ew0GQ",
        associado: 'Sementes São Francisco',
        minimo: 750,
        maximo: 800
    },{
        chave: "R_ZGjrqxWKjb0Wuy_Dpmig",
        associado: 'Tulio',
        minimo: 25,
        maximo: 30
    });

    let associados = new Array();

    await Promise.all(arrayDados.map(async umDado =>{
 
        let arrayPluviometriaAssociado = new Array();

        let objetoAssociado = {
            associado:umDado.associado,
            arrayPluviometria: ""
        }

        for (var i = umDado.minimo; i < umDado.maximo; i++) {
            console.log("Pegando dados do Farmbox")
            let object = await pegarPluviometriaFarmBox(umDado.chave, i)
            try{
                if(object.pluviometer_monitorings.length == 0){
                    console.log(`O associado: ${umDado.associado} acabou o máximo no: ${i}`)
                    i = umDado.maximo;
                }else{
                    arrayPluviometriaAssociado.push(object)
                }
            }catch{
                console.log(object)
            }


        }

        objetoAssociado.arrayPluviometria = arrayPluviometriaAssociado
        associados.push(objetoAssociado)
    
    }))
  
    processarDadosFarmbox(associados);

    exportarXLSX(gerarVetorXLSX(dataChuva,"Farmbox"),"Farmbox")

}

function processarDadosFarmbox(dadosBrutos){

    for (var j = 0; j < dadosBrutos.length; j++) {
   
        dadosBrutos[j].arrayPluviometria.map(umArrayPluviometrico =>{

        let pluviometer_monitorings =umArrayPluviometrico.pluviometer_monitorings;

        for (var i = 0; i < pluviometer_monitorings.length; i++) {
    
            let data = new Date(pluviometer_monitorings[i].date)

            let pluviometria = parseFloat(pluviometer_monitorings[i].quantity);
            let latitude = pluviometer_monitorings[i].pluviometer.plantations[0].centroid.lat;
            let longitude = pluviometer_monitorings[i].pluviometer.plantations[0].centroid.lng;
            let fazenda = pluviometer_monitorings[i].pluviometer.plantations[0].farm.name
            let talhoes = pluviometer_monitorings[i].pluviometer.plantations;

            talhoes.map(umTalhao =>{

                adicionarDado(latitude, longitude, pluviometria, data.toLocaleDateString(), dadosBrutos[j].associado, fazenda,umTalhao.plot.name,"SEPARAR POR TALHÕES",umTalhao.harvest_name)
            })

        }
    })

    }

    //Tirando a media dos talhões repetidos

  dataChuva.map(umDado =>{
        if(umDado.nVezesRepetido > 1){
            umDado.pluviometria = parseFloat((umDado.pluviometria/umDado.nVezesRepetido).toFixed(1));
        }
    })

    let arrayAux = dataChuva;
    dataChuva = new Array();

    arrayAux.map(umDado =>{
            adicionarDado(umDado.latitude, umDado.longitude, umDado.pluviometria, umDado.data, umDado.associado, umDado.fazenda,"","JUNTAR TALHÕES",umDado.safra)
    })

    //tirando a média da fazenda toda
    //Para exportar o total dos talhões, comente esse for
    dataChuva.map(umDado =>{
        if(umDado.nVezesRepetido > 1){
            umDado.pluviometria = parseFloat((umDado.pluviometria/umDado.nVezesRepetido).toFixed(1));
        }
    })

}

function adicionarDado(latitude, longitude, pluviometria, data, associado, fazenda,talhao,id,safra) {

    let existe = false;

    if (dataChuva.length == 0) {
        dataChuva[0] = {
            pluviometria: pluviometria,
            latitude: latitude,
            longitude: longitude,
            data: data,
            associado: associado,
            fazenda: fazenda,
            talhao:talhao,
            nVezesRepetido:1,
            safra:safra
        }

        return;
    }

    if(id == "SEPARAR POR TALHÕES"){
        for (var i = 0; i < dataChuva.length; i++) {
            if (latitude == dataChuva[i].latitude &&
                longitude == dataChuva[i].longitude &&
                data == dataChuva[i].data&&
                talhao == dataChuva[i].talhao &&
                safra == dataChuva[i].safra) {
                dataChuva[i].pluviometria+= pluviometria
                dataChuva[i].nVezesRepetido = dataChuva[i].nVezesRepetido + 1
                existe = true;
            }
        }
    }else{
        for (var i = 0; i < dataChuva.length; i++) {
            if (data == dataChuva[i].data &&
                safra == dataChuva[i].safra) {
                dataChuva[i].pluviometria += pluviometria
                dataChuva[i].nVezesRepetido = dataChuva[i].nVezesRepetido + 1
                existe = true;
            }
        }
    }



    if (existe == false) {
        dataChuva.push({
            pluviometria: pluviometria,
            latitude: latitude,
            longitude: longitude,
            data: data,
            associado: associado,
            fazenda: fazenda,
            talhao:talhao,
            nVezesRepetido:1,
            safra:safra
        })
    }


}


async function pegarPluviometriaFarmBox(chaveAssociado, pagina) {
    let pluviometro;

    await $.ajax({
        url: 'http://127.0.0.1:5000//pegarPluviometriaFarmBox',
        data: {
            "chaveAssociado": chaveAssociado,
            "pagina": pagina
        },
        type: 'POST',
    }).done(function (response) {
        let teste = response;
        pluviometro = JSON.parse(teste);
        
    })

    return pluviometro;

}

/** Zeus */

async function pegarDadosZeus() {
    dataChuva = new Array();
    var usuario;
    var associados;
    var arrayFinal = new Array();

    usuario = await pegarUsuario();
    associados = await pegarAssociados(usuario);
 
    for (var i = 0; i < associados.length; i++) {

        var parar = false;
        var dadoEstacao = new Array();
        date = new Date();

        for (var j = 0; j < 7; j++) {
            //Use o while para pegar TODOS os dados
            //while (parar == false) {

            var dadosEscacaoTemporario = new Array();

            dadosEscacaoTemporario = await pegarDadoEstacao(usuario, associados[i], date)
            //Reative o IF para pegar TODOS os dados
            // if (dadosEscacaoTemporario.length != 0) {
            dadoEstacao = dadoEstacao.concat(dadosEscacaoTemporario);
            // } else {
            //   parar = true;
            //}

            //}
        }

        var objetoFinal = {
            associado: associados[i],
            dadoEstacao: dadoEstacao
        }

        arrayFinal[arrayFinal.length] = objetoFinal;

    }

    processarDadosZeus(arrayFinal)
    exportarXLSX(gerarVetorXLSX(arrayFinal,"Zeus"),"Zeus")

}

function processarDadosZeus(associados){

    var dataAux = "";
    var controladorRepetidorData = 0;

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

async function pegarDadoEstacao(usuario, associado, date) {

    console.log("Pegando dados da Zeus")
    var dadoEstacao = new Array();

    var mes = parseInt(date.getMonth()) + 1;
    var dataNova = date.getFullYear() + "-" + mes + "-" + (date.getDate() - 1);

    date.setDate(date.getDate() - 7)
    var mes = parseInt(date.getMonth()) + 1;
    var dataPassada = date.getFullYear() + "-" + mes + "-" + date.getDate();

    var settings = {
        "url": "http://www.cropnet.us/api/v1/pics/" + associado.picId + "/monitoring?start=" + dataPassada + "&end=" + dataNova + "",
        "method": "GET",
        "timeout": 0,
        "headers": {
            "Authorization": usuario.user.token
        },
    };

    await $.ajax(settings).done(function (response) {
        dadoEstacao = response
    });


    return dadoEstacao;
}

async function pegarAssociados(usuario) {

    var associados;

    var associados = {
        "url": "http://www.cropnet.us/api/v1/pics",
        "method": "GET",
        "timeout": 0,
        "headers": {
            "Authorization": usuario.user.token
        },
    };

    await $.ajax(associados).done(function (response) {
        associados = response;
    });

    return associados;

}

async function pegarUsuario(dadosLogin) {

    var dadosLogin = {
        "url": "http://www.cropnet.us/api/v1/login",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json;charset=UTF-8",
            "Accept": "application/json, text/plain, */*"
        },
        "data": "{\"email\":\"api-client-gapes@zeusagro.com\",\"password\":\"gapes-Fi2c9Qm2\"}",

    };

    var usuario

    await $.ajax(dadosLogin).done(function (response) {
        usuario = response;
    });

    return usuario;
}
