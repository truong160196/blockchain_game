import React, {Component} from 'react';
import Game2 from '../../utils/game';

class Scroller02 extends Component {
	componentWillMount = () => {
		const options = {
		  config: {
			width: 512,
			height: 384,
			canvasId: 'game-canvas'
		  }
		};

		this.gameDev = new Game2(options);
	
		this.gameDev.init();

    	this.gameDev.loaderResource();
	  }

    render() {
		return (
		<div align="center">
			{/* <canvas id="game-canvas" width="512" height="384"></canvas> */}
		</div>
		);
	}
}

export default Scroller02;