
import * as PIXI from "pixi.js"

import { formatCurrency } from '../../../utils/formatNumber';

import Entities from '../../source/Entities';
import Explorer from '../../source/Explorer';

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
        this.scoreNumber = 0;
    }

    init = () => {
        this.game = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            antialiasing: true,
            transparent: false,
            resolution: 1,
        });

        this.game.autoResize = true;
		
		this.loader = new PIXI.Loader();

		this.resources = this.loader.resources;

        document.body.appendChild(this.game.view);

        this.loaderResource();

        this.customMouseIcon();

        // window.onresize = (event) => {
        //     this.resize();
        // };
    }
    
    resize = () => {
        
    }

    loaderResource = () => {
        this.loader.add(this.config.urlSource).load(this.setup)
    }

    setup = (resources) => {
        this.gameScene = new PIXI.Container();
        this.gameScene.interactive = true;
        this.gameScene.cursor = "pointer";

        this.gameScene.on("mouseup", () => {
            //mouse is now on stage
            this.gameScene.cursor = "pointer";
        });

        this.gameScene.on("mousedown", () => {
            //mouse left cursor
            this.gameScene.cursor = "attack";
        });

        this.gameScene.on("clock", () => {
            //mouse left cursor
            this.gameScene.cursor = "attack";

            setTimeout(() => {
                this.gameScene.cursor = "pointer";
            }, 360);
        });

        this.game.stage.addChild(this.gameScene);

		this.id = this.resources[this.config.urlSource].textures;

        this.background = new PIXI.Sprite(this.id["background.png"]);
        this.background.x = 0;
        this.background.y = 0;
        this.background.width = this.width;
        this.background.height =  this.height;

        this.gameScene.addChild(this.background);
      
        const optionsPlayer1 = {
            gameScreen: {
                width: this.background.width,
                height: this.background.height,
                x: this.background.x,
                y: this.background.y,
            },
            player: {
                texture: this.id["entities_01.png"],
                width: 235 / 3,
                height: 164 / 3,
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
            },
            rotation: 0.001,
		    padding: 1,
            speed: 120.0,
            resolution: 1,
            timeAppend: 2,
            numberEntities: 1,
            game: this.gameScene,
        }

        this.player1 = new Entities(optionsPlayer1);

        this.gameScene.addChild(this.player1.entities);

        const optionsPlayer2 = {
            gameScreen: {
                width: this.background.width,
                height: this.background.height,
                x: this.background.x,
                y: this.background.y,
            },
            player: {
                texture: this.id["entities_02.png"],
                width: 262/3,
                height: 171/3,
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
            },
            rotation: 0.0064,
		    padding: 1,
            speed: 150.0,
            resolution: 1,
            timeAppend: 2,
            numberEntities: 3,
            game: this.gameScene,
        }

        this.player2 = new Entities(optionsPlayer2);

        this.gameScene.addChild(this.player2.entities);

        const optionBomb = {
            gameScreen: {
                width: this.background.width,
                height: this.background.height,
                x: this.background.x,
                y: this.background.y,
            },
            player: {
                texture: this.id["entities_06.png"],
                width: 308 / 2,
                height: 164 / 2,
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
            },
            rotation: 0.012,
		    padding: 1,
            speed: 130.0,
            resolution: 1,
            timeAppend: 3,
            numberEntities: 2,
            game: this.gameScene,
        }

        this.bomb = new Entities(optionBomb);

        this.gameScene.addChild(this.bomb.entities);

        const optionSnow = {
            gameScreen: {
                width: this.background.width,
                height: this.background.height,
                x: this.background.x,
                y: this.background.y,
            },
            player: {
                texture: this.id["entities_07.png"],
                width: 301 / 3,
                height: 406 / 3,
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
            },
            rotation: 0,
            timeAppend: 6,
		    padding: 1,
            speed: 160.0,
            resolution: 1,
            numberEntities: 0,
            game: this.gameScene,
        }

        this.snow = new Entities(optionSnow);

        this.gameScene.addChild(this.snow.entities);

        const optionsExplorer = {
            gameScreen: {
                width: this.background.width,
                height: this.background.height,
                x: this.background.x,
                y: this.background.y,
            },
            player: {
                texture: this.id["gun_01.png"],
                textureCircle: this.id["treasury.png"],
                textureBall: this.id["ball.png"],
                width: 74 / 2,
                height: 245 / 2,
                x: this.width / 2 - 39,
                y: this.height - 90,
                vx: 0,
                vy: 0,
            },
            rotation: 1,
            speed: 300.0,
            limitBall: 50,
            numberEntities: 1,
            game: this.gameScene,
            stage: this.game,
        }

        this.explorer = new Explorer(optionsExplorer);

        this.gameScene.on("mousedown", (event) => {
            if (this.explorer.isActive === false) {
                this.explorer.setRotation(event.data.global);
                this.updatePosition();
            }
        });

        // add score
        this.score = new PIXI.Sprite(this.id["score.png"]);
        this.score.width = this.score.width / 2;
        this.score.height = this.score.height / 2;
        this.score.x = this.background.width / 2 - this.score.width / 2;
        this.score.y = 5;
        this.gameScene.addChild(this.score);

        const styleScore = new PIXI.TextStyle({
            fontSize: 30,
            lineHeight: 2,
            fontWeight: 600,
            fill: "yellow"
        });

        this.scorePlay1 = new PIXI.Text(this.scoreNumber, styleScore);
        this.scorePlay1.x = this.score.width - this.scorePlay1.width / 2;
        this.scorePlay1.y=  this.score.height + 10;
        this.scorePlay1.score = this.scoreNumber;

        this.score.addChild(this.scorePlay1)

        const listItem = [
            {id: 1},
            {id: 2},
            {id: 3},
        ];

        this.buttonGroup = new PIXI.Container();
        this.buttonGroup.x = this.explorer.entities.x + this.explorer.entities.width + 30
        this.buttonGroup.y = this.background.height - 100;

        listItem.map((item, index) => {
            let button = new PIXI.Sprite(this.id["button-water.png"]);
            button.width = button.width / 2;
            button.height = button.height / 2;
            button.x = (button.width + 10 ) * index;
            button.y = 0;

            this.buttonGroup.addChild(button)
        });

        this.gameScene.addChild(this.buttonGroup);


        this.game.ticker.add(() => {
            this.player1.entities.children.forEach(this.player1.updateEntities);
            this.player2.entities.children.forEach(this.player2.updateEntities);
            this.bomb.entities.children.forEach(this.bomb.updateEntities);
            this.snow.entities.children.forEach(this.snow.updateEntities);
        });

        this.updatePosition();
    }

    updatePosition = () => {
        requestAnimationFrame(this.updatePosition)
        this.bomb.entities.children.forEach((detail) => this.bomb.killEntities(detail, this.explorer, this.scorePlay1));
        this.player1.entities.children.forEach((detail) => this.player1.killEntities(detail, this.explorer, this.scorePlay1));
        this.player2.entities.children.forEach((detail) => this.player2.killEntities(detail, this.explorer, this.scorePlay1));
        this.snow.entities.children.forEach((detail) => this.snow.killEntities(detail, this.explorer, this.scorePlay1));
    }


    customMouseIcon = () => {
        const defaultIcon = "url('assets/template/mouse.png'),auto";
        const defaultIcon2 = "url('assets/template/mouse2.png'),auto";

        this.game.renderer.plugins.interaction.cursorStyles.pointer = defaultIcon;
        this.game.renderer.plugins.interaction.cursorStyles.attack = defaultIcon2;
    }
}

export default Main;