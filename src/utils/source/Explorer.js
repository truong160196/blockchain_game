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
				textureCircle: arg.player.textureCircle,
				textureBall: arg.player.textureBall,
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
		this.stage = arg.stage;
		
		this.score = 0;

		this.angle = Math.PI * 2;

		this.limitBall = arg.limitBall || 0;

		this.numberEntities = arg.numberEntities;

		this.isActive = false;

		this.balls = [];

		this.init();
	}

	init = () => {
		this.gunGroup = new PIXI.Container();

		this.circleGun = new PIXI.Sprite(this.player.textureCircle);
		this.circleGun.width = this.circleGun.width / 2;
		this.circleGun.height = this.circleGun.height / 2;
		this.circleGun.x = this.gameScreen.width / 2 - this.circleGun.width / 2;
		this.circleGun.y = this.gameScreen.height - this.circleGun.height;

		this.gunGroup.addChild(this.circleGun);

		this.entities = new PIXI.Sprite(this.player.texture);
		this.entities.width = this.entities.width / 1.5;
		this.entities.height = this.entities.height / 1.5;
		this.entities.position.x = this.circleGun.x + this.circleGun.width / 2;
		this.entities.position.y = this.circleGun.y + this.circleGun.height / 2;

		this.entities.anchor.x = 0.5;  
		this.entities.anchor.y = 1;


		this.entities.buttonMode = true;
		this.entities.interactive = true;
		
        this.game
		.on('pointerdown', this.handleEventMouseMove)
		.on('pointermove', this.handleRotation)
		.on('tap', this.handleEventMouseMove);

		this.game.addChild(this.entities);
		
		const styleScore = new PIXI.TextStyle({
            fontSize: 60,
            lineHeight: 2,
            fontWeight: 600,
            fill: "white"
        });

        this.countBall = new PIXI.Text(this.limitBall, styleScore);
        this.countBall.x = this.circleGun.width - this.countBall.width / 2;
        this.countBall.y=  this.circleGun.height - this.countBall.height / 2;

        this.circleGun.addChild(this.countBall);

		this.game.addChild(this.gunGroup);
		this.animate();
	}

	rotateToPoint = (mx, my, px, py) => {  
		let dist_Y = my - py;
		let dist_X = mx - px;
		let angle = Math.atan2(dist_Y, dist_X);
		return angle;
	  }

	  handleRotation = (event) => {
		const dist_Y =  event.data.global.y - this.entities.position.y;
		const dist_X = event.data.global.x - this.entities.position.x;
		this.rotation = Math.atan2(dist_Y, dist_X);
		this.entities.rotation = Math.atan2(dist_Y, dist_X);
	  }

	  animate = () => {  
		requestAnimationFrame(this.animate);
		for(let b = this.balls.length - 1; b >= 0; b-- ){
		  this.moveShootBall(this.balls[b], b)
		}

		// render the container
		this.stage.renderer.render(this.game);
	  }

	  moveShootBall = (ball, index) => {
		ball.position.x += 2 * Math.cos(ball.rotation) * 5;
		ball.position.y += 2 * Math.sin(ball.rotation) * 5;

		const limitRight = this.gameScreen.x + this.gameScreen.width;
		const limitLeft = this.gameScreen.x;
		const limitTop = this.gameScreen.y + 10;
		const limitBottom = this.gameScreen.y + this.gameScreen.height;

		if (ball.position.y < limitTop || ball.position.y > limitBottom) {
			this.destroyBall()
		}

		if (ball.position.x > limitRight || ball.position.x < limitLeft) {
			this.destroyBall()
		}
	  }

	  destroyBall = (ball, index) => {
		this.game.removeChild(ball);
		this.balls.splice(index, 1)
	  }

	 shoot(rotation, startPosition){
		 if (this.limitBall > 0) {
			var ball = new PIXI.Sprite(this.player.textureBall);

			ball.width = ball.width / 3.5
			ball.height = ball.height / 3.5;
			ball.position.x = startPosition.x;
			ball.position.y = startPosition.y;
	
			ball.rotation = rotation;
	
			this.game.addChild(ball);
			this.balls.push(ball);
	
			this.limitBall -= 1;
			this.countBall.text = this.limitBall;
			this.countBall.x = this.circleGun.width - this.countBall.width / 2;
			this.countBall.y=  this.circleGun.height - this.countBall.height / 2;
		 }
	  }

	handleEventMouseMove = (event) => {
		// const x = event.data.global.x;
		// const y = event.data.global.y;
		this.shoot(this.rotation, {
			x: this.circleGun.position.x + Math.cos(this.entities.rotation) * 20,
			y: this.circleGun.position.y + Math.sin(this.entities.rotation) * 20
		  });
		// this.entities.rotation.x = this.entities.x + Math.cos(this.entities.rotation) * 20
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
		const item = new PIXI.Sprite(this.player.textureBall);

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