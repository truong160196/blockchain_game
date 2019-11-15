import React from 'react';

import Main from '../../utils/screen/home/main';

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      urlBase: null,
    }
  }

  componentWillMount = () => {
    const define = {
      config: {
        urlSource: './assets/template/main.json'
      }
    };

    var gameDev = new Main(define);

    gameDev.init();
  }

  render() {
    return (
	//   <Main />
	<div className="container"></div>
    );
  }
}

export default Home;