import * as PIXI from 'pixi.js';
import { formatCurrency } from '../formatNumber';

class Entities {
	constructor(arg) {

		if (arg.margin) {
			this.margin = {
				left: arg.margin.left || 0,
				right: arg.margin.right || 0,
				top: arg.margin.top || 0,
				bottom: arg.margin.bottom || 0,
			}
		}

		if (arg.gameScreen) {
			this.gameScreen = {
				width: arg.gameScreen.width,
				height: arg.gameScreen.height,
				x: arg.gameScreen.x,
				y: arg.gameScreen.y,
			}
		}

		if (arg.player) {
			this.player = {
				texture: arg.player.texture,
				width: arg.player.width,
				height: arg.player.height,
				x: arg.player.x || 0,
				y: arg.player.y || 0,
				vx: arg.player.vx || 0,
				vy: arg.player.vy || 0,
			}
		}
		this.rotation = arg.rotation || 0;

		this.padding = arg.padding;

		this.speed = arg.speed;

		this.speedUp = 0;

		this.timeAppend = arg.timeAppend || 1;

		this.resolution = arg.resolution;

		this.game = arg.game;
		
		this.numberEntities = arg.numberEntities;

		this.score = 0;

		this.pause = false;

		this.init();
	}

	init = () => {
		this.entities = new PIXI.Container();

        for (let i = 0; i < this.numberEntities; i++) {
            this.entities.addChild(this.createEntities());
		}

		setInterval(() => {
			if (this.pause === false) {
				this.entities.addChild(this.createEntities());
			} 
		}, this.timeAppend * 3600);

		setInterval(() => {
			if (this.pause === false) {
				const lastEntities = this.entities.children.length - 1;
				if (lastEntities > 3) {
					this.entities.removeChildAt(lastEntities)
				}
			}
		}, this.timeAppend * 3600 * 2);
	}
	
    updateEntities = (bunny) => {
		if (this.pause === false) {
			//Move the blob
			bunny.x += bunny.vx + this.speedUp / 60.0;
			bunny.y += bunny.vy + this.speedUp / 60.0;

			//Check the blob's screen boundaries
			let blobHitsWall = this.contain(bunny, {
				x: this.gameScreen.x,
				y: this.gameScreen.y,
				width: this.gameScreen.width,
				height: this.gameScreen.height
			});
			//If the blob hits the top or bottom of the stage, reverse
			//its direction
			const positionX = this.gameScreen.width;
			const positionY = this.gameScreen.height;

			if (blobHitsWall === "right") {
				bunny.vx -= positionX + 2 * this.padding;
			}

			if (blobHitsWall === "left") {
				bunny.vx += positionX + 2 * this.padding;
			}

			if (blobHitsWall === "bottom") {
				bunny.vy -= positionY + 2 * this.padding;
			}

			if (blobHitsWall === "top") {
				bunny.vy += positionY + 2 * this.padding;
			}
			
			bunny.rotation += this.rotation;
		}
	}
	
	setPause = () => {
		this.pause = true;
	}

	createEntities = () => {
		const bunny = new PIXI.Sprite(this.player.texture);
		
        bunny.width = this.player.width;
        bunny.height = this.player.height;
        bunny.update = this.updateEntities;
    
        const angle = Math.random() * Math.PI * 2;

        bunny.vx = Math.cos(angle) * this.speed / 60.0;
        bunny.vy = Math.sin(angle) * this.speed / 60.0;

		const positionX = Math.random() * (this.gameScreen.x + this.gameScreen.width) +  this.gameScreen.x;
		const positionY = Math.random() * (this.gameScreen.y + this.gameScreen.height) +  this.gameScreen.y;

		bunny.position.set(positionX, positionY);
		
        bunny.anchor.set(0.5, 0.5);

		bunny.buttonMode = true;
        bunny.interactive = true;
        bunny.isClick = false;

        bunny
        .on('mousedown', (event) => this.handleClick(event, bunny))
		.on('tap', this.handleClick);
		
        return bunny;
    }

	handleClick = (event, bunny) => {
		this.score ++;
	}

	setSpeedUp = (value) => {
		this.speedUp += value;
	}

	getScore = () => {
		return this.score;
	}

	//The `hitTestRectangle` function
	hitTestRectangle = (r1, r2) => {
		//Define the variables we'll need to calculate
		let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
		//hit will determine whether there's a collision
		hit = false;
		//Find the center points of each sprite
		r1.centerX = r1.x + r1.width / 2;
		r1.centerY = r1.y + r1.height / 2;
		r2.centerX = r2.x + r2.width / 2;
		r2.centerY = r2.y + r2.height / 2;
		//Find the half-widths and half-heights of each sprite
		r1.halfWidth = r1.width / 2;
		r1.halfHeight = r1.height / 2;
		r2.halfWidth = r2.width / 2;
		r2.halfHeight = r2.height / 2;
		//Calculate the distance vector between the sprites
		vx = r1.centerX - r2.centerX;
		vy = r1.centerY - r2.centerY;
		//Figure out the combined half-widths and half-heights
		combinedHalfWidths = r1.halfWidth + r2.halfWidth;
		combinedHalfHeights = r1.halfHeight + r2.halfHeight;
		//Check for a collision on the x axis
		if (Math.abs(vx) < combinedHalfWidths) {
			//A collision might be occurring. Check for a collision on the y axis
			if (Math.abs(vy) < combinedHalfHeights) {
				//There's definitely a collision happening
				hit = true;
			} else {
				//There's no collision on the y axis
				hit = false;
			}
		} else {
			//There's no collision on the x axis
			hit = false;
		}
		//`hit` will be either `true` or `false`
		return hit;
	};

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

	killEntities = (bunny, explorer, scoreElement) => {
		const balls = explorer.balls;

		if (balls && balls.length > 0) {
			for(let index = balls.length - 1; index >= 0; index-- ){
				let isKill = this.hitTestRectangle(bunny, balls[index]);

				if (isKill === true) {
					this.score ++;
					this.entities.removeChild(bunny);
					explorer.destroyBall(balls[index], index)
		
					if (scoreElement) {
						scoreElement.score += 10;
						scoreElement.text = formatCurrency(scoreElement.score);
					}
				}
			  }
		}
	}
}

export default Entities;