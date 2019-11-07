import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import appReducers from './reducers/index';
// import * as web3 from 'https://cdn.jsdelivr.net/gh/ethereum/web3.js@1.0.0-beta.34/dist/web3.min.js';

import './index.css';
import App from './components/app/App';
import * as serviceWorker from './serviceWorker';

const store = createStore(
	appReducers,
	applyMiddleware(thunk),
  );
  
  ReactDOM.render(
	<Provider store={store}>
	  <App />
	</Provider>,
	document.getElementById('root'),
  );

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
