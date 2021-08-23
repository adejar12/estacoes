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
    linha.push("ASSOCIADO", "LATITUDE", "LONGITUDE", "FAZENDA", "DATA", "PLUVIOMETRIA");
    conteudo.push(linha)
    linha = [];
    if (id == "Protector") {
        array.forEach(umAssociado => {
            if (umAssociado.chuvas.length != 0) {
                umAssociado.chuvas.forEach(umaChuva => {
                    linha = [];
                    linha.push(umAssociado.associado)
                    linha.push(umAssociado.latitude)
                    linha.push(umAssociado.longitude)
                    linha.push(umAssociado.fazenda)
                    linha.push(toDate(umaChuva.data))
                    linha.push(umaChuva.pluviometria)
                    conteudo.push(linha)
                });
            }


        });


    } else if (id == "Farmbox") {
        array.forEach(umAssociado => {
            linha = [];
            linha.push(umAssociado.associado)
            linha.push(umAssociado.latitude)
            linha.push(umAssociado.longitude)
            linha.push(umAssociado.fazenda)
            linha.push(toDate(umAssociado.data))
            linha.push(umAssociado.pluviometria)
            linha.push(umAssociado.safra)
            conteudo.push(linha)
        });
    } else if (id == "Zeus") {
        array.forEach(umAssociado => {
            umAssociado.dataChuva.forEach(umaChuva => {
                linha = [];
                linha.push(umAssociado.associado)
                linha.push(umAssociado.latitude)
                linha.push(umAssociado.longitude)
                linha.push(umAssociado.fazenda)
                linha.push(toDate(umaChuva.data))
                linha.push(umaChuva.chuva)
                conteudo.push(linha)
            });

        });
    } else if (id == "METOS") {
        array.forEach(associado => {
            associado.estacoes.forEach(estacao => {
                estacao.pluviometria.forEach(umaPluviometria => {
                    linha = [];

                    linha.push(associado.nomeAssociado)
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
