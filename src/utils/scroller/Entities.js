import * as PIXI from 'pixi.js';

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

		this.init();
	}

	init = () => {
		this.texture = PIXI.Texture.from(this.image.src);
		
		this.entities = new PIXI.TilingSprite(this.texture, this.image.width, this.image.height);

		this.entities.x = this.position.x;
		this.entities.y = this.position.y;
		this.entities.tilePosition.x = this.tilePosition.x;
		this.entities.tilePosition.y = this.tilePosition.x;
	}

	setResourceImage = (src, width, height) => {
		this.image.src = src;
		this.image.width = width;
		this.image.height = height;
	}

	getResourceImage = () => {
		return this.image;
	}

	setViewportX = (newViewportX) => {
		var distanceTravelled = newViewportX - this.viewportX;
		this.viewportX = newViewportX;
		this.entities.tilePosition.x -= (distanceTravelled * this.deltaX);
	};
}

export default Entities;