import React from 'react';
import TextField from "@material-ui/core/TextField";
import {
    DateRangePicker,
    DateRangeDelimiter,
    LocalizationProvider
} from "@material-ui/pickers";
import DateFnsUtils from "@material-ui/pickers/adapter/date-fns"


export default function DataRangePicker() {
    const [selectedDate, handleDateChange] = React.useState([null, null]);
    return (
        <LocalizationProvider dateAdapter={DateFnsUtils}>
            <DateRangePicker
                startText="Inicio"
                endText="Fim"
                value={selectedDate}
                onChange={date => handleDateChange(date)}
                renderInput={(startProps, endProps) => (
                    <>
                        <TextField {...startProps} />
                        <DateRangeDelimiter> até </DateRangeDelimiter>
                        <TextField {...endProps} />
                    </>
                )}
            />
        </LocalizationProvider>)
}

