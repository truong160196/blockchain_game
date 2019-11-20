    import React from 'react';

    import './store.css';

    import * as Types from '../../constant/ActionTypes';

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
        currentTabs: Types.TABS.STORE_LIST
    }
    }

    componentWillMount = async() => {
        //
    }

    componentWillReceiveProps = async(nextProps) => {
        //
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
                    value: item.priceEth,
                }
                
                const result = await blockchain.buyItem(dataRequest);
                console.log(result)
    
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
                this.closeNotification();
            }
        } catch (err) {
            console.error(err);
        }
    }

    buyItemGold = async(item) => {
    const {account, blockchain} = this.props;


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

        const listItem = Types.STORE.item.map((element) => {
            return (
                <div className="store-item col-sm-12 col-md-4 col-lg-3" key={element.id}>
                    <h4>{element.name}</h4>
                    <div className="image-item" >
                        <img src={element.image} title="product" />
                    </div>
                    <div className="item-detail">
                        <h5>{element.nam}</h5>
                    </div>
                    <div className="button-group row">
                        <button
                            className="btn btn-info btn-buy-eth col-sm-12 col-md-6"
                            disabled={element.priceEth ? false : true}
                            onClick={() => this.buyItemEth(element)}
                        >
                        {element.priceEth}
                        </button>
                        <button
                            className="btn btn-success btn-buy-gold col-sm-12 col-md-6"
                            disabled={element.priceGold ? false : true}
                            onClick={() => this.buyItemGold(element)}
                        >
                        {element.priceGold}
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

renderTabsStoreGift = () => {
        const {account, blockchain} = this.props;

        return (
            <div className="store-list">

            </div>
        );
    }

renderTabsStoreGift = () => {
        const {account, blockchain} = this.props;

        return (
            <div className="store-gift">

            </div>
        );
    }

renderTabsStoreOnline = () => {
        const {account, blockchain} = this.props;

        return (
            <div className="store-online">

            </div>
        );
    }

renderTabsStorePromotion = () => {
        const {account, blockchain} = this.props;

        return (
            <div className="store-promotion">

            </div>
        );
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
        case Types.TABS.STORE_GIFT:
            htmlView = this.renderTabsStoreGift();
            break;
        case Types.TABS.STORE_ONLINE:
            htmlView = this.renderTabsStoreOnline();
            break;
        case Types.TABS.STORE_PROMOTION:
            htmlView = this.renderTabsStorePromotion();
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
            {htmlView}
        </div>
    );
    }
}

    export default Store;