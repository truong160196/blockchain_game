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
		if (this.entities.children.length === 0) {
			let padding = this.player.x + this.player.width + 20;

			for (let i = 1; i <= this.numberEntities; i++) {
				padding = this.player.x + this.player.width * i + 20;
	
				this.entities.addChild(this.createExplorer(padding))
			}
			
			this.game.addChild(this.entities);	
		}
	}

	removeAllChild = () => {
		for (let i = this.entities.children.length - 1; i >= 0; i--) {
			this.entities.removeChild(this.entities.children[i]);
		};
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
			this.currentPlayer.x += 2 * Math.cos(this.rotation) * this.currentPlayer.speed / 60.0;
			this.currentPlayer.y +=  2 * Math.sin(this.rotation) * this.currentPlayer.speed / 60.0;

			this.currentPlayer.speed += 150 / 60.0;

			const limitRight = this.gameScreen.x + this.gameScreen.width;
			const limitLeft = this.gameScreen.x;
			const limitTop = this.gameScreen.y + 10;
			const limitBottom = this.gameScreen.y + this.gameScreen.height;
	
			if (this.currentPlayer.y < limitTop || this.currentPlayer.y > limitBottom) {
				this.killExplorer()
			}
	
			if (this.currentPlayer.x > limitRight || this.currentPlayer.x < limitLeft) {
				this.killExplorer()
			}
		}
	}

	setRotation = (pointer) => {
		if ( this.entities.children.length > 0) {
			this.currentPlayer = this.entities.children[0];

			this.pointerX = pointer.x;
			this.pointerY = pointer.y;
			this.rotation = Math.atan2(this.pointerY - this.currentPlayer.y, this.pointerX - this.currentPlayer.x);
			this.isActive = true;
		}
	}

	killExplorer = () => {
		this.isActive = false;
		this.entities.children.forEach((item, index) => {
			this.entities.children[index].x = this.player.x + this.player.width * index;
		})
		this.entities.removeChild(this.currentPlayer);
	}
}

export default Entities;