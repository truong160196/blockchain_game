import WallSpritesPool from './WallSpritesPool';
import PIXI from '../pixi';

const Types = {
	FRONT: 0,
	BACK: 1,
	STEP:2,
	DECORATION: 3,
	WINDOW: 4,
	GAP: 5,
	WIDTH: 64,
}

class WallSlice{
	constructor(type, y) {
		this.type   = type;
		this.y      = y;
		this.sprite = null;
	}
}
class Walls extends PIXI.Container {
	constructor(arg) {
		super();
		PIXI.Container.call(this)

		this.slices = [];
		this.viewportWidth = arg.viewportWidth || 512;
		this.viewportNumSlices = Math.ceil(arg.viewportWidth/Types.WIDTH) + 1;
		this.viewportX = arg.viewportX || 0;
		this.viewportSliceX = arg.viewportSliceX || 0;
		this.init();

	}

	init = () => {
		this.pool = new WallSpritesPool();

		this.createLookupTables();
	}


	setViewportX = (viewportX) => {
		this.viewportX = this.checkViewportXBounds(viewportX);
	
		let prevViewportSliceX = this.viewportSliceX;
		this.viewportSliceX = Math.floor(this.viewportX/Types.WIDTH);

		this.removeOldSlices(prevViewportSliceX);
		this.addNewSlices();
	};

	removeOldSlices = (prevViewportSliceX) => {

		let numOldSlices = this.viewportSliceX - prevViewportSliceX;

		if (numOldSlices > this.viewportSliceX)
		{
			numOldSlices = this.viewportSliceX;
		}
	
		for (let i = prevViewportSliceX; i < prevViewportSliceX + numOldSlices; i++)
		{
			let slice = this.slices[i];

			if (slice && slice.sprite != null)
			{
				this.returnWallSprite(slice.type, slice.sprite);
				this.removeChild(slice.sprite);
				slice.sprite = null;
			}
		}
	};

	addSlice = (sliceType, y) => {
		const slice = new WallSlice(sliceType, y);
		this.slices.push(slice);
	};

	checkViewportXBounds = (viewportX) => {
		const maxViewportX = (this.slices.length - this.viewportNumSlices) * 
							Types.WIDTH;
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

	addNewSlices = () =>{
		const firstX = -(this.viewportX % Types.WIDTH);
		for (let i = this.viewportSliceX, sliceIndex = 0;
				 i < this.viewportSliceX + this.viewportNumSlices;
				 i++, sliceIndex++)
		{
			let slice = this.slices[i];

			if (slice.sprite == null && slice.type !== Types.GAP)
			{
				slice.sprite = this.borrowWallSprite(slice.type);
	
				slice.sprite.position.x = firstX + (sliceIndex * Types.WIDTH);
				slice.sprite.position.y = slice.y;
	
				this.addChild(slice.sprite);
			}
			else if (slice.sprite != null)
			{
				slice.sprite.position.x = firstX + (sliceIndex * Types.WIDTH);
			}
		}
	};

	createLookupTables = () => {
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

	borrowWallSprite = (sliceType) => {
		return this.borrowWallSpriteLookup[sliceType].call(this.pool);
	};

	returnWallSprite = (sliceType, sliceSprite) => {
		return this.returnWallSpriteLookup[sliceType].call(this.pool, sliceSprite);
	};
}

export default Walls;