import React, { useRef, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

const useStyles = makeStyles({
    root: {
        width: '100%',
    },
});

export default function LinearBuffer({ progress, buffer }) {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <LinearProgress variant="buffer" value={progress} valueBuffer={buffer} />
        </div>
    );
}
