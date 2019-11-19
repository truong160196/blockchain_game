import * as PIXI from 'pixi.js';

class Entities {
	constructor(arg) {
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

		this.speed = arg.speed;

		this.game = arg.game;
		
		this.score = 0;

		this.angle = Math.PI * 2;

		this.numberEntities = arg.numberEntities;

		this.isActive = false;

		this.init();
	}

	init = () => {
		this.entities = new PIXI.Container();

		let padding = this.player.x + this.player.width + 20;

		for (let i = 1; i <= this.numberEntities; i++) {
			padding = this.player.x + this.player.width * i + 20;

			this.entities.addChild(this.createExplorer(padding))
		}

		this.game.addChild(this.entities);
	}

	reset = () => {
		let padding = this.player.x + this.player.width + 20;

		for (let i = 1; i <= this.numberEntities; i++) {
			padding = this.player.x + this.player.width * i + 20;

			this.entities.addChild(this.createExplorer(padding))
		}
		
		this.game.addChild(this.entities);	
	}

	createExplorer = (add) => {
		const item = new PIXI.Sprite(this.player.texture);

		item.width = this.player.width;
		item.height = this.player.height;
		item.x = add;
		item.y = this.player.y;
		item.vx = this.player.vx;
		item.vy = this.player.vy;

		item.speed = this.speed;

		item.anchor.set(0.5);

		item.update = this.play;

		return item;
	}
	
	play = () => {
		if (this.entities.children.length > 0) {
			const currentPlayer = this.entities.children[0];

			currentPlayer.x += 2 * Math.cos(this.rotation) * currentPlayer.speed / 60.0;
			currentPlayer.y +=  2 * Math.sin(this.rotation) * currentPlayer.speed / 60.0;

			currentPlayer.speed += 150 / 60.0;

			const limitRight = this.gameScreen.x + this.gameScreen.width;
			const limitLeft = this.gameScreen.x;
			const limitTop = this.gameScreen.y + 10;
			const limitBottom = this.gameScreen.y + this.gameScreen.height;
	
			if (currentPlayer.y < limitTop || currentPlayer.y > limitBottom) {
				this.isActive = false;
				this.entities.removeChild(currentPlayer);
			}
	
			if (currentPlayer.x > limitRight || currentPlayer.x < limitLeft) {
				this.isActive = false;
				this.entities.removeChild(currentPlayer);
			}
		}
	}


	setRotation = (pointer) => {
		if ( this.entities.children.length > 0) {
			const element = this.entities.children[0];

			this.pointerX = pointer.x;
			this.pointerY = pointer.y;
			this.rotation = Math.atan2(this.pointerY - element.y, this.pointerX - element.x);
			this.isActive = true;
		}
	}
}

export default Entities;