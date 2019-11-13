import Explorer from './Explorer';
import Entities from './Entities';
import Walls from './Walls';
import MapBuilder from './MapBuilder';
import Enemies from './Enemies';


class Scroller {
	constructor(arg) {
		this.stage = arg.stage;
		this.game = arg.game;
		this.viewportX = arg.viewportX || 0;

		this.init();
	}

	init = () => {
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
		
		// this.far = new Entities(optionsFar);

		// this.stage.addChild(this.far.entities);

		// create entities 2

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

		// this.mid = new Entities(optionsMix);

		// this.stage.addChild(this.mid.entities);
	
		const optionsWall = {
			viewportX: 0,
			viewportSliceX: 0,
			viewportWidth: 512,
		};

		// this.front = new Walls(optionsWall);

		// this.stage.addChild(this.front);
	
		// this.mapBuilder = new MapBuilder(this.front);

		const optionsExplorer = {
			position: {
				x: 0,
				y: 150,
			},
			tilePosition: {
				x: 0,
				y: 0,
			},
			step: 2,
			viewportX: 0,
			deltaX: 0.0,
			image: {
				src: './assets/resources_02/explorer.png',
				width: 21,
				height: 32
			},
			game: this.game,
		};

		// this.explorer = new Explorer(optionsExplorer);

		// this.stage.addChild(this.explorer.entities);

		const optionsEnemies = {
			numberOfEnemies: 6,
			spacing: 48,
			xOffset: 150,
			speed: 2,
			direction:1 ,
			game: this.game,
			stage: this.stage,
			image: {
				src: './assets/resources_02/blob.png',
				width: 32,
				height: 24
			},
		};

		this.Enemies = new Enemies(optionsEnemies);

		// this.explorer.update();
	}

	setViewportX = (viewportX) => {
		// this.viewportX = viewportX;
		// this.far.setViewportX(viewportX);
		// this.mid.setViewportX(viewportX);
		// this.front.setViewportX(viewportX);
	};

	getViewportX = () => {
		return this.viewportX;
	};

	moveViewportXBy = (units) => {
		var newViewportX = this.viewportX + units;
		this.setViewportX(newViewportX);
	};
}


export default Scroller;