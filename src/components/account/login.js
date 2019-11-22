import React from 'react';

import './account.css';

import * as Types from '../../constant/ActionTypes';

const $ = window.$;

class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      currentAccount: '',
	  tabCurrent: Types.TABS.LOGIN,
	  notification: {
		display: 'none',
		type: 'info',
		message: '',
	  }
    }
  }

  componentWillMount = async() => {
	//
  }

  componentWillReceiveProps = async(nextProps, nextState) => {
	  //
	  const { blockchain } = nextProps;

	  const { currentAccount } = this.state;

	  if (nextState.currentAccount !== currentAccount) {
		const currentAccountNew = await blockchain.getCurrentAccount();
		this.setState({
			currentAccount: currentAccountNew,
		})
	  }
  }

  
  changeProviderNetwork = async(provider) => {
    try {
		const { blockchain } = this.props;
		await blockchain.changeProvider(provider);
		const currentAccount = await blockchain.getCurrentAccount();
	
		this.setState({
			notification: {
				display: 'block',
				type: 'success',
				message: 'Change provider network success',
			},
			currentAccount,
		})

		setTimeout(() => {
			this.closeNotification();
		}, 3600);
    } catch(err) {
		this.setState({
			notification: {
				display: 'block',
				type: 'danger',
				message: Types.ERROR_EXCEPTION,
			}
		})

		setTimeout(() => {
			this.closeNotification();
		}, 3600);
      console.error(err);
    }
  }

  changeNetWork = (network) => {
	if (network) {
		this.changeProvider(network);
	}
  }

  changeTabs = (tab) => {
	this.setState({
		tabCurrent: tab,
	})
  }

  closeNotification = () => {
	this.setState({
		notification: {
		  display: 'none',
		  type: 'info',
		  message: '',
		}
	})
  }

  registerAccount = async() => {
	const { blockchain } = this.props;

	try {
		const userName = $('#username-register').val();

		const result  = await blockchain.updateAccount({
			userName: userName,
			score: 120,
		});

		console.log(result);

		if (result.status === true) {
			this.setState({
				notification: {
				display: 'block',
				type: 'success',
				loginMetaMask: true,
				message: `${result.message} : ${result.transactionHash}`,
				}
			});
		} else {
			this.setState({
				notification: {
				display: 'block',
				type: 'danger',
				loginMetaMask: true,
				message: result.message,
				}
			});
		}

		setTimeout(() => {
			this.closeNotification();
		}, 3600);
	} catch (err) {
		console.error(err);
	}
  }

  LoginAccount = async() => {
	  try {
		const { account, blockchain } = this.props;

		const userName = $('#username').val();

		if (userName) {
			const address = await blockchain.getCurrentAccount();

			const dataAccount = await blockchain.checkExitsAccount(userName, address);

			if (dataAccount && dataAccount.status === true && dataAccount.data) {
				const result = await account.setDataUser(dataAccount.data);
				if (result) {
					this.setState({
						notification: {
						display: 'block',
						type: 'success',
						loginMetaMask: true,
						message: 'Login success!',
						}
					})	
				}
			} else {
				this.setState({
					notification: {
					display: 'block',
					type: 'danger',
					loginMetaMask: true,
					message: 'Please check username or login MetaMask',
					}
				})	
			}
		}

		setTimeout(() => {
			this.closeNotification();
		}, 3600);
	  } catch (err) {
		  console.error(err);
	  }
  }

  renderLoginHtml = () => {
	  const { currentAccount } = this.state;

	  return (
		  <div className="login">
			  <div className="col-sm-12 form-group">
				<label>Wallet Address</label>
			  	<input type="text" className="form-control input-address" name="address" id="address" value={currentAccount} disabled/>
			  </div>
			  <div className="col-sm-12 form-group">
				<label>Username</label>
			  	<input type="text" className="form-control input-username" name="username" id="username" placeholder="Please enter username"/>
			  </div>
			  <div className="col-sm-12 form-group">
				  <button type="button" className="btn btn-info btn-login" onClick={this.LoginAccount}>Login</button>
				</div>
		  </div>
	  )
  }

  renderRegisterHtml = () => {
	const { currentAccount } = this.state;

		return (
			<div className="register">
				<div className="col-sm-12 form-group">
					<label>Wallet Address</label>
					<input type="text" className="form-control input-address" name="address" id="address" value={currentAccount} disabled/>
				</div>
				<div className="col-sm-12 form-group">
					<label>Username</label>
					<input type="text" className="form-control input-username" name="username-register" id="username-register" placeholder="Please enter username" />
				</div>
				<div className="col-sm-12 form-group">
					<button type="button" className="btn btn-info btn-register" onClick={this.registerAccount}>Register</button>
				</div>
			</div>
		)
	}

  
  render() {
    const {
		notification,
      tabCurrent,
    } = this.state;

	let tabHtml = ''

	if (tabCurrent === Types.TABS.LOGIN) {
		tabHtml = this.renderLoginHtml();
	};

	if (tabCurrent === Types.TABS.REGISTER) {
		tabHtml = this.renderRegisterHtml();
	};

    return (
		<div className='login-panel'>
			<div
			class={`alert alert-${notification.type} alert-dismissible fade show notification-success`}
			role="alert"
			style={{display: notification.display}}
			>
				{notification.message}
				<button type="button" class="close" onClick={this.closeNotification}>
					<span aria-hidden="true">&times;</span>
				</button>
			</div>
			<div className="select-network">
				<button type="button" className="btn btn-info active" onClick={() => this.changeProviderNetwork(Types.NETWORK.METAMASK)}>MetaMask</button>
				<button type="button" className="btn btn-success" onClick={() => this.changeProviderNetwork(Types.NETWORK.TESTNET)}>TestNet Ropsten</button>
				<button type="button" className="btn btn-default" onClick={() => this.changeProviderNetwork()}>Demo Game</button>
			</div>
			<div className="login-body">
				<div className="tab-button">
					<button type="button" className="btn btn-info active" onClick={() => this.changeTabs(Types.TABS.LOGIN)}>Login</button>
					<button type="button" className="btn btn-success" onClick={() => this.changeTabs(Types.TABS.REGISTER)}>Register</button>
				</div>
				<div className="tab-body">
					{tabHtml}
				</div>
			</div>
		</div>
    );
  }
}

export default Login;