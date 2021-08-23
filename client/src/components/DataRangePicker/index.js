import React from 'react';
import TextField from "@material-ui/core/TextField";
import {
    DateRangePicker,
    DateRangeDelimiter,
    LocalizationProvider
} from "@material-ui/pickers";
import DateFnsUtils from "@material-ui/pickers/adapter/date-fns"
import ptBR from 'date-fns/locale/pt-BR';


export default function DataRangePicker({ selectedDate, onChange }) {


    return (
        <LocalizationProvider dateAdapter={DateFnsUtils} locale={ptBR}>
            <DateRangePicker
                startText="Inicio"
                endText="Fim"
                value={selectedDate}
                onChange={date => onChange(date)}
                renderInput={(startProps, endProps) => (
                    <>
                        <TextField {...startProps} />
                        <DateRangeDelimiter> até </DateRangeDelimiter>
                        <TextField {...endProps} />
                    </>
                )}
            />
        </LocalizationProvider>
    )
}

