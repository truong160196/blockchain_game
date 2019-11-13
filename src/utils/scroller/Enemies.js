import PIXI from '../pixi';

class Enemies {
	constructor(arg) {
		this.numberOfEnemies = arg.numberOfEnemies;
		this.spacing = arg.spacing;
		this.xOffset = arg.xOffset;
		this.speed = arg.speed;
		this.direction = arg.direction;

        this.enemies = [];

		this.image = {
			src: arg.image.src,
			width: arg.image.width,
			height: arg.image.height
		}

		this.game = arg.game;
		this.stage = arg.stage;

		this.init();
	}

	init = () => {

		for (let i = 0; i < this.numberOfEnemies; i++) {
			this.texture = PIXI.Texture.from(this.image.src);

			let enemy = new PIXI.Sprite(this.texture, this.image.width, this.image.height);

			let x = this.spacing * i + this.xOffset;

			let y = this.randomInt(0, this.game.stage.height - enemy.height);

			enemy.x = x;
			enemy.y = y;

			enemy.vy = this.speed * this.direction;

			this.direction *= -1;

			this.enemies.push(enemy);

			this.stage.addChild(enemy);
		}
	}
}

export default Enemies;