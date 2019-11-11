import PIXI from './pixi';

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
	}

	init = () => {
		this.texture = PIXI.Texture.from(this.image.src);
		
		const result = new PIXI.TilingSprite(this.texture, this.image.width, this.image.height);

		result.x = this.position.x;
		result.y = this.position.y;
		result.tilePosition.x = this.tilePosition.x;
		result.tilePosition.y = this.tilePosition.x;

		return result;
	}

	setResourceImage = (src, width, height) => {
		this.image.src = src;
		this.image.width = width;
		this.image.height = height;
	}

	getResourceImage = () => {
		return this.image;
	}
}


class Game2 {
    constructor(arg) {
		this.config = arg.config;
		this.scrollSpeed = 5;
		this.viewportX = 0;
		this.canvasId = arg.config.canvasId;
		this.ad = 1;
	}

	init = () => {
		this.stage = new PIXI.Container();

        this.game = new PIXI.Application({
            width: this.config.width,
            height: this.config.height,
            antialiasing: true,
            transparent: false,
            resolution: 1
		});

		this.game.stage.addChild(this.stage);

        document.body.appendChild(this.game.view);

		this.scroller = this.initScroller();
		
		requestAnimationFrame(this.update.bind(this))
	}
	
	update = () => {
		this.moveViewportXBy(this.scrollSpeed);

		this.game.renderer.render(this.game.stage);

		requestAnimationFrame(this.update.bind(this));	
	}

	initScroller() {
		const optionsFar = {
			position: {
				x: 0,
				y: 0,
			},
			tilePosition: {
				x: 0,
				y: 0,
			},
			viewportX: 0,
			deltaX: 0.128,
			image: {
				src: './assets/resources_02/bg-far.png',
				width: 512,
				height: 256
			}
		};
		
		this.farEntities = new Entities(optionsFar);

		this.far = this.farEntities.init()

		this.stage.addChild(this.far);
	
		const optionsMix = {
			position: {
				x: 0,
				y: 128,
			},
			tilePosition: {
				x: 0,
				y: 0,
			},
			viewportX: 0,
			deltaX: 0.24,
			image: {
				src: './assets/resources_02/bg-mid.png',
				width: 512,
				height: 256
			}
		};

		this.midEntities = new Entities(optionsMix);

		this.mid = this.midEntities.init();

		this.stage.addChild(this.mid);
	
		this.viewportX = 0;
	}

	
	moveViewportXBy = (units) => {
		const newViewportX = this.viewportX + units;

		const distanceTravelled = newViewportX - this.viewportX;

		this.viewportX = newViewportX;

		const nextPositionFar = (distanceTravelled * this.farEntities.deltaX);
		const nextPositionMid = (distanceTravelled * this.midEntities.deltaX);

		this.far.tilePosition.x -= nextPositionFar;
		this.mid.tilePosition.x -= nextPositionMid;
	};
}

export default Game2;