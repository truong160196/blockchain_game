import React from 'react';

import './notification.css';

import * as Types from '../../constant/ActionTypes';

// import component

class Notification extends React.Component {
    constructor(props) {
    super(props)
    this.state = {}
}

componentWillMount = async() => {
    //
}

render() {
const {
    title,
    message,
    visible,
    isConfirm,
    confirmModal,
    cancelModal,
} = this.props;

return (
    <div className="modal-confirm" style={{display: visible === true ? 'block': 'none'}}>
        <div className="header">
            <h3>{title}</h3>
            <button
            className="btn btn-default btn-close"
            onClick={cancelModal}
            >
                x
            </button>
        </div>
        <div className="body">
            {message}
        </div>
        <div className="footer">
            <button
            className="btn btn-default btn-confirm"
            style={{display: isConfirm === true ? 'block' : 'none'}}
            onClick={confirmModal}
            >
                Yes
            </button>
            <button
            className="btn btn-default btn-cancel"
            onClick={cancelModal}
            >
                Cancel
            </button>
        </div>
    </div>
    );
  }
}

export default Notification;