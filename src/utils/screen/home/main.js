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
    }

    init = () => {
        this.game = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            antialiasing: true,
            transparent: false,
            resolution: 1
        });
        
        this.game.autoResize = true;
        this.game.resize(window.innerWidth, window.innerHeight);
		
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
        this.game.view.width = window.innerWidth;
        this.game.view.height = window.innerHeight;

        this.update();
      }
      
    
    setup = (resources) => {
        this.gameScene = new PIXI.Container();
        this.gameScene.interactive = true;
        this.gameScene.cursor = "pointer";

        this.game.stage.addChild(this.gameScene);

		this.id = this.resources[this.config.urlSource].textures;

        this.background = new PIXI.Sprite(this.id["background.jpg"]);

        this.gameScene.addChild(this.background);

        // logo
        this.logoMain = new PIXI.Sprite(this.id["logo-game.png"]);
        this.logoMain.x = window.screen.width / 2 - this.logoMain.width / 2;
        this.logoMain.y = 100;

        this.gameScene.addChild(this.logoMain);

        // victory
        this.victory = new PIXI.Sprite(this.id["victory.png"]);
        this.victory.width = this.victory.width / 1.2;
        this.victory.height = this.victory.height / 1.2;
        this.victory.x = window.screen.width - this.victory.width - 150;
        this.victory.y = window.screen.height / 2 - this.victory.height / 2;

        this.gameScene.addChild(this.victory);

        // setting
        this.setting = new PIXI.Sprite(this.id["setting.png"]);
        this.setting.width = this.setting.width / 3;
        this.setting.height = this.setting.height / 3;
        this.setting.x = window.screen.width - this.setting.width - this.padding.right;
        this.setting.y = 100;
        this.gameScene.addChild(this.setting);

        // championship
        this.championship = new PIXI.Sprite(this.id["championship.png"]);
        this.championship.width = this.championship.width / 4;
        this.championship.height = this.championship.height / 4;
        this.championship.x = window.screen.width - this.championship.width - this.padding.right;
        this.championship.y = window.screen.height - this.championship.height - this.padding.right;

        this.gameScene.addChild(this.championship);

        // shop
        this.shop = new PIXI.Sprite(this.id["event1.png"]);
        this.shop.width = this.shop.width / 3.5;
        this.shop.height = this.shop.height / 3.5;
        this.shop.x = window.screen.width - this.shop.width - this.championship.width - 30;
        this.shop.y = window.screen.height - this.shop.height - this.padding.right;

        this.shop.buttonMode = true;
        this.shop.interactive = true;
        this.shop.isOpen = false;

        this.shop
        .on('mousedown', this.openScreenShop)
        .on('touchstart', this.openScreenShop)
        .on('click', this.openScreenShop)

        this.gameScene.addChild(this.shop);
                
        // money
        this.money = new PIXI.Sprite(this.id["money.png"]);
        this.money.width = this.money.width / 1.5;
        this.money.height = this.money.height / 1.5;
        this.money.x = window.screen.width - this.money.width - this.padding.right;
        this.money.y = this.padding.top;

        this.gameScene.addChild(this.money);

        // gold
        this.gold = new PIXI.Sprite(this.id["gold.png"]);
        this.gold.width = this.gold.width / 1.5;
        this.gold.height = this.gold.height / 1.5;
        this.gold.x = window.screen.width - this.gold.width - this.money.width - this.padding.right;
        this.gold.y = this.padding.top;

        this.gameScene.addChild(this.gold);

        
        // level
        this.level = new PIXI.Sprite(this.id["level.png"]);
        this.level.width = this.level.width / 1.5;
        this.level.height = this.level.height / 1.5;
        this.level.x = window.screen.width - this.level.width - this.gold.width - this.money.width - this.padding.right;
        this.level.y = this.padding.top;

        this.gameScene.addChild(this.level);


        this.customMouseIcon();
    }

    update = () => {
        this.logoMain.x = window.screen.width / 2 - this.logoMain.width / 2;
        this.logoMain.y = 100;

        this.setting.x = window.screen.width - this.setting.width - this.padding.right;
        this.setting.y = 100;

        this.championship.x = window.screen.width - this.championship.width - this.padding.right;
        this.championship.y = window.screen.height - this.championship.height - this.padding.right;

        this.shop.x = window.screen.width - this.shop.width - this.championship.width - 30;
        this.shop.y = window.screen.height - this.shop.height - this.padding.right;

        this.money.x = window.screen.width - this.money.width - this.padding.right;
        this.money.y = this.padding.top;

        this.gold.x = window.screen.width - this.gold.width - this.money.width - this.padding.right;
        this.gold.y = this.padding.top;

        this.level.x = window.screen.width - this.level.width - this.gold.width - this.money.width - this.padding.right;
        this.level.y = this.padding.top;

        this.victory.x = window.screen.width - this.victory.width - 150;
        this.victory.y = window.screen.height / 2 - this.victory.height / 2;
    }

    openScreenShop = () => {
        if (this.shop.isOpen === false) {
            this.shop.isOpen = true;
           
            this.shopScene = new PIXI.Container();
            this.shopScene.visible = true;
            this.shopScene.interactive = true;
            this.shopScene.cursor = "pointer";
    
            this.game.stage.addChild(this.shopScene);
            
            this.shopModal = new PIXI.Sprite(this.id["victory.png"]);
            this.shopModal.width = this.victory.width;
            this.shopModal.height = this.victory.height;
            this.shopModal.x = 150;
            this.shopModal.y = window.screen.height / 2 - this.victory.height / 2;
    
            // level
            this.closeButton = new PIXI.Sprite(this.id["level.png"]);
            this.closeButton.width = this.level.width;
            this.closeButton.height = this.level.height;
            this.closeButton.x = this.shopModal.width;
            this.closeButton.y = 0;
    
            this.closeButton.buttonMode = true;
            this.closeButton.interactive = true;
    
            this.closeButton
            .on('mousedown', this.closeScreenShop)
            .on('touchstart', this.closeScreenShop)
            .on('click', this.closeScreenShop)

            const itemShops = [];

            const itemShop = new PIXI.Sprite(this.id["event1.png"]);
            const itemLimit = Math.ceil(this.shopModal.width / (itemShop.width / 4));
            let rows = 50;
            let itemOfRows = 0;

            for (let i = 0; i < 10; i++) {
                const item = new PIXI.Sprite(this.id["event1.png"]);
                item.width = item.width / 4;
                item.height = item.height / 4;

                item.x = item.width * itemOfRows + 40;
                item.y = rows;
                itemOfRows++;

                if (itemOfRows === itemLimit) {
                    rows += (itemShops[i - 1].y + item.height);
                    itemOfRows = 0;
                }

                itemShops.push(item);

                item.buttonMode = true;
                item.interactive = true;
        
                item
                .on('mousedown', (e) => this.selectItemShop(e, i))
                .on('touchstart', (e) => this.selectItemShop(e, i))
                .on('click', (e) => this.selectItemShop(e, i))

                this.shopModal.addChild(item);
            }
    
            this.shopModal.addChild(this.closeButton);
    
            this.shopScene.addChild(this.shopModal);
        }
    }

    selectItemShop = (event, index) => {
        console.log(event);
        console.log(index);
    }

    closeScreenShop = () => {
        this.shopScene.visible = false;
        this.shop.isOpen = false;
        this.game.stage.removeChild(this.shopScene);
    }

    customMouseIcon = () => {
        const defaultIcon = "url('assets/cursor/blob.png'),auto";

        this.game.renderer.plugins.interaction.cursorStyles.pointer = defaultIcon;
    }
}

export default Main;