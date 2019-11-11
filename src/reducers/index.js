import { combineReducers } from 'redux';

import blockchain from './blockchain/default';

const appReducers = combineReducers({
    blockchain
});

export default appReducers;
