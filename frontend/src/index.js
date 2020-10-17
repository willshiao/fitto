import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Client as Styletron } from 'styletron-engine-atomic';
import { Provider as StyletronProvider } from 'styletron-react';
import { DarkTheme, BaseProvider } from 'baseui';

const engine = new Styletron();

ReactDOM.render(
  <StyletronProvider value={engine}>
    <BaseProvider theme={DarkTheme}>
      <App />
    </BaseProvider>
  </StyletronProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
