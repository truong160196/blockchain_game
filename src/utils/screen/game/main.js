
import * as PIXI from "pixi.js"

import Entities from '../../source/Entities';
import Explorer from '../../source/Explorer';

import GameMain from '../home/main';


class Main {
    constructor(arg) {
        this.config = arg.config;
        this.blockchain = arg.blockchain;
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
        this.timeNumber= 30;
        this.numberBall = arg.numberBall;
        this.pause = false;
        this.event = 'entities_01'
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

        const loading = document.getElementById('loader');

        this.loader.onProgress.add(() => {
            if (loading) {
                loading.style.display = 'block'
            }
        }); 

        this.loader.onComplete.add(() => {
            setTimeout(() => {
                if (loading) {
                    loading.style.display = 'none'
                }
            }, 1800);
        });

        this.customMouseIcon();

        this.setTimeOver();
        // window.onresize = (event) => {
        //     this.resize();
        // };
    }
    
    resize = () => {
        
    }

    loaderResource = () => {
        this.loader.add(this.config.urlSource).load(this.setup);
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
		this.sheet = this.resources[this.config.urlSource].spritesheet;

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
            timeAppend: 1,
            numberEntities: 7,
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
            numberEntities: 2,
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
            timeAppend: 1,
            numberEntities: 6,
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
            timeAppend: 4,
		    padding: 1,
            speed: 160.0,
            resolution: 1,
            numberEntities: 3,
            game: this.gameScene,
        }

        this.snow = new Entities(optionSnow);

        this.gameScene.addChild(this.snow.entities);

