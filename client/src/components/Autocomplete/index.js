/* eslint-disable no-use-before-define */
import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

export default function App({ keys, change, multiple, pegarNomeProdutor }) {

    return (
        <>
            {multiple === true ?
                pegarNomeProdutor !== undefined ?
                    <Autocomplete
                        multiple
                        id="tags-standard"
                        options={keys}
                        onChange={(event, value) => change(value)}
                        getOptionLabel={(option) => pegarNomeProdutor(option.name)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="standard"
                                label="Produtores"
                                placeholder="Produtor"
                            />
                        )}
                    /> : <Autocomplete
                        multiple
                        id="tags-standard"
                        options={keys}
                        onChange={(event, value) => change(value)}
                        getOptionLabel={(option) => option.name}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="standard"
                                label="Produtores"
                                placeholder="Produtor"
                            />
                        )}
                    /> : <Autocomplete
                    multiple
                    id="tags-standard"
                    options={keys}
                    onChange={(event, value) => change(value)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="standard"
                            label="Produtores"
                            placeholder="Produtor"
                        />
                    )}
                />}

        </>
    );
}
