    import React from 'react';

    import './store.css';

    import * as Types from '../../constant/ActionTypes';
    import {dynamicSort} from '../../utils/formatNumber';

    // import component

    class Store extends React.Component {
    constructor(props) {
    super(props)
    this.state = {
        store: {
            message: '',
            type: 'info',
            display: 'none'
        },
        storeDataOnline: [],
        currentTabs: Types.TABS.STORE_LIST
    }
    }

    componentWillMount = async() => {
        //
    }

    componentWillReceiveProps = async(nextProps) => {
        const {storeDataOnline} = this.state;
        const {blockchain} = this.props;

        const listDataStore = await blockchain.getDataInputSmartContract();

        if (listDataStore && listDataStore.store && listDataStore.store.length !== storeDataOnline.length) {
            this.setState({storeDataOnline: listDataStore.store})
        }

    }

    buyItemEth = async(item) => {
        try {
            const {blockchain} = this.props;

            const address = await blockchain.getCurrentAccount();
    
            const myBalance = await blockchain.getBalance(address);
    
            const myAccountBlockChain = await blockchain.getAccountFromAddress(address);
    
            if (item.priceEth < myBalance) {
                const objItem = myAccountBlockChain.equipment.findIndex(obj => obj.id === item.id);
                
                if (objItem > -1) {
                    myAccountBlockChain.equipment[objItem].count += 1;
                } else {
                    const itemInfo = {
                        id: item.id,
                        count: 1,
                    };
    
                    myAccountBlockChain.equipment.push(itemInfo); 
                }
    
                const dataRequest = {
                    type: Types.DATA_TYPE.STORE_BUY,
                    data: myAccountBlockChain,
                    item: item,
                    value: item.priceEth,
                }
                
                const result = await blockchain.buyItem(dataRequest);
    
                if (result && result.txHash) {
                    this.setState({
                        store: {
                            message: 'Please check transaction: ' + result.txHash,
                            type: 'success',
                            display: 'block'
                        }
                    })
                } else {
                    this.setState({
                        store: {
                            message: 'Buy item fail',
                            type: 'danger',
                            display: 'block'
                        }
                    }) 
                }
            } else {
                this.setState({
                    store: {
                        message: 'The account has not enough balance',
                        type: 'danger',
                        display: 'block'
                    }
                }) 
            }

            setTimeout(() => {
                this.closeNotification();
            }, 3600);

        } catch (err) {
            console.error(err);
        }
    }

    sellItemEth = async(item, element) => {
        try {
            const {blockchain} = this.props;

            const address = await blockchain.getCurrentAccount();
    
            const myBalance = await blockchain.getBalance(address);
    
            const myAccountBlockChain = await blockchain.getAccountFromAddress(address);

            const qtyItem = 1;
    
            if (item.priceEth < myBalance) {
                const objItem = myAccountBlockChain.equipment.findIndex(obj => obj.id === item.id);
                
                if (objItem > -1) {
                    myAccountBlockChain.equipment[objItem].count += qtyItem;
                } else {
                    const itemInfo = {
                        id: item.id,
                        count: 1,
                    };
    
                    myAccountBlockChain.equipment.push(itemInfo); 
                }
    
                const dataRequest = {
                    type: Types.DATA_TYPE.STORE_SELL,
                    data: myAccountBlockChain,
                    item: {
                        id: element.id,
                        address: element.address,
                        product: element.product,
                        qtyItem: qtyItem,
                        price: element.price,
                        timeOrder: new Date().getTime(),
                    }
                }
                
                const result = await blockchain.sellItem(dataRequest);
    
                if (result && result.txHash) {
                    this.setState({
                        store: {
                            message: 'Please check transaction: ' + result.txHash,
                            type: 'success',
                            display: 'block'
                        }
                    })
                } else {
                    this.setState({
                        store: {
                            message: 'Buy item fail',
                            type: 'danger',
                            display: 'block'
                        }
                    }) 
                }
            } else {
                this.setState({
                    store: {
                        message: 'The account has not enough balance',
                        type: 'danger',
                        display: 'block'
                    }
                }) 
            }

            setTimeout(() => {
                this.closeNotification();
            }, 3600);

        } catch (err) {
            console.error(err);
        }
    }


    orderItem = async(item) => {
        try {
            const {blockchain} = this.props;

            const valuePice = item.priceEth + item.priceEth * 15 / 100;
            const qtyItem = 1;

            const address = await blockchain.getCurrentAccount();
    
            const myDataAccount = await blockchain.getAccountFromAddress(address);

            const objIndex= myDataAccount.equipment.findIndex(obj => obj.id === item.id);
    
            if (objIndex > -1) {
                if (myDataAccount.equipment[objIndex].count >= qtyItem) {

                    myDataAccount.equipment[objIndex].count -= qtyItem;

                    if (myDataAccount.equipment[objIndex].count === 0) {
                        myDataAccount.equipment.splice(objIndex, 1)
                    }

                    myDataAccount.equipment = [];

                    const dataRequest = {
                        type: Types.DATA_TYPE.STORE_ORDER,
                        data: myDataAccount,
                        item: {
                            id: new Date().getTime(),
                            address: address,
                            product: item.id,
                            qtyItem: qtyItem,
                            price: valuePice,
                            timeOrder: new Date().getTime()
                        }
                    }
                    
                    const result = await blockchain.orderItem(dataRequest);
        
                    if (result && result.txHash) {
                        this.setState({
                            store: {
                                message: 'Please check transaction: ' + result.txHash,
                                type: 'success',
                                display: 'block'
                            }
                        })
                    } else {
                        this.setState({
                            store: {
                                message: 'Buy item fail',
                                type: 'danger',
                                display: 'block'
                            }
                        }) 
                    }
                } else {
                    this.setState({
                        store: {
                            message: 'Invalid request',
                            type: 'danger',
                            display: 'block'
                        }
                    }) 
                }
            } else {
                this.setState({
                    store: {
                        message: 'Can not find item',
                        type: 'danger',
                        display: 'block'
                    }
                }) 
            }
            setTimeout(() => {
                this.closeNotification();
            }, 3600);
        } catch (err) {
            console.error(err);
        }
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
                <div className="store-item col-sm-12 col-md-4 col-lg-3" key={`store_list_${element.id}_${index}`}>
                    <h4>{element.name}</h4>
                    <div className="image-item" >
                        <img src={element.image} title="product" alt={`product_${element.id}`}/>
                    </div>
                    <div className="item-detail">
                        <h5>{element.detail}</h5>
                    </div>
                    <div className="button-group row">
                        <button
                            className="btn btn-info btn-buy-eth col-sm-12"
                            onClick={() => this.buyItemEth(element)}
                        >
                        {element.priceEth}
                        </button>
                    </div>
                </div>
            );
        })

        return (
        <div className="store-list">
            <div className="store-grid row">
                {listItem}
            </div>
        </div>
        );
    }

    renderTabsStoreOnline = () => {
        let {storeDataOnline} = this.state;
        const { currentAccount } = this.props;

        storeDataOnline = storeDataOnline.sort(dynamicSort('timeOrder', Types.SORT.DESC))

        const listItem = storeDataOnline.map((element, index) => {
            const dataItem = Types.STORE.item.find(obj => obj.id === element.product)

            if (dataItem) {
                return (
                    <div className="store-item col-sm-12 col-md-4 col-lg-3" key={`store_online_${dataItem.id}_${index}`}>
                        <h4>{dataItem.name}</h4>
                        <div className="image-item" >
                            <img src={dataItem.image} title="product" alt={`product_${dataItem.id}`} />
                        </div>
                        <div className="item-detail">
                            <h5>{dataItem.detail}</h5>
                            <h5>Quantity: {element.qtyItem}</h5>
                            <h5 style={{maxHeight: 200, overflow: 'hidden'}}>From Address: {element.address} ...</h5>
                        </div>
                        <div className="button-group row">
                            <button
                                className="btn btn-success btn-buy-eth col-sm-12"
                                style={{display: element.address !== currentAccount ? 'block': 'none'}}
                                onClick={() => this.sellItemEth(dataItem, element)}
                            >
                                {element.price}
                            </button>
                            <button
                                className="btn btn-info btn-buy-eth col-sm-12"
                                style={{display: element.address === currentAccount ? 'block': 'none'}}
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
            <div className="store-grid row">
                {listItem}
            </div>
        </div>
        );
    }

    renderTabsItemStore = () => {
        const {accountData} = this.props;

        const listItem = accountData.equipment.map((element, index) => {
            const dataItem = Types.STORE.item.find(obj => obj.id === element.id)
            if (dataItem) {
                return (
                    <div className="store-item col-sm-12 col-md-4 col-lg-3" key={`myStore_${dataItem.id}_${index}`}>
                        <h4>{dataItem.name}</h4>
                        <div className="image-item" >
                            <img src={dataItem.image} title="product" alt={`product_${dataItem.id}`}/>
                        </div>
                        <div className="item-detail">
                            <h5>{dataItem.detail}</h5>
                            <h5>Quantity: {element.count}</h5>
                        </div>
                        <div className="button-group row">
                            <button
                                className="btn btn-info btn-buy-eth col-sm-12"
                                onClick={() => this.orderItem(dataItem)}
                            >
                            {dataItem.priceEth}
                            </button>
                        </div>
                    </div>
                );
            }
            
          return '';
        })

        return (
        <div className="store-list">
            <div className="store-grid row">
                {listItem}
            </div>
        </div>
        );
    }

    changeTabs = (tab) => {
        this.setState({
            currentTabs: tab,
        })
    }

render() {
    const {
        currentTabs,
        store,
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
        <div className="store">
        <div
            class={`alert alert-${store.type} alert-dismissible fade show notification-success`}
            role="alert"
            style={{display: store.display}}
        >
            {store.message}
        <button type="button" class="close" onClick={this.closeNotification}>
            <span aria-hidden="true">&times;</span>
        </button>
        </div>
            <div className="tab-button">
                <button className="btn btn-success" onClick={() => this.changeTabs(Types.TABS.STORE_LIST)} >Store list</button>
                <button className="btn btn-info" onClick={() => this.changeTabs(Types.TABS.STORE_ONLINE)} >Store online</button>
                <button className="btn btn-danger" onClick={() => this.changeTabs(Types.TABS.ITEM_ACCOUNT)} >My store</button>
            </div>
            {htmlView}
        </div>
    );
    }
}

    export default Store;