        this.animatedSprite = new PIXI.AnimatedSprite(this.sheet.animations["fire"]);
        this.animatedSprite.animationSpeed = 0.5;
        this.animatedSprite.width = this.animatedSprite.width * 2;
        this.animatedSprite.height = this.animatedSprite.height * 2;

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
            limitBall: this.numberBall,
            numberEntities: 1,
            game: this.gameScene,
            stage: this.game
        }

        this.explorer = new Explorer(optionsExplorer);

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

        const listItem = [];

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

        // add score
        this.time = new PIXI.Sprite(this.id["tine.png"]);
        this.time.width = this.time.width / 1.5;
        this.time.height = this.time.height / 1.5;
        this.time.x = 150
        this.time.y =0;

        const timeTextStyle = new PIXI.TextStyle({
            fontSize: 35,
            lineHeight: 2,
            fontWeight: 600,
            fill: "white"
        });

        this.timeText = new PIXI.Text(this.timeNumber, timeTextStyle);
        this.timeText.x = this.time.x;
        this.timeText.y=  this.time.y + this.time.height / 2 + 15;
        this.timeText.score = this.timeNumber;

        this.time.addChild(this.timeText);

        this.gameScene.addChild(this.time);

        if (this.pause === false) {
            this.game.ticker.add(() => {
                this.player1.entities.children.forEach(this.player1.updateEntities);
                this.player2.entities.children.forEach(this.player2.updateEntities);
                this.bomb.entities.children.forEach(this.bomb.updateEntities);
                this.snow.entities.children.forEach(this.snow.updateEntities);
            });
            this.updatePosition();
         }

    }

    setTimeOver = () => {
        setInterval(() => {
            if (this.pause === false) {
                this.timeNumber--;
                this.timeText.text = this.timeNumber;
    
                if (this.timeNumber === 0) {
                    this.pauseView()
                    this.openPanelVictory()
                }
            }
        }, 1000);
    }

    pauseView = () => {
        this.pause = true;
        // this.game.ticker.stop();
        this.explorer.actionPause();
        this.player1.setPause();
        this.player2.setPause();
        this.bomb.setPause();
        this.snow.setPause();
    }

    openPanelVictory = () => {
        this.victory = new PIXI.Sprite(this.id["victory.png"]);
        this.victory.width = this.background.width / 2;
        this.victory.height = this.background.height;
        this.victory.x = this.background.width / 2 - this.victory.width / 2;
        this.victory.y = this.background.height / 2 - this.victory.height / 2;
        console.log(this.event);

        this.eventKill = new PIXI.Sprite(this.id[`entities_06.png`]);
        this.eventKill.width = this.eventKill.width / 4;
        this.eventKill.height = this.eventKill.height / 4;
        this.eventKill.x = 145;
        this.eventKill.y = 90;

        
        const styleScore = new PIXI.TextStyle({
            fontSize: 50,
            lineHeight: 2,
            fontWeight: 600,
            fill: "yellow"
        });

        this.scoreEvent = new PIXI.Text(0, styleScore);
        this.scoreEvent.x = this.eventKill.x - 35;
        this.scoreEvent.y=  this.scoreEvent.height + 130;
        this.scoreEvent.text = this.bomb.getScore();

        this.eventKill.addChild(this.scoreEvent)

        this.victory.addChild(this.eventKill);

        this.scoreGame = new PIXI.Sprite(this.id[`score.png`]);
        this.scoreGame.width = this.scoreGame.width / 2;
        this.scoreGame.height = this.scoreGame.height / 2;
        this.scoreGame.x = 100;
        this.scoreGame.y = 155;

        
        const styleScore2 = new PIXI.TextStyle({
            fontSize: 50,
            lineHeight: 2,
            fontWeight: 900,
            fill: "yellow"
        });

        this.scoreEndGGame = new PIXI.Text(this.scorePlay1.score, styleScore2);
        this.scoreEndGGame.x = this.scoreGame.width - this.scoreEndGGame.width / 2;
        this.scoreEndGGame.y=  this.scoreGame.height;

        this.scoreGame.addChild(this.scoreEndGGame)
        
        this.victory.addChild(this.scoreGame);

        
        this.buttonSave = new PIXI.Sprite(this.id[`button-save.png`]);
        this.buttonSave.width = this.buttonSave.width / 2;
        this.buttonSave.height = this.buttonSave.height / 2;
        this.buttonSave.x = 140;
        this.buttonSave.y = 260;
        
        this.buttonSave.buttonMode = true;
        this.buttonSave.interactive = true;
        this.buttonSave.isClick = false;

        this.buttonSave
        .on('tap', this.saveGame)
        .on('click',(event) => {
            this.saveGame();
        })
        .on('mousedown', (event) => {
            this.saveGame();
        });

        this.victory.addChild(this.buttonSave)
        
        this.gameScene.addChild(this.victory);
    }

    saveGame = async() => {
        try {
            this.gameScene.visible = false;
            this.game.destroy(true, true);
    
            const define = {
                config: {
                  urlSource: './assets/template/home.json'
                }
              };
          
            this.gameDev = new GameMain(define);
    
            this.gameDev.init();

            if (this.blockchain && typeof this.blockchain.rewardPromotion === 'function' ) {
                const score = Number(this.bomb.getScore());
                this.blockchain.rewardPromotion(score);

                this.blockchain.updateScore(score);
            }
        } catch(err) {
            console.error(err);
        }
    }

    updatePosition = () => {
        if (this.pause === false) {
            if (this.explorer.limitBall <= 0) {
                this.setTimeOver();
            }

            requestAnimationFrame(this.updatePosition)
            this.bomb.entities.children.forEach((detail) => this.bomb.killEntities(
                detail,
                this.explorer,
                this.scorePlay1,
                this.animatedSprite
                ));
            this.player1.entities.children.forEach((detail) => this.player1.killEntities(
                detail,
                this.explorer,
                this.scorePlay1,
                this.animatedSprite
                ));
            this.player2.entities.children.forEach((detail) => this.player2.killEntities(
                detail,
                this.explorer,
                this.scorePlay1,
                this.animatedSprite
                ));
            this.snow.entities.children.forEach((detail) => this.snow.killEntities(
                detail,
                this.explorer,
                this.scorePlay1,
                this.animatedSprite
                ));
        }
    }


    customMouseIcon = () => {
        const defaultIcon = "url('assets/template/mouse.png'),auto";
        const defaultIcon2 = "url('assets/template/mouse2.png'),auto";

        this.game.renderer.plugins.interaction.cursorStyles.pointer = defaultIcon;
        this.game.renderer.plugins.interaction.cursorStyles.attack = defaultIcon2;
    }
}

export default Main;