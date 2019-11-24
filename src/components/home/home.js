import React from 'react';

import './home.css';

import * as Types from '../../constant/ActionTypes';

import Main from '../../utils/screen/home/main';

import { connect } from 'react-redux';

import Blockchain from '../../utils/blockchain';
import AccountUtil from '../../utils/account';

import postData from '../../actions/blockchain/index';

// import component
import Account from '../account/account';
import Login from '../account/login';

import Store from '../store/store';

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isRegister: false,
      account: '',
      balanceEth: 0,
      currentAccount: '',
      myAccount: {
        userName: '',
        score: 0,
        address: '',
        balanceEth: 0,
        balanceToken: 0, 
      },
      listItemByAccount: [],
      tabCurrent: Types.TABS.WALLET,
      transaction: {
        message: '',
        type: 'info',
        display: 'none'
      }
    }
  }

  componentWillMount = async() => {
    const define = {
      config: {
        urlSource: './assets/template/home.json'
      }
    };

    this.gameDev = new Main(define);

    await this.gameDev.init();
    const options = {

    };

    this.account = new AccountUtil(options);

    await this.loadBlockchainData();
  }

  componentWillReceiveProps = async(nextProps) => {
    const { myAccount } = this.state;
    const { blockchain } = nextProps;

    if (blockchain && blockchain.balance && blockchain.balance !== myAccount.balanceEth) {
      // await this.getCurrentAccount();
    }
  }

  async loadBlockchainData() {
    const { postData } = this.props;

    try {
      const config = {
        gasPrice: '1400000000',
        gas: 210000,
      }
      
      this.blockchain = new Blockchain(null, config, postData);

      await this.blockchain.init();
      
		  await this.blockchain.enableMetaMask();

      await this.blockchain.connectMetaMask();

      const loginAccount = await this.blockchain.loginWithMetaMask();

      if (loginAccount && loginAccount.status === true) {
        this.setState({
          login:  true,
        });

        // const dataStorage = {};
        // dataStorage[loginAccount.data.name] = loginAccount.data;

        // localStorage.setItem(Types.KEY_LOCALSTORAGE, JSON.stringify(dataStorage))
        await this.getCurrentAccount();
      } else {
        this.setState({isRegister:  true})
      }

      // await this.blockchain.subscribe();

      await this.getCurrentAccount();
    } catch (err) {
      console.error(err);
    }

  }

  getCurrentAccount = async() => {
    try {
      const { myAccount } = this.state;

      const address = await this.blockchain.getCurrentAccount();

      if (address) {
        const balanceEth = await this.blockchain.getBalance(address);
        const balanceToken = await this.blockchain.getBalanceToken();

        const dataFromBlockchain = await this.blockchain.getDataInputSmartContract();

        this.gameDev.setBalanceEth(balanceEth);
        this.gameDev.setBalanceGold(balanceToken);

        myAccount.address = address;
        myAccount.userName = dataFromBlockchain.user_name;
        myAccount.score = dataFromBlockchain.score;
        myAccount.balanceEth = balanceEth;
        myAccount.balanceToken = balanceToken;

        this.setState({
          myAccount: myAccount,
        })
      }
    } catch(err) {
      console.error(err);
    }
  }

  renderScreenAccount = () => {
    const { blockchain } = this.props;
    const {
      myAccount,
    } = this.state;

    return (
        <Account
          myAccount={myAccount}
          blockchain={this.blockchain}
          account={{...blockchain}}
        />
      )
  }

  renderScreenLogin = () => {
    return (
        <Login
          account={this.account}
          blockchain={this.blockchain}
        />
      )
  }

  renderScreenStore = () => {
    const { listItemByAccount, myAccount } = this.state;

    return (
      <Store
        blockchain={this.blockchain}
        account={this.account}
        itemData={listItemByAccount}
        myAccount={myAccount}
      />
    )

  }

  render() {
    const {
      isRegister,
    } = this.state;

    let htmlView = '';

    if (isRegister === true) {
      htmlView = this.renderScreenLogin();
    } else {
      // htmlView = this.renderScreenAccount();
      // htmlView = this.renderScreenStore();
    }

    return (
      <div className="home">
         {htmlView}
         <div className="account-panel">
           {this.renderScreenAccount()}
         </div>
         <div className="shop-panel">
           {this.renderScreenStore()}
         </div>
      </div>
    );
  }
}


const mapStateToProps = state => ({ blockchain: state.blockchain });

const mapDispatchToProps = dispatch => ({
  postData: (data) => {
    dispatch(postData(data));
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(Home);