import React from 'react';

import './rank.css';

import * as Types from '../../constant/ActionTypes';

// import component

class Rank extends React.Component {
    constructor(props) {
    super(props)
    this.state = {}
}

componentWillMount = async() => {
    //
}

render() {
const {
    waiting,
} = this.props;

return (
        <div id="rank-panel" className="ranking">
                
        </div>
    );
  }
}

export default Rank;