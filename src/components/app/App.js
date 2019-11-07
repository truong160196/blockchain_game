import React from 'react';
import './App.scss';

const Web3 = window.Web3;

class App extends React.Component {
  componentWillMount() {
    this.loadBlockchainData()
  }

  async loadBlockchainData() {
    var web3 = new Web3("ws://localhost:8545");

    web3.eth.getNodeInfo(function(error, result){
      if(error){
         console.log( 'error' ,error);
      }
      else{
         console.log( 'result',result );
      }
 });
  }

  constructor(props) {
    super(props)
    this.state = { account: '' }
  }

  render() {
    return (
      <div className="container">
        <h1>Hello, World!</h1>
        <p>Your account: {this.state.account}</p>
      </div>
    );
  }
}

export default App;