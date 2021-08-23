import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';

import { BrowserRouter, Switch, Route } from 'react-router-dom';

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { ptBR } from '@material-ui/core/locale';

import App from './App';
import Farmbox from './views/Farmbox'
import Protector from './views/Protector'
import Metos from './views/Metos'
import Zeus from './views/Zeus'

const theme = createMuiTheme({
  palette: {
    primary: { main: '#1976d2' },
  },
}, ptBR);

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={App} />
        <Route exact path="/farmbox/pluviometria" component={Farmbox} />
        <Route exact path="/Protector/pluviometria" component={Protector} />
        <Route exact path="/Metos/pluviometria" component={Metos} />
        <Route exact path="/Zeus/pluviometria" component={Zeus} />
      </Switch>
    </BrowserRouter>
  </ThemeProvider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
