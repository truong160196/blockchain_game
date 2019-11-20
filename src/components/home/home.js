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

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isRegister: false,
      account: '',
      balanceEth: 0,
      currentAccount: '',
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
        urlSource: './assets/template/main.json'
      }
    };

    this.gameDev = new Main(define);

    // await this.gameDev.init();
    const options = {

    };

    this.account = new AccountUtil(options);

    await this.loadBlockchainData();
  }

  componentWillReceiveProps = async(nextProps) => {
    const { balanceEth } = this.state;
    const { blockchain } = nextProps;

    if (blockchain && blockchain.balance && blockchain.balance !== balanceEth) {
      await this.getCurrentAccount();
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
          myAccount: loginAccount.data,
        });

        const dataStorage = {};
        dataStorage[loginAccount.data.name] = loginAccount.data;

        localStorage.setItem(Types.KEY_LOCALSTORAGE, JSON.stringify(dataStorage))
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
      const result = await this.blockchain.getCurrentAccount();

      if (result) {
        const balance = await this.blockchain.getBalance(result);

        this.gameDev.setBalanceEth(balance);

        this.setState({
          currentAccount: result,
          balanceEth: balance
        })
      }
    } catch(err) {
      console.error(err);
    }
  }

  renderScreenAccount = () => {
    const { blockchain } = this.props;
    const {
      currentAccount,
    } = this.state;

    return (
        <Account
          currentAccount={currentAccount}
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

  render() {
    const {
      isRegister,
    } = this.state;

    let htmlView = '';

    if (isRegister === true) {
      htmlView = this.renderScreenLogin();
    } else {
      htmlView = this.renderScreenAccount();
    }

    return (
      <div className="home">
         {htmlView}
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