import PIXI from '../pixi';

class Entities {
	constructor(arg) {
		this.position = {
			x: arg.position.x || 0,
			y: arg.position.y || 0
		}
		this.tilePosition = {
			x: arg.tilePosition.x || 0,
			y: arg.tilePosition.y || 0
		}
	
		this.viewportX = arg.viewportX || 0;

		this.deltaX = arg.deltaX || 0;

		this.image = {
			src: arg.image.src,
			width: arg.image.width,
			height: arg.image.height
		}

		this.game = arg.game;

		this.init();
	}

	init = () => {
		this.texture = PIXI.Texture.from(this.image.src);
		
		this.entities = new PIXI.Sprite(this.texture, this.image.width, this.image.height);

		this.entities.x = this.position.x;
		this.entities.y = this.position.y;
		this.entities.vx = 0;
        this.entities.vy = 0;
	}

	update = () => {
		        //Capture the keyboard arrow keys
			let left = this.keyboard(37),
			up = this.keyboard(38),
			right = this.keyboard(39),
			down = this.keyboard(40);
			
			//Left arrow key `press` method
			left.press = () => {
				//Change the this.entities's velocity when the key is pressed
				this.entities.vx = -5;
				this.entities.vy = 0;
			};
			//Left arrow key `release` method
			left.release = () => {
				//If the left arrow has been released, and the right arrow isn't down,
				//and the this.entities isn't moving vertically:
				//Stop the this.entities
				if (!right.isDown && this.entities.vy === 0) {
					this.entities.vx = 0;
				}
			};
			//Up
			up.press = () => {
				this.entities.vy = -5;
				this.entities.vx = 0;
			};
			up.release = () => {
				if (!down.isDown && this.entities.vx === 0) {
					this.entities.vy = 0;
				}
			};
			//Right
			right.press = () => {
				this.entities.vx = 5;
				this.entities.vy = 0;
			};
			right.release = () => {
				if (!left.isDown && this.entities.vy === 0) {
					this.entities.vx = 0;
				}
			};
			//Down
			down.press = () => {
				this.entities.vy = 5;
				this.entities.vx = 0;
			};
			down.release = () => {
				if (!up.isDown && this.entities.vx === 0) {
					this.entities.vy = 0;
				}
			};

			this.game.ticker.add(delta => this.gameLoop(delta));
	}

	gameLoop = (delta) => {
        //Update the current game state:
        this.play(delta);
	}
	
	play = (delta) => {
        this.entities.x += this.entities.vx;
        this.entities.y += this.entities.vy;
        this.contain(this.entities, {
            x: 0,
            y: 0,
            width: 512,
            height: 300
        });
	}
	
	  /* Helper functions */
	  contain = (sprite, container) => {
        let collision = undefined;
        //Left
        if (sprite.x < container.x) {
            sprite.x = container.x;
            collision = "left";
        }
        //Top
        if (sprite.y < container.y) {
            sprite.y = container.y;
            collision = "top";
        }
        //Right
        if (sprite.x + sprite.width > container.width) {
            sprite.x = container.width - sprite.width;
            collision = "right";
        }
        //Bottom
        if (sprite.y + sprite.height > container.height) {
            sprite.y = container.height - sprite.height;
            collision = "bottom";
        }
        //Return the `collision` value
        return collision;
    }

	//The `keyboard` helper function
	keyboard = (keyCode) => {
		var key = {};
		key.code = keyCode;
		key.isDown = false;
		key.isUp = true;
		key.press = undefined;
		key.release = undefined;
		//The `downHandler`
		key.downHandler = (event) => {
			if (event.keyCode === key.code) {
				if (key.isUp && key.press) key.press();
				key.isDown = true;
				key.isUp = false;
			}
			event.preventDefault();
		};
		//The `upHandler`
		key.upHandler = (event) => {
			if (event.keyCode === key.code) {
				if (key.isDown && key.release) key.release();
				key.isDown = false;
				key.isUp = true;
			}
			event.preventDefault();
		};
		//Attach event listeners
		window.addEventListener(
			"keydown", key.downHandler.bind(key), false
		);
		window.addEventListener(
			"keyup", key.upHandler.bind(key), false
		);
		return key;
	}
}

export default Entities;