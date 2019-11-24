import React from 'react';

import './store.css';

import * as Types from '../../constant/ActionTypes';
import {dynamicSort, formatCurrency} from '../../utils/formatNumber';

// import component

import Notification from '../notification/notification';
import Waiting from '../waiting/waiting';

class Store extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            notice: {
                message: '',
                isConfirm: false,
                title: 'Notification!',
                visible: false,
            },
            waiting: false,
            storeDataOnline: [],
            itemData: [],
            currentTabs: Types.TABS.STORE_LIST
        }
    }

    componentWillMount = async() => {
        //
    }

    componentWillReceiveProps = async(nextProps) => {
        const {storeDataOnline} = this.state;
        const {blockchain} = this.props;

        if (blockchain && typeof blockchain.getDataInputStoreContract === 'function') {
            const listDataStore = await blockchain.getDataInputStoreContract();

            if (listDataStore && listDataStore.length !== storeDataOnline.length) {
                this.setState({storeDataOnline: listDataStore})
            }
        }
    }

    cancelModal = () => {
        const { notice } = this.state;
        notice.visible =  false;

        this.setState({
            notice: notice,
        })
    }

    confirmModal = () => {
        const { notice } = this.state;
        notice.visible =  false;

        this.setState({
            notice: notice,
        })
    }

    buyItemEth = async(item) => {
        let message = '';

        try {
            this.setState({
                waiting: true,
            });
            const {blockchain} = this.props;

            const address = await blockchain.getCurrentAccount();
    
            const myBalance = await blockchain.getBalanceToken(address);

            if (item.priceEth < myBalance) {
                const dataRequest = {
                    id: item.id,
                    qtyItem: 1,
                    price: item.priceEth,
                }
                
                const result = await blockchain.buyItem(dataRequest);
                if (result.status === true) {
                    message = (
                        <div>
                            <h5 style={{color: 'green'}}>Buy Item Successfully! Please check transaction detail</h5>
                            <a href={`https://ropsten.etherscan.io/tx/${result.message}`}  target="_blank" >{result.message}</a>
                        </div>
                    );
                } else {
                    if (!result.message) {
                        message = (
                          <h5 style={{color: 'red'}}>Something is wrong with your request, possibly due to invalid argument.</h5>
                        );
                      } else {
                        message = (
                          <h5 style={{color: 'red'}}>{result.message}</h5>
                        );
                      }
                }
            } else {
                message = (
                    <h5 style={{color: 'red'}}>The account has not enough balance</h5>
                );
            }
        } catch (err) {
            console.error(err);
            message = (
                <h5 style={{color: 'red'}}>An unexpected server error was encountered, we are working on fixing this</h5>
            );
        }

        this.setState({
            notice: {
                message: message,
                visible: true,
                title: `Buy Item ${item.name}`
            },
            waiting: false,
        });
    }

    sellItemEth = async(item, element) => {
        let message = '';

        try {
            this.setState({
                waiting: true,
            });
            
            const {blockchain} = this.props;

            const qtyItem = 1;
    
            const dataRequest = {
                address: element.address_to,
                id: item.id,
                qtyItem: qtyItem,
                price: element.price,
                id_order: element.id,
            }
            
            const result = await blockchain.sellItem(dataRequest);
            if (result.status === true) {
                message = (
                    <div>
                        <h5 style={{color: 'green'}}>Order Item Successfully! Please check transaction detail</h5>
                        <a href={`https://ropsten.etherscan.io/tx/${result.message}`}  target="_blank" >{result.message}</a>
                    </div>
                );
            } else {
                if (!result.message) {
                    message = (
                      <h5 style={{color: 'red'}}>Something is wrong with your request, possibly due to invalid argument.</h5>
                    );
                  } else {
                    message = (
                      <h5 style={{color: 'red'}}>{result.message}</h5>
                    );
                  }
            }
        } catch (err) {
            console.error(err);
            message = (
                <h5 style={{color: 'red'}}>An unexpected server error was encountered, we are working on fixing this</h5>
            );
        }

        this.setState({
            notice: {
                message: message,
                visible: true,
                title: `Buy Item ${item.name}`
            },
            waiting: false,
        });
    }


    orderItem = async(item) => {
        let message = '';

        try {
            this.setState({
                waiting: true,
            });
            
            const {blockchain} = this.props;

            const valuePice = item.priceEth;
            const qtyItem = 1;
    
            const dataRequest = {
                id: item.id,
                qtyItem: qtyItem,
                price: valuePice,
            }
            
            const result = await blockchain.orderItem(dataRequest);
            if (result.status === true) {
                message = (
                    <div>
                        <h5 style={{color: 'green'}}>Order Item Successfully! Please check transaction detail</h5>
                        <a href={`https://ropsten.etherscan.io/tx/${result.message}`}  target="_blank" >{result.message}</a>
                    </div>
                );
            } else {
                if (!result.message) {
                    message = (
                      <h5 style={{color: 'red'}}>Something is wrong with your request, possibly due to invalid argument.</h5>
                    );
                  } else {
                    message = (
                      <h5 style={{color: 'red'}}>{result.message}</h5>
                    );
                  }
            }
        } catch (err) {
            console.error(err);
            message = (
                <h5 style={{color: 'red'}}>An unexpected server error was encountered, we are working on fixing this</h5>
            );
        }

        this.setState({
            notice: {
                message: message,
                visible: true,
                title: `Buy Item ${item.name}`
            },
            waiting: false,
        });
    }

    closeNotification = () => {
        this.setState({
            store: {
                message: '',
                type: 'info',
                display: 'none'
            }
        })
    }


    renderTabsStoreList = () => {
        const {account, blockchain} = this.props;

        const listItem = Types.STORE.item.map((element, index) => {
            return (
                <div className="store-item" key={`store_list_${element.id}_${index}`}>
                    <h4>{element.name}</h4>
                    <div className="image-item" >
                        <img src={element.image} title="product" alt={`product_${element.id}`}/>
                    </div>
                    <div className="item-detail">
                        <h5>{element.detail}</h5>
                    </div>
                    <div className="button-group">
                        <button
                            className="btn btn-info btn-buy-eth col-sm-12"
                            onClick={() => this.buyItemEth(element)}
                        >
                        {`${formatCurrency(element.priceEth, 0)} ${Types.TOKEN}`}
                        </button>
                    </div>
                </div>
            );
        })

        return (
        <div className="store-list">
            <div className="store-grid">
                {listItem}
            </div>
        </div>
        );
    }

    renderTabsStoreOnline = () => {
        let {storeDataOnline} = this.state;
        const { myAccount } = this.props;
        storeDataOnline = storeDataOnline.sort(dynamicSort('time_update', Types.SORT.DESC))

        const listItem = storeDataOnline.map((element, index) => {

            const dataItem = Types.STORE.item.find(obj => obj.id === Number(element.product))
            if (dataItem && dataItem.id) {
                return (
                    <div className="store-item" key={`store_online_${dataItem.id}_${index}`}>
                        <h4>{dataItem.name}</h4>
                        <div className="image-item" >
                            <img src={dataItem.image} title="product" alt={`product_${dataItem.id}`} />
                        </div>
                        <div className="item-detail">
                            <h5>{dataItem.detail}</h5>
                            <h5>Quantity: {element.qtyItem}</h5>
                            <h5 style={{maxHeight: 200, overflow: 'hidden'}}>From Address: {element.address} ...</h5>
                        </div>
                        <div className="button-group">
                            <button
                                className="btn btn-success btn-buy-eth"
                                style={{display: element.address_to.toUpperCase() != myAccount.address.toUpperCase() ? 'block': 'none'}}
                                onClick={() => this.sellItemEth(dataItem, element)}
                            >
                                {element.price}
                            </button>
                            <button
                                className="btn btn-info btn-buy-eth"
                                style={{display: element.address_to.toUpperCase() == myAccount.address.toUpperCase() ? 'block': 'none'}}
                                onClick={() => this.removeItem(dataItem)}
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                );
            }
            return '';
        })

        return (
        <div className="store-list">
            <div className="store-grid">
                {listItem}
            </div>
        </div>
        );
    }

    renderTabsItemStore = () => {
        const { itemData } = this.state;

        const listItem = itemData.map((element, index) => {
            const dataItem = Types.STORE.item.find(obj => obj.id === Number(element.id))
            if (dataItem) {
                return (
                    <div className="store-item" key={`myStore_${dataItem.id}_${index}`}>
                        <h4>{dataItem.name}</h4>
                        <div className="image-item" >
                            <img src={dataItem.image} title="product" alt={`product_${dataItem.id}`}/>
                        </div>
                        <div className="item-detail">
                            <h5>Quantity: {element.qtyItem}</h5>
                            <h5>Price: {dataItem.priceEth}</h5>
                        </div>
                        <div className="button-group row">
                            <button
                                className="btn btn-info btn-buy-eth col-sm-12"
                                onClick={() => this.orderItem(dataItem)}
                            >
                                SELL
                            </button>
                        </div>
                    </div>
                );
            }
            
        return '';
        })

        return (
        <div className="store-list">
            <div className="store-grid">
                {listItem}
            </div>
        </div>
        );
    }

    changeTabs = async(tab) => {
        const {blockchain} = this.props;
        const dataState = [];

        this.setState({
            waiting: true,
        });

        dataState.currentTabs = tab;
        if (blockchain) {
            switch (tab) {
                case Types.TABS.ITEM_ACCOUNT:
                        const myItemData = await blockchain.getAccountItemFromAddress();
                        if (myItemData && myItemData.length > 0) {
                            dataState.itemData = myItemData;
                        }
                    break;
                case Types.TABS.STORE_ONLINE:
                        const storeDataOnline = await blockchain.getDataInputStoreContract();
                        if (storeDataOnline && storeDataOnline.length > 0) {
                            dataState.storeDataOnline = storeDataOnline;
                        }
                    break;
                default:
                    break;
            }
        }

        dataState.waiting = false;

        this.setState(dataState)
    }

