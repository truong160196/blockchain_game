import React from 'react';

import './home.css';

import * as Types from '../../constant/ActionTypes';

import Main from '../../utils/screen/home/main';

import { connect } from 'react-redux';

import Blockchain from '../../utils/blockchain';
import AccountUtil from '../../utils/account';

import {setBalanceEth, setBalanceToken} from '../../actions/blockchain/index';

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
    const { postBalanceEth, postBalanceToken } = this.props;

    this.loader = document.getElementById('loader');

    if (this.loader) {
      this.loader.style.display = 'block';

      const config = {
        gasPrice: '1400000000',
        gas: 210000,
      }

      const redux = {
        postBalanceEth,
        postBalanceToken
      }
      
      this.blockchain = new Blockchain(null, config, redux);

      const define = {
        config: {
          urlSource: './assets/template/home.json',
        },
        blockchain: this.blockchain
      };

      this.gameDev = new Main(define);
      
      await this.gameDev.init();

      await this.loadBlockchainData();
    }
  }

  componentWillReceiveProps = async(nextProps) => {
    const { myAccount } = this.state;
    const { blockchain } = nextProps;

    if (blockchain && (blockchain.balanceEth || blockchain.balanceToken)) {
      if (blockchain.balanceEth !== myAccount.balanceEth ||  blockchain.balanceToken !== myAccount.balanceToken) {
        await this.getCurrentAccount();
      }
    }
  }

  async loadBlockchainData() {
    try {
      await this.blockchain.init();
      
		  await this.blockchain.enableMetaMask();

      await this.blockchain.connectMetaMask();

      const loginAccount = await this.blockchain.loginWithMetaMask();

      if (loginAccount && loginAccount.status === true && this.gameDev) {
        this.setState({
          login:  true,
        });

        await this.getCurrentAccount();

        await this.blockchain.subscribe();
      }
      
    } catch (err) {
      console.error(err);
    }
    this.loader.style = 'none';
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

    return (
      <div className="home">
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
  postBalanceEth: (data) => {
    dispatch(setBalanceEth(data));
  },
  postBalanceToken: (data) => {
    dispatch(setBalanceToken(data));
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(Home);