import React from 'react';

// import game from '../../utils/game';

// import Scroller02 from '../game/Scroller02';

import MetaMask from '../../components/blockchain/MetaMask'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      urlBase: null,
    }
  }

  componentWillMount = () => {
    // const define = {
    //   config: {
    //     urlSource: './assets/images/treasureHunter.json'
    //   }
    // };

    // var gameDev = new game(define);

    // gameDev.init();

    // gameDev.loaderResource();
  }

  render() {
    return (
      <MetaMask />
    );
  }
}

export default App;