import React from 'react';
import QRCode from 'qrcode';

import './account.css';

import { formatCurrency } from '../../utils/formatNumber';
import * as Types from '../../constant/ActionTypes';

import Notification from '../notification/notification';
import Waiting from '../waiting/waiting';

const $ = window.$;

class Account extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      urlBase: null,
      balanceEth: 0,
      currentAccount: '',
      isEdit: false,
      tabCurrent: Types.TABS.ACCOUNT,
      typeWithdraw: Types.TYPE_WITHDRAW.ETH,
      notice: {
        message: '',
        isConfirm: false,
        title: 'Notification!',
        visible: false,
      },
      waiting: false,
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

  validateValueToken = async(value) => {
    const { blockchain } = this.props;
    const { typeWithdraw } = this.state;

    let message = '';
    let result = true;

    const balanceEth = await blockchain.getBalance();
    const balanceToken = await blockchain.getBalanceToken();

    if (value === 0 && value > balanceEth && typeWithdraw === Types.TYPE_WITHDRAW.ETH) {
        message = (
          <h5 style={{color: 'red'}}>The account has not enough balance ETH</h5>
      );

      result = false;
    }

    if (typeWithdraw === Types.TYPE_WITHDRAW.TOKEN) {
        if (value === 0 && value > balanceToken) {
          message = (
            <h5 style={{color: 'red'}}>The account has not enough balance {Types.TOKEN}</h5>
        );

        result = false;
      }

      if (Number.isInteger(value) === false) {
        message = (
            <h5 style={{color: 'red'}}>Please enter the value has type is integer</h5>
        );

        result = false;
      }
    }

    return {
      status: result,
      message: message
    };
  }
  

  sendToken = async() => {
      let message = '';
    try {
        const { blockchain } = this.props;
        const { typeWithdraw } = this.state;

        const toAddress = $('#toAddress').val();
        let value = Number($('#value').val());
        this.setState({
          waiting: true,
        });
      
        const validate =  await this.validateValueToken(value);

        if (validate.status === true ) {
          let data = {};
          if (typeWithdraw === Types.TYPE_WITHDRAW.ETH) {
            data = await blockchain.sendTransaction(toAddress, value)
          }

          if (typeWithdraw === Types.TYPE_WITHDRAW.TOKEN) {
            data = await blockchain.sendToken(toAddress, value)
          }

          $('#toAddress').val('');
          
          if (data.status === true && data.message) {
            $('#value').val('');
            message = (
              <div>
                  <h5 style={{color: 'green'}}>Send token Successfully! Please check transaction detail</h5>
                  <a href={`https://ropsten.etherscan.io/tx/${data.message}`}  target="_blank" >{data.message}</a>
              </div>
            );
          }
          if (data.status === false) {
            message = (
              <h5 style={{color: 'red'}}>Something is wrong with your request, possibly due to invalid argument.</h5>
            );
          }
        } else {
          message = validate.message;
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
            title: 'Withdraw token'
        },
        waiting: false,
    });
  }

  getTokenFree = async() => {
    let message = '';
    try {
        const { blockchain } = this.props;
        this.setState({
          waiting: true,
        });
      
      const data = await blockchain.getFreeToken();
        
        if (data.status === true && data.message) {
          message = (
            <div>
                <h5 style={{color: 'green'}}>Send token Successfully! Please check transaction detail</h5>
                <a href={`https://ropsten.etherscan.io/tx/${data.message}`}  target="_blank" >{data.message}</a>
            </div>
          );
        }
        if (data.status === false) {
          if (!data.message) {
            message = (
              <h5 style={{color: 'red'}}>Something is wrong with your request, possibly due to invalid argument.</h5>
            );
          } else {
            message = (
              <h5 style={{color: 'red'}}>{data.message}</h5>
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
            title: 'Withdraw token'
        },
        waiting: false,
    });
  }

  showQRCode = () => {
    const {myAccount} = this.props;

    const canvas = document.getElementById('qrcode')
 
    QRCode.toCanvas(canvas, myAccount.address, {width: 250}, function (error) {
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
    const { myAccount } = this.props;

    const textField = document.createElement('textarea')
    textField.innerText = myAccount.address;
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

  changeTabs = async(tab) => {
    const { blockchain } = this.props;

    this.setState({
      waiting: true,
    })
    
    await blockchain.getBalanceToken();
    this.setState({
      tabCurrent: tab,
      waiting: false,
    })
  }

  changeTypeWithdraw = (type) => {
    this.setState({
      typeWithdraw: type
    })
  }

  openModalEditAccount = () => {
    const {isEdit} = this.state;

    if (isEdit === false) {
      this.setState({
        isEdit: true,
      });
    }
  }

  saveEditAccount = () => {
    this.setState({
      isEdit: false,
    });
  }

  renderTabWithdraw = () => {
    const {myAccount} = this.props;
    const {typeWithdraw} = this.state;

    return (
      <form id="form-send-token">
         <div className="select-group">
          <button
            type="button"
            className={`btn btn-default ${typeWithdraw === Types.TYPE_WITHDRAW.ETH ? 'active' : 'none'}`}
            title="Select token ETH"
            onClick={() => this.changeTypeWithdraw(Types.TYPE_WITHDRAW.ETH)}
          >
            {formatCurrency(myAccount.balanceEth, 4)} ETH
          </button>
          <button
            type="button"
            className={`btn btn-default ${typeWithdraw === Types.TYPE_WITHDRAW.TOKEN ? 'active' : 'none'}`}
            title="Select token QTN"
            onClick={() => this.changeTypeWithdraw(Types.TYPE_WITHDRAW.TOKEN)}
          >
            {formatCurrency(myAccount.balanceToken, 0)} QTN
          </button>
        </div>
        <div className="form-group">
          <label>Address: </label>
          <input id="toAddress" className="form-control" type="text" placeholder="Please enter receive address"/>
        </div>
        <div className="form-group">
          <label>Value ({typeWithdraw === Types.TYPE_WITHDRAW.TOKEN ? Types.TOKEN : 'ETH'}): </label>
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
  
  renderTabDeposit = () => {
	const { myAccount } = this.props;
    const {showQr} = this.state;

    return (
      <div className="deposit-tab">
          <div className="deposit-wallet">
            <label>Address</label>
            <h4>{myAccount.address}</h4>
              <div className="btn-group-deposit">
                <button type="button" className="btn btn-info" onClick={this.copyAddressClipboard}>Copy Address</button>
                <button type="button" className="btn btn-info" onClick={this.showQRCode}>Show QR Code</button>
            </div>
          </div>
          <div className="receive-coin">
              <div className="info">
                  <h4><strong>Smart contract: </strong></h4>
                  <a href={`https://ropsten.etherscan.io/address/${Types.CONTRACT_ADDRESS}`} target="_blank">{Types.CONTRACT_ADDRESS}</a>
                  <h4><strong>TOKEN: </strong></h4>
                  <a href={`https://ropsten.etherscan.io/token/${Types.CONTRACT_ADDRESS}`} target="_blank">{Types.TOKEN}</a>
              </div>
              <div className="form-group btn-group-deposit">
                <button
                type="button"
                className="btn btn-info"
                onClick={this.getTokenFree}>
                  Get 200 {Types.TOKEN} free
                  </button>
              </div>
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
	  const { myAccount } = this.props;
    const {isEdit}= this.state;

	  return (
      <div className="wallet-tab">
        <div className="wallet">
          <div className="display-name">
            <h4 style={{display: isEdit === false ? 'block' : 'none'}}>{myAccount.userName}</h4>
            <input
              id="username"
              className="form-control user-name"
              type="text" placeholder="Enter Username"
              style={{display: isEdit === true ? 'block' : 'none'}}
            />
            <button
              type="button"
              className="btn btn-default btn-edit"
              onClick={ () => 
                isEdit === false ? this.openModalEditAccount() : this.saveEditAccount()
              }
            >
              {isEdit === false ? 'Edit' : 'Save'}
            </button>
          </div>
          <div class="input-group mb-3">
            <input type="text" className="form-control input-readonly" readOnly value={myAccount.address} />
            <div class="input-group-append">
              <button class="input-group-text btn btn-default btn-copy" onClick={this.copyAddressClipboard}>copy</button>
            </div>
          </div>
        </div>
        <div className="balance">
          <h4>Account Balance</h4>
          <h2><strong>{formatCurrency(myAccount.balanceEth, 4)}</strong> ETH</h2>
          <h2><strong>{formatCurrency(myAccount.balanceToken, 0)}</strong> QTN</h2>
        </div>
    </div>
	  );
  }

  renderTabHistory = () => {
	  const { blockchain } = this.props;

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
      notice,
      waiting,
      tabCurrent,
      transaction,
    } = this.state;

    let layoutHtml = '';

    switch (tabCurrent) {
      case Types.TABS.ACCOUNT:
        layoutHtml = this.renderTabAccount();
      break;
      case Types.TABS.WITHDRAW:
        layoutHtml = this.renderTabWithdraw();
        break;
      case Types.TABS.DEPOSIT:
        layoutHtml = this.renderTabDeposit();
        break;
      case Types.TABS.HISTORY:
        layoutHtml = this.renderTabHistory();
        break;
      default:
          layoutHtml = this.renderTabAccount();
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
              style={{display: 'none'}}
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