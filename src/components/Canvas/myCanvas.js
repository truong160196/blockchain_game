import React, {Component} from 'react';
import GameEngine from '../Game/GameEngine';

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
        };
      }

    render() {
      const {circle1, circle2} = this.state;
      return (
        <GameEngine
          entities={[circle1, circle2]}
        />
      );
	}
}

export default myCanvas;