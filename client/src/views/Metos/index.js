import React, { useState, useEffect } from 'react';
import Drawer from '../../components/Drawer'
import Theme from '../../Theme'
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import DataRangePicker from '../../components/DataRangePicker';
import Autocomplete from '../../components/Autocomplete';
import keys from '../../dados.json'
import Button from '@material-ui/core/Button';
import Loading from '../../components/Loading'
import { gerarVetorXLSX, exportarXLSX } from '../../global/Utils'
import Icon from '@mdi/react'
import { mdiDownload } from '@mdi/js';
import $ from 'jquery';

export default function Metos() {

    const [isBusy, setIsBusy] = useState(false);
    const [buffer, setBuffer] = useState(10);
    const [progress, setProgress] = useState(0);
    const [selectedDate, setSelectedDate] = React.useState([null, null]);
    const [selectedProducer, setSelectedProducer] = React.useState([]);
    const [producerSelect, setProdutoresSelect] = useState([]);
    const [showAutoComplete, setShowAutoComplete] = useState(false)

    useEffect(() => {
        let array = new Array();

        keys[0].dados.map(oneKey => {
            array.push(oneKey);
        })

        setProdutoresSelect(array);
        setSelectedProducer(array)
        setShowAutoComplete(true)
    }, [])

    const classes = Theme();

    function changeDataRangePicker(date) {
        setSelectedDate(date)
    }

    function changeAutocomplete(date) {
        setSelectedProducer(date)
    }

    function processarDadosMetos(dados) {

        let associados = new Array();

        for (var i = 0; i < dados.length; i++) {
            let associado = {
                nomeProdutor: dados[i].nome_associado,
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
                    console.log(associado.nomeProdutor)
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

        associados.forEach(umProdutor => {
            umProdutor.estacoes.forEach(umaEstacao => {
                let array = new Array();
                umaEstacao.pluviometria.forEach(umPluviometro => {
                    let date = new Date(umPluviometro.data)
                    date.setDate(date.getDate() + 1)
                    date.setHours(0, 0, 0, 0);

                    if (date >= selectedDate[0] && date <= selectedDate[1]) {
                        date.setHours(1, 0, 0, 0);
                        array.push({
                            data: date,
                            pluviometria: umPluviometro.pluviometria
                        })
                    }
                })
                umaEstacao.pluviometria = array;
            })
        })

        setIsBusy(false);

        exportarXLSX(gerarVetorXLSX(associados, "METOS"), "METOS")

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


        return somarPluviometria(arrayChuvaCompleta);

    }

    function somarPluviometria(arrayChuvaCompleta) {

        let arrayDatasFiltradas = retirarDatas(arrayChuvaCompleta)

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
                arrayDatasFiltradas.push({
                    data: arrayChuvaCompleta[i].data,
                    pluviometria: 0
                })
            }

        }

        return arrayDatasFiltradas;

    }

    async function pegarPluviometriaMetos(idEstacao, publicKey, privateKey, dias) {

        let pluviometro;

        await $.ajax({
            url: 'http://127.0.0.1:5000//pegarPluviometriaMETOS',
            data: {
                "idEstacao": idEstacao,
                "publicKey": publicKey,
                "privateKey": privateKey,
                "dias": dias
            },
            type: 'POST',
        }).done(function (response) {
            let teste = response;
            pluviometro = JSON.parse(teste);
        })

        return pluviometro;
    }

    async function pegarDadoEstacaoMETOS(idEstacao, publicKey, privateKey) {

        let dadoEstacao;

        await $.ajax({
            url: 'http://127.0.0.1:5000//pegarDadoEstacaoMETOS',
            data: {
                "idEstacao": idEstacao,
                "publicKey": publicKey,
                "privateKey": privateKey
            },
            type: 'POST',
        }).done(function (response) {
            let teste = response;
            dadoEstacao = JSON.parse(teste);
        })

        return dadoEstacao;
    }

    async function getDateFarmBox() {

        var Difference_In_Time = new Date() - selectedDate[0];
        var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

        setIsBusy(true);

        let associados = new Array();

        await Promise.all(producerSelect.map(async umDado => {
            await Promise.all(selectedProducer.map(async oneProducerSelected => {
                if (umDado.name == oneProducerSelected.name) {
                    let arrayPluviometriaProdutor = new Array();
                    let arrayDadoEstacaoProdutor = new Array();

                    let objetoProdutor = {
                        nome_associado: umDado.name,
                        arrayPluviometria: "",
                        arrayDadoEstacao: "",
                    }

                    await Promise.all(await umDado.estacoes.map(async umaEstacao => {
                        arrayPluviometriaProdutor.push(await pegarPluviometriaMetos(umaEstacao.idEstacao, umDado.publicKey, umDado.privateKey, Math.round((Difference_In_Days))))
                        arrayDadoEstacaoProdutor.push(await pegarDadoEstacaoMETOS(umaEstacao.idEstacao, umDado.publicKey, umDado.privateKey))
                    }))

                    objetoProdutor.arrayPluviometria = arrayPluviometriaProdutor;
                    objetoProdutor.arrayDadoEstacao = arrayDadoEstacaoProdutor;
                    associados.push(objetoProdutor)
                }
            }))

        }))

        processarDadosMetos(associados);

    }

    return (
        <div className={classes.root}>
            <Drawer name="Pluviometria - Metos" />
            <main className={classes.content}>
                <div className={classes.toolbar} />
                {isBusy && <Loading progress={progress} buffer={buffer} />}

                <Grid container spacing={3}>
                    <Grid item xs={12}>

                    </Grid>
                    <Grid item xs={5}>
                        <Paper className={classes.paper}><DataRangePicker onChange={changeDataRangePicker} selectedDate={selectedDate} /></Paper>
                    </Grid>
                    <Grid item xs={6}>
                        {showAutoComplete ?
                            <Paper className={classes.paper}><Autocomplete keys={producerSelect} change={changeAutocomplete} multiple={true} /></Paper>
                            :
                            < Paper className={classes.paper}>Carregando ...</Paper>
                        }
                    </Grid>
                    <Grid item xs={3}>

                    </Grid>
                    <Grid item xs={3}>

                    </Grid>
                    <Grid item xs={3}>

                    </Grid>
                    <Grid item xs={3}>
                        <Button onClick={getDateFarmBox} variant="contained" endIcon={<Icon path={mdiDownload} size={1} />} disabled={isBusy}>
                            Downloads
                        </Button>
                    </Grid>
                </Grid>
            </main>
        </div >
    )
}
