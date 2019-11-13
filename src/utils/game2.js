import PIXI from './pixi';

import Entities from './scroller/Entities';

import Scroller from './scroller/Scroller';


class Game2 {
    constructor(arg) {
		this.config = arg.config;
		this.viewportX = 0;
		this.canvasId = arg.config.canvasId;
		this.ad = 1;
		this.minScrollSpeed = 5;
		this.maxScrollSpeed = 15;
		this.scrollAcceleration = 0.005;
		this.scrollSpeed = this.minScrollSpeed;

		this.init();
		this.loadSpriteSheet();
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
	}
	
	update = () => {
		this.scroller.moveViewportXBy(this.scrollSpeed);

		this.scrollSpeed += this.scrollAcceleration;

		if (this.scrollSpeed > this.maxScrollSpeed)
		{
			this.scrollSpeed = this.maxScrollSpeed;
		}

		this.game.renderer.render(this.game.stage);

		requestAnimationFrame(this.update.bind(this));
	}

	loadSpriteSheet = () => {
		this.loader = new PIXI.Loader();
		this.loader.add("wall", "./assets/resources_02//wall.json");
		this.loader.add("bg-mid", "./assets/resources_02/bg-mid.png");
		this.loader.add("bg-far", "./assets/resources_02/bg-far.png");
		this.loader.once("complete", this.spriteSheetLoaded.bind(this));
		this.loader.load();
	};

	spriteSheetLoaded = () => {
		const options = {
			stage: this.stage,
			game: this.game,
		}
		this.scroller = new Scroller(options);

		requestAnimationFrame(this.update.bind(this));
	};

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