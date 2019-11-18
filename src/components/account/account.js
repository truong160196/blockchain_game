import React from 'react';
import QRCode from 'qrcode';

import './account.css';

import { formatCurrency } from '../../utils/formatNumber';
import * as Types from '../../constant/ActionTypes';

const $ = window.$;

class Account extends React.Component {
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
	  //
  }

  componentWillReceiveProps = async(nextProps) => {
  	//
  }

  sendToken = async() => {
    try {
		const { blockchain } = this.props;

		const toAddress = $('#toAddress').val();
		let value = $('#value').val();

		const data = await blockchain.sendTransaction(null, toAddress, value)

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
    const {currentAccount} = this.props;

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
    const { currentAccount } = this.props;

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
    const { account, currentAccount } = this.props;

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
            <h1><strong>{formatCurrency(account.balance, 4)}</strong> Ether</h1>
          </div>
      </div>
    );
  }

  renderTabDeposit = () => {
	const { currentAccount } = this.props;
    const {showQr} = this.state;

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

  renderTabAccount = () => {
	  const { currentAccount } = this.props;

	  const listAccount = [
		{
			address: '0x4C84c7489126865688ADe51e8c8e1be1f5C6Afb7',
		},
		{
			address: '0xD49a3a4a50D6f3CDBbBc8b9A002211F97cca8DED',
		},
	];

	const tableBody = listAccount.map((item, index) => {
		return (<tr key={index.toString()}>
			<td width="10%">{index}</td>
			<td width="60%">{item.address}</td>
			<td width="30%">
				<button type="button" className="btn btn-info">send gift</button>
			</td>
		</tr>)
	})

	  return (
		<div className="account-tab">
			<div className="account-name">
				<h4>Account 4</h4>
			</div>
			<div className="account-name">
				<label>account address:</label>
				<h4>{currentAccount}</h4>
				<span>address will change when connect metaMask</span>
			</div>
			<div className="list-friend">
				<table className="table table-striped">
					<thead>
						<tr>
							<th width="10%">#</th>
							<th width="60%">Account Address</th>
							<th width="30%"></th>
						</tr>
					</thead>
					<tbody>
						{tableBody}
					</tbody>
				</table>
			</div>
		</div>
	  );
  }

  renderTabHistory = () => {
	  const { blockchain } = this.props;

	  blockchain.getAllTransaction();

	  const listTransaction = [
		  {
			status: 'complete',
			amount: '0.5',
			date: '2019/11/01',
			transactionHash: '0x29e96ec8db286d095a43d2b8dd4acce5d166c605840970c56f509334a0fba4d0',
		  },
		  {
			status: 'complete',
			amount: '3.5',
			date: '2019/11/03',
			transactionHash: '0x29e96ec8db286d095a43d2b8dd4acce5d166c605840970c56f509334a0fba4d0',
		  },
		  {
			status: 'cancel',
			amount: '10.5',
			date: '2019/11/12',
			transactionHash: '0x29e96ec8db286d095a43d2b8dd4acce5d166c605840970c56f509334a0fba4d0',
		  }
	  ]
	  const tableBody = listTransaction.map((item, index) => {
			return (<tr key={index.toString()}>
				<td width="10%">{index}</td>
				<td width="20%">{item.status}</td>
				<td width="20%">{item.amount}</td>
				<td width="20%">{item.date}</td>
				<td width="30%">
					<a
						href={`https://ropsten.etherscan.io/tx/${item.transactionHash}`}
						title={item.transactionHash}
						target="_blank"
					>
					{item.transactionHash}
					</a>
				</td>
			</tr>)
		});

	  return (
		<div className="history-tab">
			<div className="list-transaction">
				<table className="table table-striped">
					<thead>
						<tr>
							<th width="10%">#</th>
							<th width="20%">Status</th>
							<th width="20%">Amount</th>
							<th width="20%">Date</th>
							<th width="30%">Information transaction</th>
						</tr>
					</thead>
					<tbody>
						{tableBody}
					</tbody>
				</table>
			</div>
		</div>
	  )
  }

  render() {
    const {
      transaction,
      tabCurrent,
    } = this.state;

    let layoutHtml = '';

    switch (tabCurrent) {
	case Types.TABS.ACCOUNT:
		layoutHtml = this.renderTabAccount();
		break;
      case Types.TABS.WITHDRAW:
        layoutHtml = this.renderTabWithdraw();
        break;
      case Types.TABS.WALLET:
        layoutHtml = this.renderTabWallet();
        break;
      case Types.TABS.DEPOSIT:
        layoutHtml = this.renderTabDeposit();
		break;
	case Types.TABS.HISTORY:
		layoutHtml = this.renderTabHistory();
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

export default Account;