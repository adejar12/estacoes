import React from 'react';
import Drawer from './components/Drawer'
import Theme from './Theme'

export default function App() {

  const classes = Theme();

  return (
    <div className={classes.root}>
      <Drawer name="Pluviometros/Estações" />
    </div>
  );
}
