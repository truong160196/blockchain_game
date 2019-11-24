import React from 'react';

import './waitingScreen.css';


class WaitingScreen extends React.Component {
    constructor(props) {
    super(props)
    this.state = {}
}

componentWillMount = async() => {
    //
}

render() {

return (
    <div id="loader" className="loading-over" style={{display: 'none'}}>
        <div class='loader'>
            <div class='loader--dot'></div>
            <div class='loader--dot'></div>
            <div class='loader--dot'></div>
            <div class='loader--dot'></div>
            <div class='loader--dot'></div>
            <div class='loader--dot'></div>
            <div class='loader--text'></div>
        </div>
    </div>
    );
  }
}

export default WaitingScreen;