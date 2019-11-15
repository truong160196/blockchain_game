import * as PIXI from 'pixi.js';

class Mouse {
	constructor(arg) {
        this.buttons = [];

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
		this.textureButton = PIXI.Texture.from('examples/assets/button.png');
		this.textureButtonDown = PIXI.Texture.from('examples/assets/button_down.png');
		this.textureButtonOver = PIXI.Texture.from('examples/assets/button_over.png');

		const buttonPositions = [
			175, 75,
			655, 75,
			410, 325,
			150, 465,
			685, 445,
		];

		for (let i = 0; i < 5; i++) {
			const button = new PIXI.Sprite(this.textureButton);
			button.cursor = 'hover';

			button.anchor.set(0.5);
			button.x = buttonPositions[i * 2];
			button.y = buttonPositions[i * 2 + 1];

			// make the button interactive...
			button.interactive = true;

			button
				.on('pointerdown', this.onButtonDown)
				.on('pointerup', this.onButtonUp)
				.on('pointerupoutside', this.onButtonUp)
				.on('pointerover', this.onButtonOver)
				.on('pointerout', this.onButtonOut);

			// Use mouse-only events
			// .on('mousedown', onButtonDown)
			// .on('mouseup', onButtonUp)
			// .on('mouseupoutside', onButtonUp)
			// .on('mouseover', onButtonOver)
			// .on('mouseout', onButtonOut)

			// Use touch-only events
			// .on('touchstart', onButtonDown)
			// .on('touchend', onButtonUp)
			// .on('touchendoutside', onButtonUp)

			// add it to the stage
			this.stage.addChild(button);

			// add button to array
			this.buttons.push(button);
		}

		// set some silly values...
		this.buttons[0].scale.set(1.2);
		this.buttons[2].rotation = Math.PI / 10;
		this.buttons[3].scale.set(0.8);
		this.buttons[4].scale.set(0.8, 1.2);
		this.buttons[4].rotation = Math.PI;
	}

	onButtonDown = () => {
		this.isdown = true;
		this.texture = this.textureButtonDown;
		this.alpha = 1;
	}

	onButtonUp = () => {
		this.isdown = false;
		if (this.isOver) {
			this.texture = this.textureButtonOver;
		} else {
			this.texture = this.textureButton;
		}
	}

	onButtonOver = () => {
		this.isOver = true;
		if (this.isdown) {
			return;
		}
		this.texture = this.textureButtonOver;
	}

	onButtonOut = () => {
		this.isOver = false;
		if (this.isdown) {
			return;
		}
		this.texture = this.textureButton;
	}
}

export default Mouse;