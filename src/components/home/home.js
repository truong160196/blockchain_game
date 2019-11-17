import React from 'react';
import QRCode from 'qrcode';

import './home.css';

import { formatCurrency } from '../../utils/formatNumber';
import * as Types from '../../constant/ActionTypes';

import Main from '../../utils/screen/home/main';

import { connect } from 'react-redux';

import Blockchain from '../../utils/blockchain';

import postData from '../../actions/blockchain/index';

const $ = window.$;

const mainnet = 'https://ropsten.infura.io/v3/cde205b23d7d4a998f4ee02f652355b0';
const local =  'http://localhost:8545'

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      urlBase: null,
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

    await this.gameDev.init();

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
    const { urlBase } = this.state;

    const { postData } = this.props;

    try {
      const config = {
        gasPrice: '1400000000',
        gas: 210000,
      }
      
      this.blockchain = new Blockchain(urlBase, config, postData);

      await this.blockchain.init();

      await this.blockchain.connectMetaMask();

      await this.blockchain.subscribe();

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

  sendToken = async() => {
    try {
      const toAddress = $('#toAddress').val();
      let value = $('#value').val();

      const data = await this.blockchain.sendTransaction(null, toAddress, value)

      if (data.transactionHash) {
        $('#toAddress').val('');
        $('#value').val('');

        this.setState({
          transaction: {
            display: 'block',
            type: 'success',
            message: 'Please check hash: ' + data.transactionHash
          }
        })
      }

      if (data.err) {
        this.setState({
          transaction: {
            display: 'block',
            type: 'error',
            message: data.err.message
          }
        })
      }
    } catch (err) {
      console.error(err);
    }
  }

  showQRCode = () => {
    const {currentAccount} = this.state;

    const canvas = document.getElementById('qrcode')
 
    QRCode.toCanvas(canvas, currentAccount, {width: 250}, function (error) {
      if (error) console.error(error)
      console.log('success!');
    })

    this.setState({
      showQr: true
    })
  }

  closePopup = () => {
    this.setState({
      showQr: false
    })
  }

  copyAddressClipboard = () => {
    const {currentAccount} = this.state;

    const textField = document.createElement('textarea')
    textField.innerText = currentAccount;
    document.body.appendChild(textField)
    textField.select()
    document.execCommand('copy')
    textField.remove()

    this.setState({
      transaction: {
        display: 'block',
        type: 'info',
        message: 'Copied!'
      }
    })

    setTimeout(() => {
      this.setState({
        transaction: {
          display: 'none',
          type: 'info',
          message: ''
        }
      })
    }, 3600);
  }

  changeTabs = (tab) => {
    this.setState({
      tabCurrent: tab,
    })
  }

  renderTabWithdraw = () => {
    return (
      <form id="form-send-token">
        <div className="form-group">
          <label>Address: </label>
          <input id="toAddress" className="form-control" type="text" placeholder="Please enter receive address"/>
        </div>
        <div className="form-group">
          <label>Value (Ether): </label>
          <input id="value" className="form-control" type="number" min="0" step="0.01" placeholder="enter value"/>
        </div>
        <div className="form-group btn-group">
          <button
            type="button"
            className="btn btn-info btn-submit"
            onClick={this.sendToken}
          >
            Submit
          </button>
        </div>
      </form>
    )
  }
  
  renderTabWallet = () => {
    const {currentAccount} = this.state;
    const {blockchain} = this.props;

    return (
      <div className="wallet-tab">
          <div className="wallet">
            <h4>Account 4</h4>
            <div class="input-group mb-3">
              <input type="text" className="form-control input-readonly" readOnly value={currentAccount} />
              <div class="input-group-append">
                <button class="input-group-text btn btn-default btn-copy" onClick={this.copyAddressClipboard}>copy</button>
              </div>
            </div>
          </div>
          <div className="balance">
            <h4>Account balance</h4>
            <h1><strong>{formatCurrency(blockchain.balance, 4)}</strong> Ether</h1>
          </div>
      </div>
    );
  }

  renderTabDeposit = () => {
    const {currentAccount, showQr} = this.state;

    return (
      <div className="deposit-tab">
          <div className="deposit-wallet">
            <label>Address</label>
            <h4>{currentAccount}</h4>
          </div>
          <div className="btn-group">
            <button type="button" className="btn btn-info" onClick={this.copyAddressClipboard}>Copy Address</button>
            <button type="button" className="btn btn-info" onClick={this.showQRCode}>Show QR Code</button>
          </div>
          <div className="qrCode-over" style={{display: showQr ? 'block' : 'none'}} />
          <div className="qrCode" style={{display: showQr ? 'block' : 'none'}} >
              <button type="button" className="btn btn-default btn-close" onClick={this.closePopup}>x</button>
              <canvas id="qrcode"></canvas>
            </div>
      </div>
    );
  }

  render() {
    const {
      transaction,
      tabCurrent,
    } = this.state;

    let layoutHtml = '';

    switch (tabCurrent) {
      case Types.TABS.WITHDRAW:
        layoutHtml = this.renderTabWithdraw();
        break;
      case Types.TABS.WALLET:
        layoutHtml = this.renderTabWallet();
        break;
      case Types.TABS.DEPOSIT:
        layoutHtml = this.renderTabDeposit();
        break;
      default:
        break;
    }

    return (
    <div id="form-input" className="container-form">
        <div
          class={`alert alert-${transaction.type} alert-dismissible fade show notification-success`}
          role="alert"
          style={{display: transaction.display}}
        >
             {transaction.message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div id="tabs-button">
          <button
              type="button"
              className={`btn btn-info tabs-child ${tabCurrent === Types.TABS.ACCOUNT ? 'active' : ''}`}
              onClick={() => this.changeTabs(Types.TABS.ACCOUNT)}
            >
              Account
          </button>
          <button
              type="button"
              className={`btn btn-info tabs-child ${tabCurrent === Types.TABS.WALLET ? 'active' : ''}`}
              onClick={() => this.changeTabs(Types.TABS.WALLET)}
            >
              Wallet
          </button>
          <button
              type="button"
              className={`btn btn-info tabs-child ${tabCurrent === Types.TABS.DEPOSIT ? 'active' : ''}`}
              onClick={() => this.changeTabs(Types.TABS.DEPOSIT)}
            >
              Deposit
          </button>
          <button
              type="button"
              className={`btn btn-info tabs-child ${tabCurrent === Types.TABS.WITHDRAW ? 'active' : ''}`}
              onClick={() => this.changeTabs(Types.TABS.WITHDRAW)}
            >
              Withdraw
          </button>
          <button
              type="button"
              className={`btn btn-info tabs-child ${tabCurrent === Types.TABS.HISTORY ? 'active' : ''}`}
              onClick={() => this.changeTabs(Types.TABS.HISTORY)}
            >
              History
          </button>
        </div>
        <div id="content-layout">
          {layoutHtml}
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