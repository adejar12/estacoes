import React from 'react';
import Drawer from './components/Drawer'
import Theme from './Theme'
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import DataRangePicker from './components/DataRangePicker';


export default function MiniDrawer() {

  const classes = Theme();

  return (


    <div className={classes.root}>
      <Drawer />
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>xs=12</Paper>
          </Grid>
          <Grid item xs={5}>
            <Paper className={classes.paper}><DataRangePicker /></Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className={classes.paper}></Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper className={classes.paper}>xs=3</Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper className={classes.paper}>xs=3</Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper className={classes.paper}>xs=3</Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper className={classes.paper}>xs=3</Paper>
          </Grid>
        </Grid>
      </main>
    </div>
  );
}
