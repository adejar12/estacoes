import XLSX from 'xlsx';

export function exportarXLSX(vetor, id) {

    var workbook = XLSX.utils.book_new();
    let wb = XLSX.utils.aoa_to_sheet((vetor));

    XLSX.utils.book_append_sheet(workbook, wb, id)

    XLSX.writeFile(workbook, `Dados ${id}.xlsx`)

}

export function gerarVetorXLSX(array, id) {

    let linha = new Array();
    let conteudo = new Array();
    if (id == "Zeus") {
        linha.push("PRODUTOR", "LATITUDE", "LONGITUDE", "FAZENDA", "DATA", "PLUVIOMETRIA"
            , "TEMPERATURA MINIMA", "TEMPERATURA MAXIMA", "TEMPERATURA INSTANTANEA", "UMIDADE MINIMA", "UMIDADE MAXIMA",
            "UMIDADE INSTANTANEA", "PRESSÃO ATMOSFERICA MINIMA", "PRESSÃO ATMOSFERICA MAXIMA",
            "PRESSÃO ATMOSFERICA INSTANTANEA");
    } else {
        linha.push("PRODUTOR", "LATITUDE", "LONGITUDE", "FAZENDA", "DATA", "PLUVIOMETRIA");
    }
    conteudo.push(linha)
    linha = [];
    if (id == "Protector") {
        array.forEach(oneProductor => {
            if (oneProductor.chuvas.length != 0) {
                oneProductor.chuvas.forEach(umaChuva => {
                    linha = [];
                    linha.push(oneProductor.productor)
                    linha.push(oneProductor.latitude)
                    linha.push(oneProductor.longitude)
                    linha.push(oneProductor.fazenda)
                    linha.push(toDate(umaChuva.data))
                    linha.push(umaChuva.pluviometria)
                    conteudo.push(linha)
                });
            }


        });


    } else if (id == "Farmbox") {
        array.forEach(oneProductor => {
            linha = [];
            linha.push(oneProductor.productor)
            linha.push(oneProductor.latitude)
            linha.push(oneProductor.longitude)
            linha.push(oneProductor.fazenda)
            linha.push(toDate(oneProductor.data))
            linha.push(oneProductor.pluviometria)
            linha.push(oneProductor.safra)
            conteudo.push(linha)
        });
    } else if (id == "Zeus") {
        array.forEach(oneProductor => {
            oneProductor.dataChuva.forEach(umaChuva => {
                linha = [];
                linha.push(oneProductor.productor)
                linha.push(oneProductor.latitude)
                linha.push(oneProductor.longitude)
                linha.push(oneProductor.fazenda)
                linha.push(toDate(umaChuva.data))
                linha.push(umaChuva.chuva)
                linha.push(umaChuva.temperaturaMinima)
                linha.push(umaChuva.temperaturaMaxima)
                linha.push(umaChuva.temperaturaInstantanea)
                linha.push(umaChuva.umidadeMinima)
                linha.push(umaChuva.umidadeMaxima)
                linha.push(umaChuva.umidadeInstantanea)
                linha.push(umaChuva.pressaoAtmosfericaMinima)
                linha.push(umaChuva.pressaoAtmosfericaMaxima)
                linha.push(umaChuva.pressaoAtmosfericaInstantanea)
                conteudo.push(linha)
            });

        });
    } else if (id == "METOS") {
        array.forEach(oneProductor => {
            oneProductor.estacoes.forEach(estacao => {
                estacao.pluviometria.forEach(umaPluviometria => {
                    linha = [];

                    linha.push(oneProductor.nomeProdutor)
                    linha.push(estacao.lagitude)
                    linha.push(estacao.longitude)
                    linha.push(estacao.fazenda)
                    linha.push(umaPluviometria.data)
                    linha.push(umaPluviometria.pluviometria)
                    conteudo.push(linha)
                });

            });

        });
    }
    return conteudo;
}

function toDate(dateStr) {
    var parts = dateStr.split("/");
    let date = new Date(parts[2], parts[1] - 1, parts[0])
    date.setHours(1, 0, 0, 0);
    return date;
}
