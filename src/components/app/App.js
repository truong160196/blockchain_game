import React from 'react';
import './App.scss';
import Web3  from '../../utils/web3';

import MyCanvas  from '../Canvas/myCanvas';

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
      <MyCanvas />
    );
  }
}

export default App;