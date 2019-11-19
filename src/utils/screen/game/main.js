import * as PIXI from 'pixi.js';

class Main {
    constructor(arg) {
        this.config = arg.config;

        this.padding = {
            left: 15,
            top: 15,
            right: 15,
            bottom: 15
        }

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.style = new PIXI.TextStyle({
            fontFamily: "Futura",
            fontSize: 25,
            fill: "white"
        });

        
        this.W = 800;
        this.H = 600;
        this.PAD = 80;
        this.resolution = 1;
        this.WIDTH = this.W / this.resolution;
        this.HEIGHT = this.H / this.resolution;

    }

    init = () => {
        this.game = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            antialiasing: true,
            transparent: false,
            resolution: 1,
        });

        this.game.stage = new PIXI.display.Stage();
        
        this.game.autoResize = true;
		
		this.loader = new PIXI.Loader();

		this.resources = this.loader.resources;

        document.body.appendChild(this.game.view);

        this.loaderResource();

        window.onresize = (event) => {
            this.resize();
        };
    }
    
    resize = () => {
        
    }

    loaderResource = () => {
        this.loader.add(this.config.urlSource).load(this.setup)
    }

    setup = (resources) => {
        // this.gameScene = new PIXI.Container();
        // this.gameScene.interactive = true;
        // this.gameScene.cursor = "pointer";

        // this.game.stage.addChild(this.gameScene);

		this.id = this.resources[this.config.urlSource].textures;

        this.background = new PIXI.Sprite(this.id["background-game.jpg"]);
        this.background.width = this.width;
        this.background.height =  this.height;

        this.gameScene.addChild(this.background);

        // make container for bunnies
        this.bunnyWorld = new PIXI.Container();

        this.gameScene.addChild(this.bunnyWorld);

        this.lighting = new PIXI.DisplayObject();

        this.lighting.on('display', (element) => {
            element.blendMode = PIXI.BLEND_MODES.ADD;
        });

        this.lighting.useRenderTexture = true;
        this.lighting.clearColor = [0.5, 0.5, 0.5, 1]; // ambient gray

        this.gameScene.addChild(this.lighting);

        this.lightingSprite = new PIXI.Sprite(this.lighting.render());

        this.lightingSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;

        this.gameScene.addChild(this.lightingSprite);

        this.bunnyTexture = PIXI.Texture.from(this.id["blob.png"]);

        for (let i = 0; i < 40; i++) {
            this.bunnyWorld.addChild(this.createBunny());
        }
        
        this.game.ticker.add(() => {
            this.bunnyWorld.children.forEach(this.updateBunny);
        });

        this.customMouseIcon();
    }

    updateBunny = (bunny) => {
        bunny.x += bunny.vx;
        bunny.y += bunny.vy;
        if (bunny.x > this.WIDTH + this.PAD) {
            bunny.x -= this.WIDTH + 2 * this.PAD;
        }
        if (bunny.x < -this.PAD) {
            bunny.x += this.WIDTH + 2 * this.PAD;
        }
        if (bunny.y > this.HEIGHT + this.PAD) {
            bunny.y -= this.HEIGHT + 2 * this.PAD;
        }
        if (bunny.y < -this.PAD) {
            bunny.y += this.HEIGHT + 2 * this.PAD;
        }
    }

    createBunny = () => {
        const bunny = new PIXI.Sprite(this.bunnyTexture);
        bunny.update = this.updateBunny;
    
        const angle = Math.random() * Math.PI * 2;
        const speed = 200.0; // px per second

        bunny.vx = Math.cos(angle) * speed / 60.0;
        bunny.vy = Math.sin(angle) * speed / 60.0;

        bunny.position.set(Math.random() * this.WIDTH, Math.random() * this.HEIGHT);

        bunny.anchor.set(0.5, 0.5);
    
        const lightbulb = new PIXI.Graphics();

        const rr = Math.random() * 0x80 | 0;
        const rg = Math.random() * 0x80 | 0;
        const rb = Math.random() * 0x80 | 0;
        const rad = 50 + Math.random() * 20;

        lightbulb.beginFill((rr << 16) + (rg << 8) + rb, 1.0);

        lightbulb.drawCircle(0, 0, rad);

        lightbulb.endFill();

        lightbulb.parentLayer = this.lighting;// <-- try comment it
    
        bunny.addChild(lightbulb);
    
        return bunny;
    }
    

    customMouseIcon = () => {
        const defaultIcon = "url('assets/cursor/blob.png'),auto";

        this.game.renderer.plugins.interaction.cursorStyles.pointer = defaultIcon;
    }
}

export default Main;