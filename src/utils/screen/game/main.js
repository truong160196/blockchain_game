
import * as PIXI from "pixi.js"

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

        this.background = new PIXI.Sprite(this.id["background-game.jpg"]);
        this.background.x = 0;
        this.background.y = 0;
        this.background.width = this.width;
        this.background.height =  this.height;

        this.gameScene.addChild(this.background);
      
        const optionsPlayer1 = {
            gameScreen: {
                width: this.background.width,
                height: this.background.height - 150,
                x: this.background.x,
                y: this.background.y,
            },
            player: {
                texture: this.id["player1.png"],
                width: 78,
                height: 78,
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
            },
            rotation: 0.001,
		    padding: 1,
            speed: 200.0,
            resolution: 1,
            numberEntities: 5,
            game: this.gameScene,
        }

        this.player1 = new Entities(optionsPlayer1);

        this.gameScene.addChild(this.player1.entities);

        const optionsPlayer2 = {
            gameScreen: {
                width: this.background.width,
                height: this.background.height - 150,
                x: this.background.x,
                y: this.background.y,
            },
            player: {
                texture: this.id["player2.png"],
                width: 68,
                height: 68,
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
            },
            rotation: 0.0064,
		    padding: 1,
            speed: 350.0,
            resolution: 1,
            numberEntities: 5,
            game: this.gameScene,
        }

        this.player2 = new Entities(optionsPlayer2);

        this.gameScene.addChild(this.player2.entities);

        const optionBomb = {
            gameScreen: {
                width: this.background.width,
                height: this.background.height - 150,
                x: this.background.x,
                y: this.background.y,
            },
            player: {
                texture: this.id["bomb.png"],
                width: 100,
                height: 100,
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
            },
            rotation: 0.034,
		    padding: 1,
            speed: 150.0,
            resolution: 1,
            numberEntities: 5,
            game: this.gameScene,
        }

        this.bomb = new Entities(optionBomb);

        this.gameScene.addChild(this.bomb.entities);

        const optionSnow = {
            gameScreen: {
                width: this.background.width,
                height: this.background.height - 150,
                x: this.background.x,
                y: this.background.y,
            },
            player: {
                texture: this.id["snow.png"],
                width: 100,
                height: 100,
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
            },
            rotation: 0.034,
		    padding: 1,
            speed: 200.0,
            resolution: 1,
            numberEntities: 1,
            game: this.gameScene,
        }

        this.snow = new Entities(optionSnow);

        this.gameScene.addChild(this.snow.entities);

        this.player3 = new PIXI.Sprite(this.id["player3.png"]);
        this.player3.width = 78;
        this.player3.height =  78;
        this.player3.x =  this.width / 2 - this.player3.width / 2;
        this.player3.y =  this.height - this.player3.height - 10;

        const optionsExplorer = {
            gameScreen: {
                width: this.background.width,
                height: this.background.height,
                x: this.background.x,
                y: this.background.y,
            },
            player: {
                texture: this.id["player3.png"],
                width: 78,
                height: 78,
                x: this.width / 2 - 39,
                y: this.height - 90,
                vx: 0,
                vy: 0,
            },
            rotation: 1,
            speed: 300.0,
            numberEntities: 6,
            game: this.gameScene,
        }

        this.player3 = new Explorer(optionsExplorer);

        this.gameScene.on("mousedown", (event) => {
            if (this.player3.isActive === false) {
                this.player3.setRotation(event.data.global);
                this.updatePosition();
            }
        });

        // add score
        this.scorePlay1 = new PIXI.Text(0, this.style);
        this.scorePlay1.x = 120;
        this.scorePlay1.y= 10;
        this.scorePlay1.text = 0;

        this.gameScene.addChild(this.scorePlay1)

        // add score
        this.scorePlay2 = new PIXI.Text(0, this.style);
        this.scorePlay2.x = 220;
        this.scorePlay2.y= 10;
        this.scorePlay2.text = 0;

        this.gameScene.addChild(this.scorePlay2)
    
        // add score
        this.scoreBomb = new PIXI.Text(0, this.style);
        this.scoreBomb.x = 320;
        this.scoreBomb.y= 10;
        this.scoreBomb.text = 0;

        this.gameScene.addChild(this.scoreBomb)

        // add score
        this.buttonPlayAgain = new PIXI.Sprite(this.id["player4.png"]);
        this.buttonPlayAgain.width = this.buttonPlayAgain.width / 2;
        this.buttonPlayAgain.height = this.buttonPlayAgain.height / 2;
        this.buttonPlayAgain.x = 120;
        this.buttonPlayAgain.y= this.background.y + this.background.height - this.buttonPlayAgain.height;

		this.buttonPlayAgain.buttonMode = true;
        this.buttonPlayAgain.interactive = true;
        this.buttonPlayAgain.isClick = false;

        this.buttonPlayAgain
        .on('mousedown', this.handleClickPlayAgain)
		.on('tap', this.handleClickPlayAgain);

        this.gameScene.addChild(this.buttonPlayAgain)

        this.game.ticker.add(() => {
            this.player1.entities.children.forEach(this.player1.updateEntities);
            this.player2.entities.children.forEach(this.player2.updateEntities);
            this.bomb.entities.children.forEach(this.bomb.updateEntities);
            this.snow.entities.children.forEach(this.snow.updateEntities);
        });

        // this.gameScene.on("mouseup", (event) => {
        //     this.player3.createExplorer();
        // });

    }

    updatePosition = () => {
        if (this.player3.isActive === true) {
            requestAnimationFrame(this.updatePosition)
            this.player3.play();
            this.bomb.entities.children.forEach((detail) => this.bomb.killEntities(detail, this.player3, this.scoreBomb));
            this.player1.entities.children.forEach((detail) => this.player1.killEntities(detail, this.player3, this.scorePlay1));
            this.player2.entities.children.forEach((detail) => this.player2.killEntities(detail, this.player3, this.scorePlay2));
            this.snow.entities.children.forEach((detail) => this.snow.killEntities(detail, this.player3));
        }
    }

    handleClickPlayAgain = () => {
        this.player3.removeAllChild();
        setTimeout(() => {
            this.player3.reset();
        }, 360);
    }


    customMouseIcon = () => {
        const defaultIcon = "url('assets/template/mouse.png'),auto";
        const defaultIcon2 = "url('assets/template/mouse2.png'),auto";

        this.game.renderer.plugins.interaction.cursorStyles.pointer = defaultIcon;
        this.game.renderer.plugins.interaction.cursorStyles.attack = defaultIcon2;
    }
}

export default Main;