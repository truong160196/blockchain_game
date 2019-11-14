import React from 'react';
import { connect } from 'react-redux';

import Blockchain from '../../utils/blockchain';

import postData from '../../actions/blockchain/index';

const $ = window.$;
const mainnet = 'https://ropsten.infura.io/v3/cde205b23d7d4a998f4ee02f652355b0';
const local =  'http://localhost:8545'

class MetaMask extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      urlBase: null,
    }
  }

  componentWillMount = () => {
    this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const { urlBase } = this.state;

    try {
      const config = {
        gasPrice: '1400000000',
        gas: 210000,
      }
      
      this.blockchain = new Blockchain(urlBase, config, this.props.postData);

      await this.blockchain.init();

      await this.blockchain.connectMetaMask();

      this.blockchain.subscribe('log', '0x248062ceD7E34354651c930940b93e48281E2BFf')
    } catch (err) {
      console.error(err);
    }

  }
  
  getBalance = async() => {
    try {
      const address = $('#address').val();

      const result = await this.blockchain.getBalance(address);
  
      if (result) {
        this.setState({
          balanceState: 'My Balance: ' + result
        })
      }
    } catch (err) {
      console.error(err);
    }
  }

  sendToken = async() => {
    try {
      const toAddress = $('#toAddress').val();
      let fromAddress = $('#fromAddress').val();
      let value = $('#value').val();
      if (!fromAddress) {
        fromAddress = await this.blockchain.getCurrentAccount();
      }

      const data = await this.blockchain.sendTransaction(fromAddress, toAddress, value)

      if (data.transactionHash) {

        await this.getTransaction(data.transactionHash);

        this.setState({
          message: 'Please check hash: ' + data.transactionHash
        })
      }

      if (data.err) {
        this.setState({
          message: data.err.message
        })
      }
    } catch (err) {
      console.error(err);
    }
  }

  importAccount = async() => {
    try {
      const account = $('#account').val();

      const result = await this.blockchain.importAccountByPrivateKey(account);
  
      if (result) {
        this.setState({
          account: 'account: ' + result.address
        })
      }
    } catch(err) {
      console.error(err);
    }
  }

  createAccount =  async() => {
    try {
      const password = $('#password').val();

      const result = await this.blockchain.createNewAccount(password);
      if (result) {
        this.setState({
          newAccount: 'new account: ' + result
        })
      }
    } catch(err) {
      console.error(err);
    }
  }

  getTransaction = async(hash) => {
    try {
      let txHash = $('#txHash').val();

      if(typeof hash === 'string') {
        txHash = hash;
      }

      const result = await this.blockchain.getTransaction(txHash);

      if (result && result.data) {
        this.setState({
          txHash: result.data
        })
      } else {
        alert(result.error || 'exception');
        this.setState({
          txHash: null
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  getTransactionFromBlock =  async() => {
    try {
      const blockNumber = $('#blockNumber').val();

      const result = await this.blockchain.getTransactionFromBlock(blockNumber);

      if (result && result.data) {
        this.setState({
          txHash: result.data
        })
      } else {
        alert(result.error || 'exception')
        this.setState({
          txHash: null
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  getDataInput = async () => {
    try {
      const dataInput = $('#dataInput').val();

      const result = await this.blockchain.getInputDataFromTransaction(dataInput);

      if (result && result.data) {
        console.log(result.data);
        this.setState({
          dataInput: JSON.stringify(result.data)
        })
      } else {
        alert(result.error || 'exception')
        this.setState({
          dataInput: null
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  testFunction = async() => {
    // this.blockchain.getTotalSupply();
    this.blockchain.signData();
  }

  changeProvider = async() => {
    try {
      const provider = $('#provider').val();

      if (provider === -1) {
        await this.blockchain.changeProvider(null);
        alert('connect to metaMask success');
      } else {
        await this.blockchain.changeProvider(provider);
        alert(`change provider: ${provider}`);
      }
  
  
      this.setState({
        urlBase: provider,
      })
    } catch(err) {
      console.error(err);
    }
  }

  getAllAccount = async() => {
    try {
      const result  = await this.blockchain.getAllAccount();

      this.setState({allAccount: result.data})
    } catch(err) {
      console.error(err);
    }
  }

  getCurrentAccount = async() => {
    try {
      const result = await this.blockchain.getCurrentAccount();

      this.setState({currentAccount: result})
    } catch(err) {
      console.error(err);
    }
  }

  renderTableHash = () => {
    const {txHash} = this.state;

    let table = '';

    if (txHash) {
      table = (
        <table>
        <tbody>
          <tr>
            <td>blockHash</td>
            <td>{txHash.blockHash}</td>
          </tr>
          <tr>
            <td>blockNumber</td>
            <td>{txHash.blockNumber}</td>
          </tr>
          <tr>
            <td>from Address</td>
            <td>{txHash.from}</td>
          </tr>
          <tr>
            <td>to Address</td>
            <td>{txHash.to}</td>
          </tr>
          <tr>
            <td>Value</td>
            <td>{this.blockchain.convertEtherToValue(txHash.value)}</td>
          </tr>
          <tr>
            <td>gas</td>
            <td>{txHash.gas}</td>
          </tr>
          <tr>
            <td>gasPrice</td>
            <td>{txHash.gasPrice}</td>
          </tr>
          <tr>
            <td>hash</td>
            <td>{txHash.hash}</td>
          </tr>
          <tr>
            <td>nonce</td>
            <td>{txHash.nonce}</td>
          </tr>
        </tbody>
      </table>
      );
    }

    return table;
  }

  renderTableAccount = () => {
    const { allAccount } = this.state;

    let tableAccount = '';

    if (allAccount) {
      tableAccount = allAccount.map((element, index) => {
        return (
          <tr key={index.toString()}>
            <td>{index}</td>
            <td>{element}</td>
          </tr>
        );
      });
    } else {
      tableAccount = '';
    }

    return tableAccount;
  }


  render() {
    const {
      message,
      balanceState,
      account,
      newAccount,
      currentAccount,
      dataInput,
    } = this.state;

    const { blockchain } = this.props;

    // console.log(this.props)
    return (
      <div className="container" style={{marginTop: 30}}>
        <label>My Balance: {blockchain.balance}</label>
        <div className="row">
          <div className="form-group col-sm-3">
            <label>Change provider</label>
              <select
                id="provider"
                name="provider"
                className="form-control"
                onChange={this.changeProvider}
              >
                <option value={-1}>MetaMask</option>
                <option value={local}>localhost:8545</option>
                <option value={mainnet}>Ropsten Testnet</option>
              </select>
            </div>
        </div>
        <label>Send token ether:</label>
        <div className="row">
          <div className="form-group col-sm-3">
            <label>From Address</label>
              <input
                id="fromAddress"
                name="fromAddress"
                className="form-control"
                type="text"
                placeholder="enter fromAddress"
              />
            </div>
            <div className="form-group col-sm-3">
              <label>To Address</label>
                <input
                  id="toAddress"
                  name="toAddress"
                  className="form-control"
                  type="text"
                  placeholder="enter toAddress"
                />
            </div>
            <div className="form-group col-sm-3">
              <label>Value</label>
              <input
                id="value"
                name="value"
                className="form-control"
                type="text"
                value={0.05}
                placeholder="enter value"
              />
            </div>
          <div className="form-group col-sm-3">
              <button className="btn btn-success" onClick={this.sendToken} >Send</button>
          </div>
          <div className="form-group col-sm-12">
              <h4>{message}</h4>
          </div>
        </div>
        <div className="row">
          <div className="form-group col-sm-3">
            <label>Check tx hash</label>
              <input
                id="txHash"
                name="txHash"
                className="form-control"
                type="text"
                placeholder="enter tx hash"
              />
            </div>
            <div className="form-group col-sm-3">
                <button className="btn btn-success" onClick={this.getTransaction} >check hash</button>
            </div>
            <div className="form-group col-sm-3">
            <label>Check hash from block number</label>
              <input
                id="blockNumber"
                name="blockNumber"
                className="form-control"
                type="text"
                placeholder="enter block number"
              />
            </div>
            <div className="form-group col-sm-3">
                <button className="btn btn-success" onClick={this.getTransactionFromBlock} >check block</button>
            </div>
            <div className="form-group col-sm-12">
              {this.renderTableHash()}
            </div>
        </div>

        <div className="row">
          <div className="form-group col-sm-3">
            <label>Get data Input Transaction</label>
              <input
                id="dataInput"
                name="dataInput"
                className="form-control"
                type="text"
                placeholder="enter tx hash transaction"
              />
            </div>
            <div className="form-group col-sm-3">
                <button className="btn btn-success" onClick={this.getDataInput} >Get data</button>
            </div>
            <div className="form-group col-sm-12">
                <h4>{dataInput}</h4>
            </div>
        </div>

        <div className="row">
          <div className="form-group col-sm-3">
            <label>Check Balance</label>
              <input
                id="address"
                name="address"
                className="form-control"
                type="text"
                placeholder="enter address"
              />
            </div>
            <div className="form-group col-sm-3">
                <button className="btn btn-success" onClick={this.getBalance} >check</button>
            </div>
            <div className="form-group col-sm-12">
                <h4>{balanceState}</h4>
            </div>
        </div>

        <div className="row">
          <div className="form-group col-sm-3">
            <label>Import account</label>
              <input
                id="account"
                name="account"
                className="form-control"
                type="text"
                placeholder="enter private key"
              />
            </div>
            <div className="form-group col-sm-3">
                <button className="btn btn-success" onClick={this.importAccount} >Import account</button>
            </div>
            <div className="form-group col-sm-12">
                <h4>{account}</h4>
            </div>
        </div>

        <div className="row">
          <div className="form-group col-sm-3">
            <label>Create account</label>
              <input
                id="password"
                name="password"
                className="form-control"
                type="text"
                placeholder="enter password"
              />
            </div>
            <div className="form-group col-sm-3">
                <button className="btn btn-success" onClick={this.createAccount} >create account</button>
            </div>
            <div className="form-group col-sm-12">
                <h4>{newAccount}</h4>
            </div>
        </div>
        <label>Get current account</label>
        <div className="form-group col-sm-12">
            <button className="btn btn-success" onClick={this.getCurrentAccount} >get</button>
        </div>
        <div className="form-group col-sm-12">
            <h4>{currentAccount}</h4>
        </div>
        <div className="form-group col-sm-12">
            <button className="btn btn-success" onClick={this.testFunction} >test</button>
        </div>
        <div className="form-group col-sm-12">
            <button className="btn btn-success" onClick={this.getAllAccount} >get all account</button>
        </div>
        <div>
          <table style={{width: '100%'}}>
            <tbody>
                {this.renderTableAccount()}
            </tbody>
          </table>
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

export default connect(mapStateToProps, mapDispatchToProps)(MetaMask);