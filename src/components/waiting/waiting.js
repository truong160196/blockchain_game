import React from 'react';

import './waiting.css';

// import component

class Waiting extends React.Component {
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
    <div style={{display: waiting === true ? 'block' : 'none' }}>
        <div className="waiting-over" />
        <div class="sk-chase">
            <div class="sk-chase-dot"></div>
            <div class="sk-chase-dot"></div>
            <div class="sk-chase-dot"></div>
            <div class="sk-chase-dot"></div>
            <div class="sk-chase-dot"></div>
            <div class="sk-chase-dot"></div>
        </div>
    </div>
    );
  }
}

export default Waiting;