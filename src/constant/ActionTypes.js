export const TABS = {
    ACCOUNT: 'ACCOUNT',
    WALLET: 'WALLET',
    DEPOSIT: 'DEPOSIT',
    WITHDRAW: 'WITHDRAW',
    HISTORY: 'HISTORY',
    LOGIN: 'LOGIN',
    REGISTER: 'REGISTER',
}

export const NETWORK = {
    TESTNET: 'https://ropsten.infura.io/v3/cde205b23d7d4a998f4ee02f652355b0',
    METAMASK:  -1,
}

export const ERROR_EXCEPTION = 'A failure occurred during initialization of services'


export const DATA_TYPE = {
    ACCOUNT: 'ACCOUNT',
    STORE: 'STORE',
    TRANSACTION: 'TRANSACTION',
}

export const KEY_LOCALSTORAGE = 'game.blockchain.account';

export const STORE = {
    item: [
        {
            id: 1,
            name: '',
            power: 2,
            priceEth: 0.5,
            priceGold: 150,
            image: 'item1.png',
            detail: ''
        }
    ],
    gift: [],
    promotion: []
}