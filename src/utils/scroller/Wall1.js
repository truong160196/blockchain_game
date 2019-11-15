import WallSpritesPool from './WallSpritesPool';
import * as PIXI from 'pixi.js';

const Types = {
	FRONT: 0,
	BACK: 1,
	STEP:2,
	DECORATION: 3,
	WINDOW: 4,
	GAP: 5
}


export default function Walls() {
	PIXI.Container.call(this);

	this.pool = new WallSpritesPool();
	this.createLookupTables();

	this.slices = [];

	this.viewportX = 0;
	this.viewportSliceX = 0;
}

function WallSlice(type, y) {
	this.type   = type;
	this.y      = y;
	this.sprite = null;
}

WallSlice.WIDTH = 64;

Walls.prototype = Object.create(PIXI.Container.prototype);

Walls.VIEWPORT_WIDTH = 512;
Walls.VIEWPORT_NUM_SLICES = Math.ceil(Walls.VIEWPORT_WIDTH/WallSlice.WIDTH) + 1;

Walls.prototype.setViewportX = function(viewportX) {
	this.viewportX = this.checkViewportXBounds(viewportX);

	var prevViewportSliceX = this.viewportSliceX;
	this.viewportSliceX = Math.floor(this.viewportX/WallSlice.WIDTH);

	this.removeOldSlices(prevViewportSliceX);
	this.addNewSlices();
};

Walls.prototype.removeOldSlices = function(prevViewportSliceX) {
	var numOldSlices = this.viewportSliceX - prevViewportSliceX;
	if (numOldSlices > Walls.VIEWPORT_NUM_SLICES)
	{
		numOldSlices = Walls.VIEWPORT_NUM_SLICES;
	}

	for (var i = prevViewportSliceX; i < prevViewportSliceX + numOldSlices; i++)
	{
		var slice = this.slices[i];
		if (slice.sprite != null)
		{
			this.returnWallSprite(slice.type, slice.sprite);
			this.removeChild(slice.sprite);
			slice.sprite = null;
		}
	}
};

Walls.prototype.addSlice = function(sliceType, y) {
	var slice = new WallSlice(sliceType, y);
	this.slices.push(slice);
};

Walls.prototype.checkViewportXBounds = function(viewportX) {
	var maxViewportX = (this.slices.length - Walls.VIEWPORT_NUM_SLICES) * 
						WallSlice.WIDTH;
	if (viewportX < 0)
	{
		viewportX = 0;
	}
	else if (viewportX > maxViewportX)
	{
		viewportX = maxViewportX;
	}

	return viewportX;
};

Walls.prototype.addNewSlices = function() {
	var firstX = -(this.viewportX % WallSlice.WIDTH);
	for (var i = this.viewportSliceX, sliceIndex = 0;
			 i < this.viewportSliceX + Walls.VIEWPORT_NUM_SLICES;
			 i++, sliceIndex++)
	{
		var slice = this.slices[i];
		if (slice.sprite == null && slice.type != Types.GAP)
		{
			slice.sprite = this.borrowWallSprite(slice.type);

			slice.sprite.position.x = firstX + (sliceIndex * WallSlice.WIDTH);
			slice.sprite.position.y = slice.y;

			this.addChild(slice.sprite);
		}
		else if (slice.sprite != null)
		{
			slice.sprite.position.x = firstX + (sliceIndex * WallSlice.WIDTH);
		}
	}
};

Walls.prototype.createLookupTables = function() {
	this.borrowWallSpriteLookup = [];
	this.borrowWallSpriteLookup[Types.FRONT] = this.pool.borrowFrontEdge;
	this.borrowWallSpriteLookup[Types.BACK] = this.pool.borrowBackEdge;
	this.borrowWallSpriteLookup[Types.STEP] = this.pool.borrowStep;
	this.borrowWallSpriteLookup[Types.DECORATION] = this.pool.borrowDecoration;
	this.borrowWallSpriteLookup[Types.WINDOW] = this.pool.borrowWindow;

	this.returnWallSpriteLookup = [];
	this.returnWallSpriteLookup[Types.FRONT] = this.pool.returnFrontEdge;
	this.returnWallSpriteLookup[Types.BACK] = this.pool.returnBackEdge;
	this.returnWallSpriteLookup[Types.STEP] = this.pool.returnStep;
	this.returnWallSpriteLookup[Types.DECORATION] = this.pool.returnDecoration;
	this.returnWallSpriteLookup[Types.WINDOW] = this.pool.returnWindow;
};

Walls.prototype.borrowWallSprite = function(sliceType) {
	return this.borrowWallSpriteLookup[sliceType].call(this.pool);
};

Walls.prototype.returnWallSprite = function(sliceType, sliceSprite) {
	return this.returnWallSpriteLookup[sliceType].call(this.pool, sliceSprite);
};
