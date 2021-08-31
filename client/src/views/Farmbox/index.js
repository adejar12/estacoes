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

export default function Farmbox() {

    const classes = Theme();

    const [selectedDate, setSelectedDate] = useState([null, null]);
    const [selectedProducer, setSelectedProducer] = useState([]);
    const [isBusy, setIsBusy] = useState(false);
    const [buffer, setBuffer] = useState(10);
    const [progress, setProgress] = useState(0);
    const [producerSelect, setProducerSelect] = useState([]);
    const [showAutoComplete, setShowAutoComplete] = useState(false)

    var dataChuva = new Array()


    useEffect(() => {
        let array = new Array();

        keys[3].dados.map(oneKey => {
            array.push(oneKey)
        })
        setProducerSelect(array);
        setSelectedProducer(array);
        setShowAutoComplete(true)
    }, [])

    function changeDataRangePicker(date) {
        setSelectedDate(date)
    }

    function changeAutocomplete(date) {
        setSelectedProducer(date)
    }

    async function getDateFarmBox() {
        setIsBusy(true);

        let producers = new Array();

        await Promise.all(producerSelect.map(async oneKey => {
            await Promise.all(selectedProducer.map(async (oneProducer, index) => {

                setProgress(index * 10);
                let objetoProdutor = {
                    productor: oneProducer.name,
                    arrayPluviometria: ""
                }
                if (oneKey.name === oneProducer.name) {

                    objetoProdutor.arrayPluviometria = await getRainFarmbox(oneKey.chave, 30)
                    producers.push(objetoProdutor)
                }
            }))
        }))

        processarDadosFarmbox(producers);
        setProgress(100);
        setIsBusy(false);

        exportarXLSX(gerarVetorXLSX(dataChuva, "Farmbox"), "Farmbox")

    }

    async function getRainFarmbox(key, pag) {
        let teste = new Date();

        let pluviometro;
        let stop = false;

        let arrayPluviometer = new Array();

        while (stop === false) {
            await $.ajax({
                url: 'http://127.0.0.1:5000//pegarPluviometriaFarmBox',
                data: {
                    "chaveProdutor": key,
                    "pagina": pag
                },
                type: 'POST',
            }).done(function (response) {
                let teste = response;
                pluviometro = JSON.parse(teste);
            })

            if (pluviometro.pluviometer_monitorings.length === 0) {
                stop = true;
            }

            pluviometro.pluviometer_monitorings.forEach(onePluviometer => {
                let date = new Date(onePluviometer.date)
                if (date >= selectedDate[0] && date <= selectedDate[1]) {
                    arrayPluviometer.push(onePluviometer);
                    console.log("PREENCHENDO ... ")
                }

                if (date > selectedDate[1]) {
                    stop = true
                }
            })

            if (buffer < 99) {
                setBuffer(buffer + 1);
            }

            pag++;

        }

        return arrayPluviometer;

    }

    function processarDadosFarmbox(dadosBrutos) {

        for (var j = 0; j < dadosBrutos.length; j++) {

            dadosBrutos[j].arrayPluviometria.map(umArrayPluviometrico => {

                let data = new Date(umArrayPluviometrico.date)

                let pluviometria = parseFloat(umArrayPluviometrico.quantity);
                let latitude = umArrayPluviometrico.pluviometer.plantations[0].centroid.lat;
                let longitude = umArrayPluviometrico.pluviometer.plantations[0].centroid.lng;
                let fazenda = umArrayPluviometrico.pluviometer.plantations[0].farm.name
                let talhoes = umArrayPluviometrico.pluviometer.plantations;

                talhoes.map(umTalhao => {
                    adicionarDado(latitude, longitude, pluviometria, data.toLocaleDateString(), dadosBrutos[j].productor, fazenda, umTalhao.plot.name, "SEPARAR POR TALHÕES", umTalhao.harvest_name)
                })

            })

        }

        //Tirando a media dos talhões repetidos

        dataChuva.map(umDado => {
            if (umDado.nVezesRepetido > 1) {
                umDado.pluviometria = parseFloat((umDado.pluviometria / umDado.nVezesRepetido).toFixed(1));
            }
        })

        let arrayAux = dataChuva;
        dataChuva = new Array();

        arrayAux.map(umDado => {
            adicionarDado(umDado.latitude, umDado.longitude, umDado.pluviometria, umDado.data, umDado.productor, umDado.fazenda, "", "JUNTAR TALHÕES", umDado.safra)
        })

        //tirando a média da fazenda toda
        //Para exportar o total dos talhões, comente esse for
        dataChuva.map(umDado => {
            if (umDado.nVezesRepetido > 1) {
                umDado.pluviometria = parseFloat((umDado.pluviometria / umDado.nVezesRepetido).toFixed(1));
            }
        })

    }

    function adicionarDado(latitude, longitude, pluviometria, data, productor, fazenda, talhao, id, safra) {

        let existe = false;

        if (dataChuva.length == 0) {
            dataChuva[0] = {
                pluviometria: pluviometria,
                latitude: latitude,
                longitude: longitude,
                data: data,
                productor: productor,
                fazenda: fazenda,
                talhao: talhao,
                nVezesRepetido: 1,
                safra: safra
            }

            return;
        }

        if (id == "SEPARAR POR TALHÕES") {
            for (var i = 0; i < dataChuva.length; i++) {
                if (latitude == dataChuva[i].latitude &&
                    longitude == dataChuva[i].longitude &&
                    data == dataChuva[i].data &&
                    talhao == dataChuva[i].talhao &&
                    safra == dataChuva[i].safra) {
                    dataChuva[i].pluviometria += pluviometria
                    dataChuva[i].nVezesRepetido = dataChuva[i].nVezesRepetido + 1
                    existe = true;
                }
            }
        } else {
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
                productor: productor,
                fazenda: fazenda,
                talhao: talhao,
                nVezesRepetido: 1,
                safra: safra
            })
        }
    }


    return (

        <div className={classes.root}>
            <Drawer name="Pluviometria - Farmbox" />
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
                            < Paper className={classes.paper}><Autocomplete keys={producerSelect} change={changeAutocomplete} multiple={true} /></Paper>
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
