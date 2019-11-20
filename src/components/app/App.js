import React from 'react';
import LazyLoad from 'react-lazyload';

import Main from '../home/home';

class App extends React.Component {
  componentWillMount = () => {
    //
  }

  render() {
    return (
      <LazyLoad>
        <Main />
      </LazyLoad>
    );
  }
}

export default App;