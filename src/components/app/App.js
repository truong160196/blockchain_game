import React from 'react';
import './App.scss';
import Web3  from '../../utils/web3';

// import MyCanvas  from '../canvas/myCanvas';

import game from '../../utils/game';

class App extends React.Component {
  componentWillMount() {
    // this.loadBlockchainData()
    const define = {
      config: {
        urlSource: './assets/images/treasureHunter.json'
      }
    };

    var gameDev = new game(define);

    gameDev.init();

    gameDev.loaderResource();
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
      <div>

      </div>
      // <MyCanvas />
    );
  }
}

export default App;