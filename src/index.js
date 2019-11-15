import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import appReducers from './reducers/index';
import 'bootstrap/dist/css/bootstrap.min.css';

import './index.css';
import * as serviceWorker from './serviceWorker';
import * as PIXI from 'pixi.js';

import App from './components/app/App';
import ErrorBoundary from './components/errorHandling/ErrorBoundary';

window.PIXI = PIXI;

const store = createStore(
	appReducers,
	applyMiddleware(thunk),
  );
  
  ReactDOM.render(
	<Provider store={store}>
		<ErrorBoundary>
			<App />
		</ErrorBoundary>
	</Provider>,
	document.getElementById('root'),
  );

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
