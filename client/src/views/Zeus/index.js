import React, { useState, useEffect } from 'react';
import Drawer from '../../components/Drawer'
import Theme from '../../Theme'
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import DataRangePicker from '../../components/DataRangePicker';
import Autocomplete from '../../components/Autocomplete';
import keys from '../../dados.json'
import { pegarFazenda, pegarNomeProdutor, pegarTalhao } from './functions'
import Button from '@material-ui/core/Button';
import Loading from '../../components/Loading'
import { gerarVetorXLSX, exportarXLSX } from '../../global/Utils'
import Icon from '@mdi/react'
import { mdiDownload } from '@mdi/js';
import $ from 'jquery';

export default function Zeus() {

    const classes = Theme();

    const [selectedDate, setSelectedDate] = useState([null, null]);
    const [selectedProducer, setSelectedProducer] = useState([]);
    const [isBusy, setIsBusy] = useState(false);
    const [buffer, setBuffer] = useState(10);
    const [progress, setProgress] = useState(0);
    const [producerSelect, setProdutoresSelect] = useState(new Array());
    const [usuario, setUsuario] = useState(null);
    const [producers, setProducers] = useState(null);
    const [showAutoComplete, setShowAutoComplete] = useState(false)

    var dataChuva = new Array()

    useEffect(async () => {

        let array = new Array();

        let usuario = await pegarUsuario();
        setUsuario(usuario)
        let producers = await pegarProdutores(usuario);
        setProducers(producers)

        producers.forEach(oneProdutor => {
            array.push(oneProdutor);
        })

        setProdutoresSelect(array);
        setSelectedProducer(array);
        setShowAutoComplete(true)
    }, [])


    function changeDataRangePicker(date) {
        setSelectedDate(date)
    }

    function changeAutocomplete(date) {
        setSelectedProducer(date)
    }

    function diff_weeks(dt2, dt1) {

        var diff = (dt2.getTime() - dt1.getTime()) / 1000;
        diff /= (60 * 60 * 24 * 7);
        return Math.abs(Math.round(diff));

    }

    async function getDateFarmBox() {
        setIsBusy(true);

        var arrayFinal = new Array();
        await Promise.all(selectedProducer.map(async oneProducerSelected => {

            for (var i = 0; i < producers.length; i++) {
                if (oneProducerSelected.picId == producers[i].picId) {

                    var dadoEstacao = new Array();
                    let date = new Date();

                    for (var j = 0; j < diff_weeks(selectedDate[0], new Date()); j++) {

                        dadoEstacao = dadoEstacao.concat(await pegarDadoEstacao(usuario, producers[i], date));

                    }

                    var objetoFinal = {
                        productor: producers[i],
                        dadoEstacao: dadoEstacao
                    }

                    arrayFinal[arrayFinal.length] = objetoFinal;

                }
            }
        }))


        arrayFinal = processarDadosZeus(arrayFinal)
        exportarXLSX(gerarVetorXLSX(arrayFinal, "Zeus"), "Zeus")

        setIsBusy(false);

    }

    function processarDadosZeus(producers) {

        for (var i = 0; i < producers.length; i++) {

            var dadoEstacao = producers[i].dadoEstacao;
            for (var j = 0; j < dadoEstacao.length; j++) {
                var date = new Date(dadoEstacao[j].finished);
                date.setHours(date.getHours() + 3)
                if (date >= selectedDate[0] && date <= selectedDate[1]) {
                    preencherData(date.toLocaleDateString(), dadoEstacao[j])
                } else {
                    continue
                }

            }

            tirarMedias()

            var novoProdutor = {
                productor: pegarNomeProdutor(producers[i].productor.name),
                latitude: producers[i].productor.lat,
                longitude: producers[i].productor.lon,
                talhao: pegarTalhao(producers[i].productor.name),
                fazenda: pegarFazenda(producers[i].productor.name),
                dataChuva: dataChuva
            }

            producers[i] = novoProdutor;
            dataChuva = new Array();
        }

        return producers

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

    function preencherData(data, dadoEstacao) {

        for (var i = 0; i < dataChuva.length; i++) {
            if (dataChuva[i].data == data) {
                dataChuva[i].chuva = dataChuva[i].chuva + parseFloat(dadoEstacao.rain);

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

    async function pegarDadoEstacao(usuario, productor, date) {

        var dadoEstacao = new Array();

        var mes = parseInt(date.getMonth()) + 1;
        var dataNova = date.getFullYear() + "-" + mes + "-" + (date.getDate() - 1);

        date.setDate(date.getDate() - 7)
        var mes = parseInt(date.getMonth()) + 1;
        var dataPassada = date.getFullYear() + "-" + mes + "-" + date.getDate();

        var settings = {
            "url": "http://www.cropnet.us/api/v1/pics/" + productor.picId + "/monitoring?start=" + dataPassada + "&end=" + dataNova + "",
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

    async function pegarProdutores(usuario) {

        var producers;

        var producers = {
            "url": "http://www.cropnet.us/api/v1/pics",
            "method": "GET",
            "timeout": 0,
            "headers": {
                "Authorization": usuario.user.token
            },
        };

        await $.ajax(producers).done(function (response) {
            producers = response;
        });

        return producers;

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
            "data": `{\"email\":\"${keys[2].dados.email}\",\"password\":\"${keys[2].dados.password}\"}`,

        };

        var usuario

        await $.ajax(dadosLogin).done(function (response) {
            usuario = response;
        });

        return usuario;
    }


    return (

        <div className={classes.root}>
            <Drawer name="Pluviometria - Zeus" />
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
                            <Paper className={classes.paper}><Autocomplete keys={producerSelect} change={changeAutocomplete} multiple={true} pegarNomeProdutor={pegarNomeProdutor} /></Paper>
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
