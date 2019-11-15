import * as PIXI from 'pixi.js';

class WallSpritesPool{ 
	constructor () {
		this.windows = [];
		this.decorations = [];
		this.frontEdges = [];
		this.backEdges = [];
		this.steps = [];

		this.init();
	}

	init = () => {
		this.createWindows();
		this.createDecorations();
		this.createFrontEdges();
		this.createBackEdges();
		this.createSteps();
	}

	borrowWindow = () => {
		return this.windows.shift();
	};

	returnWindow = (sprite) => {
		this.windows.push(sprite);
	};
	
	borrowDecoration = () => {
		return this.decorations.shift();
	};

	returnDecoration = (sprite) => {
		this.decorations.push(sprite);
	};

	borrowFrontEdge = () => {
		return this.frontEdges.shift();
	};

	returnFrontEdge = (sprite) => {
		this.frontEdges.push(sprite);
	};
	
	borrowBackEdge = () => {
		return this.backEdges.shift();
	};

	returnBackEdge = (sprite) => {
		this.backEdges.push(sprite);
	};

	borrowStep = () => {
		return this.steps.shift();
	};

	returnStep = (sprite) => {
		this.steps.push(sprite);
	};

	createWindows = () => {
		this.addWindowSprites(6, "window_01");
		this.addWindowSprites(6, "window_02");
	
		this.shuffle(this.windows);
	};

	createDecorations = () => {
		this.addDecorationSprites(6, "decoration_01");
		this.addDecorationSprites(6, "decoration_02");
		this.addDecorationSprites(6, "decoration_03");
	
		this.shuffle(this.decorations);
	};
	
	createFrontEdges = function() {
		this.addFrontEdgeSprites(2, "edge_01");
		this.addFrontEdgeSprites(2, "edge_02");
	
		this.shuffle(this.frontEdges);
	};

	createBackEdges = function() {
		this.addBackEdgeSprites(2, "edge_01");
		this.addBackEdgeSprites(2, "edge_02");
	
		this.shuffle(this.backEdges);
	};

	createSteps = function() {
		this.addStepSprites(2, "step_01");
	};
	
	addWindowSprites = (amount, frameId) => {
		for (var i = 0; i < amount; i++)
		{
			var sprite = PIXI.Sprite.from(frameId);
			this.windows.push(sprite);
		}
	}

	addDecorationSprites = (amount, frameId) => {
		for (var i = 0; i < amount; i++)
		{
			var sprite = PIXI.Sprite.from(frameId);
			this.decorations.push(sprite);
		}
	};

	addFrontEdgeSprites = (amount, frameId) => {
		for (var i = 0; i < amount; i++)
		{
			var sprite = PIXI.Sprite.from(frameId);
			this.frontEdges.push(sprite);
		}
	};

	addBackEdgeSprites = (amount, frameId) => {
		for (var i = 0; i < amount; i++)
		{
			var sprite = PIXI.Sprite.from(frameId);
			sprite.anchor.x = 1;
			sprite.scale.x = -1;
			this.backEdges.push(sprite);
		}
	};

	addStepSprites = (amount, frameId) => {
		for (var i = 0; i < amount; i++)
		{
			var sprite = PIXI.Sprite.from(frameId);
			sprite.anchor.y = 0.25;
			this.steps.push(sprite);
		}
	};

	shuffle = (array) => {
		var len = array.length;
		var shuffles = len * 3;
		for (var i = 0; i < shuffles; i++)
		{
			var wallSlice = array.pop();
			var pos = Math.floor(Math.random() * (len-1));
			array.splice(pos, 0, wallSlice);
		}
	};
}

export default WallSpritesPool;