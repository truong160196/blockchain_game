import React, {Component} from 'react';
import GameEngine from '../game/GameEngine';

import player1Instance from '../../assets/images/player1.jpg'

const imagePlayer1 = new Image();

imagePlayer1.src = player1Instance;

const supported_keys = {
  circle1: {
    LEFT: 37,
    RIGHT: 39,
    UP: 38,
    DOWN: 40
  },
  circle2: {
    LEFT: 65,
    RIGHT: 68
  }
}


class myCanvas extends Component {
    constructor(props) {
        super(props);
        this.state = {
          circle1: {
            name: 'circle1',
            type: 'circle',
            options: {
              position: {
                x: window.innerWidth/2 + 50,
                y: window.innerHeight / 2
              },
              color: 'green',
              radius: 30,
              key: {
                left: supported_keys.circle1.LEFT,
                right: supported_keys.circle1.RIGHT,
                up: supported_keys.circle1.UP,
                down: supported_keys.circle1.DOWN
              },
              velocity:6
            },
          },
          circle2: {
            name: 'circle2',
            type: 'circle',
            options: {
              position: {
                x: window.innerWidth / 2 - 50,
                y: window.innerHeight / 2
              },
              color: 'blue',
              radius: 30,
              key: {
                left: supported_keys.circle2.LEFT,
                right: supported_keys.circle2.RIGHT
              },
            },
          },
          player1: {
            name: 'player1',
            type: 'image',
            options: {
              position: {
                x: 150,
                y: 100,
              },
              width: 100,
              height: 100,
              color: 'blue',
              radius: 30,
              image: imagePlayer1,
              key: {
                left: supported_keys.circle2.LEFT,
                right: supported_keys.circle2.RIGHT
              },
            },
          },
        };
      }

    handlePlay = () => {
      const { player1 } = this.state;
      const dataState = [];

      const widthScreen = window.innerWidth;
      const heightScreen = window.innerHeight;

      let numberAdd = 50;

      setInterval(() => {
        numberAdd += 20;
        if (player1.options.position.x + numberAdd < widthScreen) {
          player1.options.position.x += numberAdd;

          if (player1.options.position.y + 10 < heightScreen) {
            player1.options.position.y += 10;
          }
        }
        
      dataState.player1 = player1;

      this.setState(dataState);
      }, 50);
    }

    render() {
      const {circle1, circle2, player1} = this.state;
      return (
        <div>
          <GameEngine
            entities={[circle1, circle2, player1]}
          />
          <button type="button" className="btn btn-success" onClick={this.handlePlay} > Play </button>
        </div>
      );
	}
}

export default myCanvas;