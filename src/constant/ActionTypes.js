import image1 from '../assets/image/item_01.png';
import image2 from '../assets/image/item_02.png';
import image3 from '../assets/image/item_03.png';
import image4 from '../assets/image/item_04.png';

export const TABS = {
    ACCOUNT: 'ACCOUNT',
    WALLET: 'WALLET',
    DEPOSIT: 'DEPOSIT',
    WITHDRAW: 'WITHDRAW',
    HISTORY: 'HISTORY',
    LOGIN: 'LOGIN',
    REGISTER: 'REGISTER',
    ITEM_ACCOUNT: 'ITEM_ACCOUNT',
    STORE_LIST: 'STORE_LIST',
    STORE_GIFT: 'STORE_GIFT',
    STORE_ONLINE: 'STORE_ONLINE',
    STORE_PROMOTION: 'STORE_PROMOTION',
}

export const NETWORK = {
    TESTNET: 'https://ropsten.infura.io/v3/cde205b23d7d4a998f4ee02f652355b0',
    METAMASK:  -1,
}

export const SORT = {
    ASC: 'ASC',
    DESC: 'DESC'
}

export const ERROR_EXCEPTION = 'A failure occurred during initialization of services'

export const DATA_TYPE = {
    ACCOUNT: 'ACCOUNT',
    STORE_BUY: 'STORE_BUY',
    STORE_SELL: 'STORE_SELL',
    STORE_ORDER: 'STORE_ORDER',
    STORE_GIFT: 'STORE_GIFT',
    TRANSACTION: 'TRANSACTION',
}

export const TYPE_WITHDRAW = {
    TOKEN: 'TOKEN',
    ETH: 'ETH',
}

export const KEY_LOCALSTORAGE = 'game.blockchain.account';

export const CONTRACT_ADDRESS = '0xaE30aA3999489FD4cbd6E718448C6405090092c6';
export const ADDRESS_OWNER = '0xaC8832ae0C56f638bC07822f90b24A4f8d721B2D';
export const PRIVATE_KEY = '9ECC93FB52B849DE0F2010CC08BF1284DF4F5A8A899F6074D894FC44D017977A';
export const TOKEN = 'QTN';
export const TOKEN_ADDRESS = '';

export const STORE = {
    item: [
        {
            id: 1,
            name: 'Rare',
            power: 2,
            priceEth: 10,
            priceGold: 150,
            image: image1,
            detail: '+20 Damage'
        },
        {
            id: 2,
            name: 'Epic',
            power: 3,
            priceEth: 15,
            priceGold: 300,
            image: image2,
            detail: '+60 Damage'
        },
        {
            id: 3,
            name: 'Club',
            power: 6,
            priceEth: 20,
            priceGold: 500,
            image: image3,
            detail: '+120 Damage'
        },
        {
            id: 4,
            name: 'Wand',
            power: 12,
            priceEth: 25,
            image: image4,
            detail: '+320 Damage'
        },
    ],
    online: [],
}