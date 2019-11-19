import * as PIXI from 'pixi.js';

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

		this.resolution = arg.resolution;

		this.game = arg.game;
		
		this.numberEntities = arg.numberEntities;

		this.score = 0;
		this.init();
	}

	init = () => {
		this.entities = new PIXI.Container();

        for (let i = 0; i < this.numberEntities; i++) {
            this.entities.addChild(this.createEntities());
		}
	}
	
    updateEntities = (bunny) => {
        bunny.x += bunny.vx + this.speedUp / 60.0;
		bunny.y += bunny.vy + this.speedUp / 60.0;

		const limitRight = this.gameScreen.x + this.gameScreen.width;
		const limitLeft = this.gameScreen.x;
		const limitTop = this.gameScreen.y
		const limitBottom = this.gameScreen.y + this.gameScreen.height;
		
        if (bunny.x > (limitRight + this.padding)) {
            bunny.x -= this.gameScreen.width + 2 * this.padding;
        }
        if (bunny.x < - (limitLeft + this.padding)) {
            bunny.x += this.gameScreen.width + 2 * this.padding;
        }
        if (bunny.y > (limitBottom + this.padding)) {
            bunny.y -= this.gameScreen.height + 2 * this.padding;
        }
        if (bunny.y < -(limitTop + this.padding)) {
            bunny.y += this.gameScreen.height + 2 * this.padding;
		}
		
		bunny.rotation += this.rotation;
	}
	
	createEntities = () => {
		const bunny = new PIXI.Sprite(this.player.texture);
		
        bunny.width = this.player.width;
        bunny.height = this.player.height;
        bunny.update = this.updateEntities;
    
        const angle = Math.random() * Math.PI * 2;

        bunny.vx = Math.cos(angle) * this.speed / 60.0;
        bunny.vy = Math.sin(angle) * this.speed / 60.0;

		const positionX = Math.floor((Math.random() * (this.gameScreen.x + this.gameScreen.width)) + Math.random() * this.gameScreen.x);
		const positionY = Math.floor((Math.random() * (this.gameScreen.y + this.gameScreen.height)) + Math.random() * this.gameScreen.y);
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
		
		this.entities.removeChild(bunny)
	}

	setSpeedUp = (value) => {
		this.speedUp += value;
	}

	getScore = () => {
		return this.score;
	}
}

export default Entities;