    import React from 'react';

    import './rank.css';

    import * as Types from '../../constant/ActionTypes';
    import {dynamicSort} from '../../utils/formatNumber';
    // import component

class Rank extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentWillMount = async() => {
        //
    }

    renderTableHtml = () => {
        const {myAccount} = this.props;
        const {ranking} = myAccount;
        let table = '';

        if (ranking && ranking.length > 0) {
            table = ranking.map((item, index) => {
                if (item.score > 0) {
                    return (
                        <tr key={index.toString()}>
                            <td>{index + 1}</td>
                            <td>{item.address_player}</td>
                            <td>{item.score}</td>
                        </tr>
                    );
                }
            });
        }

        return table;
    }

    render() {
        const tableBody = this.renderTableHtml();
        return (
            <div id="rank-panel" className="ranking">
               <table class="table table-striped">
                <thead>
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">Address</th>
                    <th scope="col">Score</th>
                    </tr>
                </thead>
                <tbody>
                   {tableBody}
                </tbody>
                </table>
            </div>
        );
    }
}

export default Rank;