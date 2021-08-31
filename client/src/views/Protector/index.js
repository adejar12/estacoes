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
import XLSX from 'xlsx';
import { gerarVetorXLSX, exportarXLSX } from '../../global/Utils'
import Icon from '@mdi/react'
import { mdiDownload } from '@mdi/js';
import $ from 'jquery';

export default function Farmbox() {

    const [isBusy, setIsBusy] = useState(false);
    const [buffer, setBuffer] = useState(10);
    const [progress, setProgress] = useState(0);
    const [producerSelect, setProdutoresSelect] = useState([]);
    const [selectedDate, setSelectedDate] = React.useState([null, null]);
    const [selectedProducer, setSelectedProducer] = React.useState([]);
    const [token, setToken] = useState();
    const [empresa, setEmpresa] = useState();
    const [showAutoComplete, setShowAutoComplete] = useState(false)

    var arrayFinal = new Array();

    useEffect(async () => {
        setIsBusy(true);
        let array = new Array();

        let token = await pegarToken();
        setToken(token)

        let empresa = await pegarEmpresa(token.access_token);
        setEmpresa(empresa)

        let propriedades = await pegarPropriedades(token.access_token, empresa[0].id);
        propriedades.content.forEach((umaPropriedade, index) => {
            setBuffer((index + 1) * 4);
            array.push(umaPropriedade);
            setProgress(index * 4);
        })

        setIsBusy(false);
        setBuffer(10);
        setProgress(0);
        setProdutoresSelect(array);
        setSelectedProducer(array);
        setShowAutoComplete(true)
    }, [])

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
                "username": `${keys[1].dados.username}`,
                "password": `${keys[1].dados.password}`
            }

        };

        let token

        await $.ajax(dadosLogin).done(function (response) {
            token = response;
        });

        return token;
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


    const classes = Theme();


    function changeDataRangePicker(date) {
        setSelectedDate(date)
    }

    function changeAutocomplete(date) {
        setSelectedProducer(date)
    }

    async function getDateFarmBox() {
        setIsBusy(true);

        await Promise.all(producerSelect.map(async oneKey => {

            let res = oneKey.name.split("-")

            let dado = {
                productor: res[0],
                fazenda: res[1],
                latitude: "",
                longitude: "",
                chuvas: "",
            }

            await Promise.all(selectedProducer.map(async (oneProducer, index) => {
                setProgress(index * 4);

                let date = oneProducer.name.split("-");

                if (date[0] == dado.productor && date[1] == dado.fazenda) {

                    let pontosStaticos = await pegarPluviometria(token.access_token, empresa[0].id, oneKey.id)

                    pontosStaticos.map((umPontoStatico) => {
                        if (umPontoStatico.static_point.class_name == "pluviometer") {
                            dado.latitude = umPontoStatico.static_point.location.lat;
                            dado.longitude = umPontoStatico.static_point.location.lng;

                            let arrayChuvas = new Array();

                            umPontoStatico.analytic_results_histogram.result_histogram.map((umHistograma) => {
                                if (new Date(umHistograma.local_date) >= selectedDate[0]
                                    && new Date(umHistograma.local_date) <= selectedDate[1]) {
                                    let dadoChuva = {
                                        data: new Date(umHistograma.local_date).toLocaleDateString(),
                                        pluviometria: umHistograma.indicators[0].value
                                    }
                                    arrayChuvas.push(dadoChuva)
                                }

                            })

                            dado.chuvas = arrayChuvas;
                        }
                    })

                    arrayFinal.push(dado)
                }
            }))
        }))

        setIsBusy(false);
        exportarXLSX(gerarVetorXLSX(arrayFinal, "Protector"), "Protector")

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

    return (

        <div className={classes.root}>
            <Drawer name="Pluviometria - Protector" />
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
