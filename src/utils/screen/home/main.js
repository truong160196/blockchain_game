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

        window.onresize = (event) => {
            this.resize();
        };
    }

    loaderResource = () => {
        this.loader.add(this.config.urlSource).load(this.setup)
    }

    resize = () => {
        this.width = window.innerWidth
        this.height =  window.innerHeight;

        this.game.view.width = window.screen.width;
        this.game.view.height = window.screen.height;

        this.update();
      }
      
    
    setup = (resources) => {
        this.gameScene = new PIXI.Container();
        this.gameScene.interactive = true;
        this.gameScene.cursor = "pointer";

        this.game.stage.addChild(this.gameScene);

		this.id = this.resources[this.config.urlSource].textures;

        this.background = new PIXI.Sprite(this.id["background.png"]);
        this.background.width = this.width;
        this.background.height =  this.height;

        this.gameScene.addChild(this.background);

        // // logo
        this.logoMain = new PIXI.Sprite(this.id["logo.png"]);
        this.logoMain.width = this.logoMain.width;
        this.logoMain.height = this.logoMain.height;
        this.logoMain.x = this.width / 2 - this.logoMain.width / 2;
        this.logoMain.y = this.height / 2 - this.logoMain.height;

        this.gameScene.addChild(this.logoMain);

        // button play
        this.buttonPlay = new PIXI.Sprite(this.id["button-play.png"]);

        this.buttonPlay.width = this.buttonPlay.width / 2;
        this.buttonPlay.height = this.buttonPlay.height / 2;
        
        this.buttonPlay.x =  this.width / 2 - this.buttonPlay.width / 2;
        this.buttonPlay.y = this.logoMain.y + this.logoMain.height + 30;

        this.buttonPlay.buttonMode = true;
        this.buttonPlay.interactive = true;
        this.buttonPlay.isClick = false;

        this.buttonPlay
        .on('mousedown', (event) => {
            //handle event
            this.buttonPlay.anchor.set(0.1)
            setTimeout(() => {
                this.balanceEthText.text = '0,5'
                this.balanceEthText.x = 120;
                this.buttonPlay.anchor.set(0)
            }, 360);
         })
        .on('tap', (event) => {
            //handle event
            this.buttonPlay.anchor.set(0.1, 0.1)
            setTimeout(() => {
                this.buttonPlay.anchor.set(0)
            }, 360);
         });

        this.gameScene.addChild(this.buttonPlay);
        

        
        // button play
        this.buttonAccount = new PIXI.Sprite(this.id["button-account.png"]);
        this.buttonAccount.width = this.buttonAccount.width / 2;
        this.buttonAccount.height = this.buttonAccount.height / 2;
        this.buttonAccount.x =  this.width / 2 - this.buttonAccount.width / 2;
        this.buttonAccount.y = this.buttonPlay.y + this.buttonPlay.height + 20;

        this.buttonAccount.buttonMode = true;
        this.buttonAccount.interactive = true;
        this.buttonAccount.isClick = false;

        this.buttonAccount
        .on('mousedown', (event) => {
            //handle event
            this.buttonAccount.anchor.set(0.1)
            setTimeout(() => {
                this.buttonAccount.anchor.set(0)
            }, 360);
         })
        .on('tap', (event) => {
            //handle event
            this.buttonAccount.anchor.set(0.1, 0.1)
            setTimeout(() => {
                this.buttonAccount.anchor.set(0)
            }, 360);
         });

        this.gameScene.addChild(this.buttonAccount);

        // setting
        this.setting = new PIXI.Sprite(this.id["button.png"]);
        
        this.setting.width = this.setting.width / 2;
        this.setting.height = this.setting.height / 2;
        this.setting.x = this.padding.left;
        this.setting.y = this.height - this.setting.height - this.padding.bottom;

        var settingIcon = new PIXI.Sprite(this.id["setting.png"]);
        settingIcon.x =  this.setting.width / 2;
        settingIcon.y =  this.setting.height / 2;

        this.setting.addChild(settingIcon);

        this.gameScene.addChild(this.setting);

        // balanceDisplay
        this.balanceEth = new PIXI.Sprite(this.id["balance-eth.png"]);
        this.balanceEth.width = this.balanceEth.width / 1.5;
        this.balanceEth.height = this.balanceEth.height / 1.5;
        this.balanceEth.x = this.width - this.balanceEth.width - this.padding.right;
        this.balanceEth.y = this.padding.top;

        // balance eth
        this.balanceEthText = new PIXI.Text('9,999,999', this.style);
        this.balanceEthText.x = 120;
        this.balanceEthText.y = this.balanceEth.y + 20;
        
        this.balanceEth.addChild(this.balanceEthText);

        this.gameScene.addChild(this.balanceEth);

        // balance god
        this.balanceGod = new PIXI.Sprite(this.id["balance-god.png"]);
        this.balanceGod.width = this.balanceGod.width / 1.5;
        this.balanceGod.height = this.balanceGod.height / 1.5;
        this.balanceGod.x = this.balanceEth.x - this.balanceEth.width - 10;
        this.balanceGod.y = this.padding.top;

        this.balanceGodText = new PIXI.Text('9,999.999.9999', this.style);
        this.balanceGodText.x = 110;
        this.balanceGodText.y = this.balanceGod.y + 20;
        
        this.balanceGod.addChild(this.balanceGodText);

        this.gameScene.addChild(this.balanceGod);

        // responsive
        if (window.screen.width < 578) {
            this.balanceEth.x = this.width / 2 - this.balanceEth.width / 2;
            this.balanceEth.y = this.padding.top + this.balanceGod.height;

            this.balanceEthText.x = 120;
            this.balanceEthText.y = this.balanceEth.y - 50;

            this.balanceGod.x = this.width / 2 - this.balanceGod.width / 2;
            this.balanceGod.y = this.padding.top;
        }

        // volume
        this.volume = new PIXI.Sprite(this.id["button.png"]);
        this.volume.width = this.volume.width / 2;
        this.volume.height = this.volume.height / 2;
        this.volume.x = this.setting.x + this.setting.width + this.padding.left;
        this.volume.y = this.height - this.volume.height - this.padding.bottom;

        var volumeIcon = new PIXI.Sprite(this.id["volume.png"]);
        volumeIcon.x =  this.volume.width / 2 - 5;
        volumeIcon.y =  this.volume.height / 2 - 5;

        this.volume.addChild(volumeIcon);

        this.gameScene.addChild(this.volume);

         // box
         this.box = new PIXI.Sprite(this.id["button.png"]);
         this.box.width = this.box.width / 2;
         this.box.height = this.box.height / 2;
         this.box.x = this.volume.x + this.volume.width + this.padding.left;
         this.box.y = this.height - this.box.height - this.padding.bottom;
 
         
         var boxIcon = new PIXI.Sprite(this.id["box.png"]);
         boxIcon.x =  this.box.width / 2;
         boxIcon.y =  this.box.height / 2;
 
         this.box.addChild(boxIcon);
 
         this.box.buttonMode = true;
         this.box.interactive = true;
         this.box.isOpen = false;
 
         this.box
         .on('mousedown', this.openScreenbox)
         .on('touchstart', this.openScreenbox)
         .on('click', this.openScreenbox)
         this.gameScene.addChild(this.box); 

        this.customMouseIcon();
    }

    update = () => {
        this.background.width = this.width;
        this.background.height = this.height;

        this.logoMain.x = this.width / 2 - this.logoMain.width / 2;
        this.logoMain.y = this.height / 2 - this.logoMain.height;
        this.logoMain.visible = true;

        this.setting.x = this.padding.left;
        this.setting.y = this.height - this.setting.height - this.padding.bottom;

        this.box.x = this.volume.x + this.volume.width + this.padding.left;
        this.box.y = this.height - this.box.height - this.padding.bottom;

        this.volume.x = this.setting.width + this.setting.x + this.padding.left;
        this.volume.y = this.height - this.volume.height - this.padding.bottom;

        this.balanceEth.x = this.width - this.balanceEth.width - this.padding.right;
        this.balanceEth.y = this.padding.top;

        this.balanceEthText.x = 120;
        this.balanceEthText.y = this.balanceEth.y + 20;
        
        this.balanceGod.x = this.balanceEth.x - this.balanceEth.width - 10;
        this.balanceGod.y = this.padding.top;

        this.balanceGodText.x = 110;
        this.balanceGodText.y = this.balanceGod.y + 20;

        this.buttonPlay.x =  this.width / 2 - this.buttonPlay.width / 2;
        this.buttonPlay.y = this.logoMain.y + this.logoMain.height + 30;

        this.buttonAccount.x =  this.width / 2 - this.buttonAccount.width / 2;
        this.buttonAccount.y = this.buttonPlay.y + this.buttonPlay.height + 20;

        // modal shop
        if (this.box.isOpen === true) {
            this.boxModal.width = window.innerWidth / 2;
            this.boxModal.height = window.innerHeight / 1.2;
            this.boxModal.x = this.width / 2 - this.boxModal.width / 2;
            this.boxModal.y = this.padding.top + 50;
        }


        if (window.screen.width < 578) {
            this.balanceEth.x = this.width / 2 - this.balanceEth.width / 2;
            this.balanceEth.y = this.padding.top + this.balanceGod.height;

            this.balanceEthText.x = 120;
            this.balanceEthText.y = this.balanceEth.y - 50;

            this.balanceGod.x = this.width / 2 - this.balanceGod.width / 2;
            this.balanceGod.y = this.padding.top;

            this.buttonPlay.y = this.balanceEth.y + this.balanceEth.height + 30;
            this.buttonAccount.y = this.buttonPlay.y + this.buttonPlay.height + 20;
            this.logoMain.visible = false;

            if (this.box.isOpen === true) {
                this.boxModal.width = window.innerWidth;
                this.boxModal.height = window.innerHeight;
                this.boxModal.x = this.width / 2 - this.boxModal.width / 2;
                this.boxModal.y = 0;
            }
        }
    }

    openScreenbox = () => {
        if (this.box.isOpen === false) {
            this.box.isOpen = true;
           
            this.boxScene = new PIXI.Container();
            this.boxScene.visible = true;
            this.boxScene.interactive = true;
            this.boxScene.cursor = "pointer";
    
            this.game.stage.addChild(this.boxScene);
            
            this.boxModal = new PIXI.Sprite(this.id["shop-modal.png"]);
            this.boxModal.width = window.innerWidth / 2;
            this.boxModal.height = window.innerHeight / 1.2;
            this.boxModal.x = this.width / 2 - this.boxModal.width / 2;
            this.boxModal.y = this.padding.top + 50;
    
            // level
            this.closeButton = new PIXI.Sprite(this.id["button.png"]);
            this.closeButton.width = this.closeButton.width / 2;
            this.closeButton.height = this.closeButton.height / 2;
            this.closeButton.x = this.boxModal.width / 2 - this.closeButton.width / 2;
            this.closeButton.y = this.boxModal.height + 15;

            const closeButtonIcon = new PIXI.Sprite(this.id["back.png"]);
            closeButtonIcon.x = this.closeButton.width / 2 - closeButtonIcon.width / 2
            closeButtonIcon.y = this.closeButton.height / 2 - closeButtonIcon.height / 2
    
            this.closeButton.buttonMode = true;
            this.closeButton.interactive = true;
    
            this.closeButton
            .on('mousedown', this.closeScreenbox)
            .on('touchstart', this.closeScreenbox)
            .on('click', this.closeScreenbox)

            // const itemboxs = [];

            // const itembox = new PIXI.Sprite(this.id["event1.png"]);
            // const itemLimit = Math.ceil(this.boxModal.width / (itembox.width / 4));
            // let rows = 50;
            // let itemOfRows = 0;

            // for (let i = 0; i < 10; i++) {
            //     const item = new PIXI.Sprite(this.id["event1.png"]);
            //     item.width = item.width / 4;
            //     item.height = item.height / 4;

            //     item.x = item.width * itemOfRows + 40;
            //     item.y = rows;
            //     itemOfRows++;

            //     if (itemOfRows === itemLimit) {
            //         rows += (itemboxs[i - 1].y + item.height);
            //         itemOfRows = 0;
            //     }

            //     itemboxs.push(item);

            //     item.buttonMode = true;
            //     item.interactive = true;
        
            //     item
            //     .on('mousedown', (e) => this.selectItembox(e, i))
            //     .on('touchstart', (e) => this.selectItembox(e, i))
            //     .on('click', (e) => this.selectItembox(e, i))

            //     this.boxModal.addChild(item);
            // }
    
            if (window.screen.width < 578) {
                if (this.box.isOpen === true) {
                    this.boxModal.width = window.innerWidth;
                    this.boxModal.height = window.innerHeight;
                    this.boxModal.x = this.width / 2 - this.boxModal.width / 2;
                    this.boxModal.y = 0;
                }
            }
            this.boxModal.addChild(this.closeButton);
    
            this.boxScene.addChild(this.boxModal);
        }
    }

    selectItembox = (event, index) => {
        console.log(event);
        console.log(index);
    }

    closeScreenbox = () => {
        this.boxScene.visible = false;
        this.box.isOpen = false;
        this.game.stage.removeChild(this.boxScene);
    }

    customMouseIcon = () => {
        const defaultIcon = "url('assets/cursor/blob.png'),auto";

        this.game.renderer.plugins.interaction.cursorStyles.pointer = defaultIcon;
    }
}

export default Main;