render() {
    const {
        currentTabs,
        notice,
        waiting,
    } = this.state;

    let htmlView = '';
    switch (currentTabs) {
        case Types.TABS.STORE_LIST:
            htmlView = this.renderTabsStoreList();
            break;
        case Types.TABS.STORE_ONLINE:
            htmlView = this.renderTabsStoreOnline();
            break;
        case Types.TABS.ITEM_ACCOUNT:
            htmlView = this.renderTabsItemStore();
            break;
    
        default:
            break;
    }

    return (
        <div id="shop-panel" className="store" style={{display: 'none'}}>
            <Notification
                title={notice.title}
                message={notice.message}
                visible={notice.visible}
                isConfirm={notice.isConfirm}
                cancelModal={this.cancelModal}
                confirmModal={this.confirmModal}
            />
            <Waiting
                waiting={waiting}
            />
            <div className="tab-button">
                <button
                className={`btn btn-default btn-tab ${currentTabs === Types.TABS.STORE_LIST ? 'active' : ''}`}
                onClick={() => this.changeTabs(Types.TABS.STORE_LIST)}
                >
                    Store list
                </button>
                <button
                    className={`btn btn-default btn-tab ${currentTabs === Types.TABS.STORE_ONLINE ? 'active' : ''}`}
                    onClick={() => this.changeTabs(Types.TABS.STORE_ONLINE)}
                >
                    Store online
                </button>
                <button
                    className={`btn btn-default btn-tab ${currentTabs === Types.TABS.ITEM_ACCOUNT ? 'active' : ''}`}
                    onClick={() => this.changeTabs(Types.TABS.ITEM_ACCOUNT)}
                >My store</button>
            </div>
            {htmlView}
        </div>
        );
    }
}

    export default Store;