import * as PIXI from "pixi.js"

import {formatCurrency} from '../../formatNumber';

import GameMain from '../game/main';

import * as Types from '../../../constant/ActionTypes';

class Main {
    constructor(arg) {
        this.config = arg.config;

        this.padding = {
            left: 15,
            top: 15,
            right: 15,
            bottom: 15
        }
        this.numberBall = 50;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.style = new PIXI.TextStyle({
            fontFamily: "Futura",
            fontSize: 25,
            fill: "yellow",
            fontWeight: 600,
        });

        this.blockchain = arg.blockchain;
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

        // window.onresize = (event) => {
        //     this.resize();
        // };
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

    setBalanceEth = (value) => {
        if (this.balanceEthText && this.balanceEthText.x) {
            if (value && value > 0 && this.balanceEthText.text != value) {
                this.balanceEthText.text = `${formatCurrency(value, 4)} E`
                this.balanceEthText.x = 100;
            }
        }
    }

    setBalanceGold = (value) => {
        if (this.balanceGodText && this.balanceGodText.x) {
            if (value && value > 0 && this.balanceGodText.text != value) {
                this.balanceGodText.text = `${formatCurrency(value, 0)} Q`
                this.balanceGodText.x = 110;
            }
        }
    }
      
    
    setup = (resources) => {
        this.gameScene = new PIXI.Container();
        this.gameScene.interactive = true;
        this.gameScene.cursor = "pointer";

        this.game.stage.addChild(this.gameScene);

		this.id = this.resources[this.config.urlSource].textures;

        this.background = new PIXI.Sprite(this.id["background.jpg"]);
        this.background.width = this.width;
        this.background.height =  this.height;

        this.gameScene.addChild(this.background);

        // // logo
        var texturePromotion = PIXI.Texture.from('./assets/template/promotion.png');

        this.promotionPanel = new PIXI.TilingSprite(texturePromotion, 460, 325);
        this.promotionPanel.width = this.promotionPanel.width;
        this.promotionPanel.height = this.promotionPanel.height;
        this.promotionPanel.x = 70;
        this.promotionPanel.y = 120;

        this.gameScene.addChild(this.promotionPanel);

        // button play
        this.buttonPlay = new PIXI.Sprite(this.id["button-play.png"]);
        this.buttonPlay.width = this.buttonPlay.width * 1.2;
        this.buttonPlay.height = this.buttonPlay.height * 1.2;
        this.buttonPlay.x =  this.width / 2 - this.buttonPlay.width / 2;
        this.buttonPlay.y =  this.height / 2 - this.buttonPlay.height;

        this.buttonPlay.buttonMode = true;
        this.buttonPlay.interactive = true;
        this.buttonPlay.isClick = false;

        this.buttonPlay
        .on('tap', this.openScreenGame)
        .on('click',(event) => {
            this.openScreenGame();
        })
        .on('mousedown', (event) => {
            this.openScreenGame();
        });

        this.gameScene.addChild(this.buttonPlay);

        // buttonRanking
        this.buttonRanking = new PIXI.Sprite(this.id["button-rank.png"]);
        
        this.buttonRanking.width = this.buttonRanking.width / 1.5;
        this.buttonRanking.height = this.buttonRanking.height / 1.5;
        this.buttonRanking.x = this.width - this.buttonRanking.width -  this.padding.right;
        this.buttonRanking.y = this.height - this.buttonRanking.height - this.padding.bottom;

        
        this.buttonRanking.buttonMode = true;
        this.buttonRanking.interactive = true;
        this.buttonRanking.isOpen = false;

        this.buttonRanking
        .on('tap', this.openScreenRank)
        .on('click',(event) => {
            this.openScreenRank();

            this.buttonRanking.anchor.set(0.1)
            setTimeout(() => {
                this.buttonRanking.anchor.set(0)
            }, 360);
        })
        .on('mousedown', (event) => {
            this.openScreenRank();

            this.buttonRanking.anchor.set(0.1, 0.1)
            setTimeout(() => {
                this.buttonRanking.anchor.set(0)
            }, 360);
        });

        this.gameScene.addChild(this.buttonRanking);

        // buttonAccount
        this.buttonShop = new PIXI.Sprite(this.id["button-shop.png"]);
        this.buttonShop.width = this.buttonShop.width / 1.5;
        this.buttonShop.height = this.buttonShop.height / 1.5;
        this.buttonShop.x = this.buttonRanking.x - this.buttonRanking.width - this.buttonShop.width / 4;
        this.buttonShop.y = this.height - this.buttonRanking.height - this.padding.bottom;

        this.buttonShop.buttonMode = true;
        this.buttonShop.interactive = true;
        this.buttonShop.isOpen = false;

        this.buttonShop
        .on('tap', this.openScreenShop)
        .on('click',(event) => {
            this.openScreenShop();

            this.buttonShop.anchor.set(0.1)
            setTimeout(() => {
                this.buttonShop.anchor.set(0)
            }, 360);
        })
        .on('mousedown', (event) => {
            //handle event
            this.openScreenShop();

            this.buttonShop.anchor.set(0.1, 0.1)
            setTimeout(() => {
                this.buttonShop.anchor.set(0)
            }, 360);
        });
        this.gameScene.addChild(this.buttonShop); 

        // button account
        this.buttonAccount = new PIXI.Sprite(this.id["button-account.png"]);
        this.buttonAccount.width = this.buttonAccount.width / 1.5;
        this.buttonAccount.height = this.buttonAccount.height / 1.5;
        this.buttonAccount.x =  this.buttonShop.x - this.buttonShop.width - this.buttonAccount.width / 4;
        this.buttonAccount.y = this.height - this.buttonRanking.height - this.padding.bottom;

        this.buttonAccount.buttonMode = true;
        this.buttonAccount.interactive = true;
        this.buttonAccount.isOpen = false;

        this.buttonAccount
        .on('tap', this.openScreenAccount)
        .on('click',(event) => {
            this.openScreenAccount();

            this.buttonAccount.anchor.set(0.1)
            setTimeout(() => {
                this.buttonAccount.anchor.set(0)
            }, 360);
        })
        .on('mousedown', (event) => {
            //handle event
            this.openScreenAccount();

            this.buttonAccount.anchor.set(0.1, 0.1)
            setTimeout(() => {
                this.buttonAccount.anchor.set(0)
            }, 360);
        });

        this.gameScene.addChild(this.buttonAccount);

        // balanceDisplay
        this.balanceEth = new PIXI.Sprite(this.id["eth-balance.png"]);
        this.balanceEth.width = this.balanceEth.width / 1.5;
        this.balanceEth.height = this.balanceEth.height / 1.5;
        this.balanceEth.x = this.width - this.balanceEth.width - this.padding.right;
        this.balanceEth.y = this.padding.top;

        // balance eth
        this.balanceEthText = new PIXI.Text(0, this.style);
        this.balanceEthText.x = 100;
        this.balanceEthText.y = this.balanceEth.y + 10;;
        
        this.balanceEth.addChild(this.balanceEthText);

        this.gameScene.addChild(this.balanceEth);

        // balance god
        this.balanceGod = new PIXI.Sprite(this.id["money-balance.png"]);
        this.balanceGod.width = this.balanceGod.width / 1.5;
        this.balanceGod.height = this.balanceGod.height / 1.5;
        this.balanceGod.x = this.balanceEth.x - this.balanceEth.width - 10;
        this.balanceGod.y = 10;

        this.balanceGodText = new PIXI.Text(0, this.style);
        this.balanceGodText.x = 110;
        this.balanceGodText.y = this.balanceGod.y + 22;
        
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
        this.volume.x = this.buttonRanking.x + this.buttonRanking.width + this.padding.left;
        this.volume.y = this.height - this.volume.height - this.padding.bottom;

        var volumeIcon = new PIXI.Sprite(this.id["volume.png"]);
        volumeIcon.x =  this.volume.width / 2 - 5;
        volumeIcon.y =  this.volume.height / 2 - 5;

        this.volume.addChild(volumeIcon);

        this.gameScene.addChild(this.volume);

        this.customMouseIcon();
    }

    loadTotalBall = async() => {
        try {
            const listItem = Types.STORE.item;
            if (this.blockchain) {
                if (typeof this.blockchain.getAccountItemFromAddress === 'function') {
                    const dataItem = await this.blockchain.getAccountItemFromAddress();
        
                    if (dataItem && dataItem.length > 0) {
                        dataItem.forEach((item) => {
                            if (item.id > 0) {
                                let objItem = listItem.find(obj => obj.id === Number(item.id));
            
                                if (objItem) {
                                    this.numberBall += (objItem.power * Number(item.qtyItem));
                                }
                            }
                        })
            
                    }
                }
            }
        } catch (err) {
            console.error(err);
        }   
    }

    openScreenGame = async() => {
        try {
            this.gameScene.visible = false;

            this.game.destroy(true, true);
    
            await this.loadTotalBall();
            const define = {
                config: {
                  urlSource: './assets/template/game.json'
                },
                numberBall: this.numberBall,
                blockchain: this.blockchain,
            };
    
            this.gameMain = new GameMain(define, PIXI);
    
            this.gameMain.init();
        } catch (err) {
            console.error(err);
        }

    }

    update = () => {
        this.background.width = this.width;
        this.background.height = this.height;

        this.promotionPanel.x = this.width / 2 - this.promotionPanel.width / 2;
        this.promotionPanel.y = this.height / 2 - this.promotionPanel.height;
        this.promotionPanel.visible = true;

        this.buttonRanking.x = this.padding.left;
        this.buttonRanking.y = this.height - this.buttonRanking.height - this.padding.bottom;

        this.buttonAccount.x = this.volume.x + this.volume.width + this.padding.left;
        this.buttonAccount.y = this.height - this.buttonAccount.height - this.padding.bottom;

        this.volume.x = this.buttonRanking.width + this.buttonRanking.x + this.padding.left;
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
        this.buttonPlay.y = this.promotionPanel.y + this.promotionPanel.height + 30;

        this.buttonAccount.x =  this.width / 2 - this.buttonAccount.width / 2;
        this.buttonAccount.y = this.buttonPlay.y + this.buttonPlay.height + 20;

        // modal buttonAccount
        if (this.buttonAccount.isOpen === true) {
            this.boxModal.width = window.innerWidth / 2;
            this.boxModal.height = window.innerHeight / 1.2;
            this.boxModal.x = this.width / 2 - this.boxModal.width / 2;
            this.boxModal.y = this.padding.top + 50;
            this.closeButton.x = this.boxModal.x - this.boxModal.width / 2 + 25;
            this.closeButton.y = this.padding.top + 100;

            const addressInput = document.getElementById('form-input');
            addressInput.style.display = 'block'
            addressInput.style.width = this.boxModal.width - 100 + 'px';
            addressInput.style.left = this.boxModal.x + 50 + 'px';
            addressInput.style.top = this.boxModal.y + this.boxModal.height / 4 + 'px';
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
            this.promotionPanel.visible = false;

            if (this.buttonAccount.isOpen === true) {
                this.boxModal.width = window.innerWidth;
                this.boxModal.height = window.innerHeight;
                this.boxModal.x = this.width / 2 - this.boxModal.width / 2;
                this.boxModal.y = 0;

                this.closeButton.x = this.boxModal.x + 25;
                this.closeButton.y = this.padding.top + 100;

                const addressInput = document.getElementById('form-input');
                addressInput.style.display = 'block'
                addressInput.style.width = this.boxModal.width - 100 + 'px';
                addressInput.style.left = this.boxModal.x + 50 + 'px';
                addressInput.style.top = this.boxModal.y + this.boxModal.height / 4 + 'px';
            }
        }
    }

    openScreenAccount = () => {
        if (this.buttonAccount.isOpen === false) {
            this.buttonAccount.isOpen = true;
            this.buttonShop.isOpen = true;
            this.buttonRanking.isOpen = true;
           
            this.boxScene = new PIXI.Container();
            this.boxScene.visible = true;
            this.boxScene.interactive = true;
            this.boxScene.cursor = "pointer";
    
            this.game.stage.addChild(this.boxScene);
            
            this.boxModal = new PIXI.Sprite(this.id["account.png"]);
            this.boxModal.width = window.innerWidth / 2;
            this.boxModal.height = window.innerHeight / 1.2;
            this.boxModal.x = this.width / 2 - this.boxModal.width / 2;
            this.boxModal.y = this.padding.top + 50;
    
            // level
            this.closeButton = new PIXI.Sprite(this.id["button-close.png"]);
            this.closeButton.width = this.closeButton.width / 2;
            this.closeButton.height = this.closeButton.height / 2;
            this.closeButton.x = this.boxModal.x + 70;
            this.closeButton.y = this.boxModal.y;
    
            this.closeButton.buttonMode = true;
            this.closeButton.interactive = true;
    
            this.closeButton
            .on('mousedown', this.closeScreenAccount)
            .on('touchstart', this.closeScreenAccount)
            .on('click', this.closeScreenAccount)

            const addressInput = document.getElementById('form-input');
            addressInput.style.display = 'block'
            addressInput.style.width = this.boxModal.width - 100 + 'px';
            addressInput.style.left = this.boxModal.x + 50 + 'px';
            addressInput.style.top = this.boxModal.y + this.boxModal.height / 4 + 'px';

            this.boxModal.addChild(this.closeButton);
    
            this.boxScene.addChild(this.boxModal);
        }
    }

    openScreenShop= () => {
        if (this.buttonShop.isOpen === false) {
            this.buttonShop.isOpen = true;
            this.buttonAccount.isOpen = true;
            this.buttonRanking.isOpen = true;
           
            this.shopScene = new PIXI.Container();
            this.shopScene.visible = true;
            this.shopScene.interactive = true;
            this.shopScene.cursor = "pointer";
    
            this.game.stage.addChild(this.shopScene);
            
            this.shopModal = new PIXI.Sprite(this.id["shop.png"]);
            this.shopModal.width = window.innerWidth / 2;
            this.shopModal.height = window.innerHeight / 1.2;
            this.shopModal.x = this.width / 2 - this.shopModal.width / 2;
            this.shopModal.y = this.padding.top + 50;
    
            // level
            this.closeButtonShop = new PIXI.Sprite(this.id["button-close.png"]);
            this.closeButtonShop.width = this.closeButtonShop.width / 2;
            this.closeButtonShop.height = this.closeButtonShop.height / 2;
            this.closeButtonShop.x = this.shopModal.x + 70;
            this.closeButtonShop.y = this.shopModal.y;
    
            this.closeButtonShop.buttonMode = true;
            this.closeButtonShop.interactive = true;
    
            this.closeButtonShop
            .on('mousedown', this.closeScreenShop)
            .on('touchstart', this.closeScreenShop)
            .on('click', this.closeScreenShop)

            const shopPanel = document.getElementById('shop-panel');

            if (shopPanel) {
                shopPanel.style.display = 'block'
                shopPanel.style.width = this.shopModal.width - 100 + 'px';
                shopPanel.style.left = this.shopModal.x + 50 + 'px';
                shopPanel.style.top = this.shopModal.y + 110 + 'px';
            }

            this.shopModal.addChild(this.closeButtonShop);
    
            this.shopScene.addChild(this.shopModal);
        }
    }

    openScreenRank= () => {
        if (this.buttonRanking.isOpen === false) {
            this.buttonShop.isOpen = true;
            this.buttonAccount.isOpen = true;
            this.buttonRanking.isOpen = true;
           
            this.rankScene = new PIXI.Container();
            this.rankScene.visible = true;
            this.rankScene.interactive = true;
            this.rankScene.cursor = "pointer";
    
            this.game.stage.addChild(this.rankScene);
            
            this.rankModal = new PIXI.Sprite(this.id["top1.png"]);
            this.rankModal.width = window.innerWidth / 2;
            this.rankModal.height = window.innerHeight / 1.2;
            this.rankModal.x = this.width / 2 - this.rankModal.width / 2;
            this.rankModal.y = this.padding.top + 50;
    
            // level
            this.closeButtonRank = new PIXI.Sprite(this.id["button-close.png"]);
            this.closeButtonRank.width = this.closeButtonRank.width / 2;
            this.closeButtonRank.height = this.closeButtonRank.height / 2;
            this.closeButtonRank.x = this.rankModal.x + 70;
            this.closeButtonRank.y = this.rankModal.y;
    
            this.closeButtonRank.buttonMode = true;
            this.closeButtonRank.interactive = true;
    
            this.closeButtonRank
            .on('mousedown', this.closeScreenRank)
            .on('touchstart', this.closeScreenRank)
            .on('click', this.closeScreenRank)

            const rankPanel = document.getElementById('rank-panel');

            if (rankPanel) {
                rankPanel.style.display = 'block'
                rankPanel.style.width = this.rankModal.width - 100 + 'px';
                rankPanel.style.left = this.rankModal.x + 50 + 'px';
                rankPanel.style.top = this.rankModal.y + 110 + 'px';
            }

            this.rankModal.addChild(this.closeButtonRank);
    
            this.rankScene.addChild(this.rankModal);
        }
    }

    closeScreenAccount = () => {
        this.boxScene.visible = false;
        this.buttonAccount.isOpen = false;
        this.buttonShop.isOpen = false;
        this.buttonRanking.isOpen = false;

        const addressInput = document.getElementById('form-input');
        addressInput.style.display = 'none'
        this.game.stage.removeChild(this.boxScene);
    }

    closeScreenShop = () => {
        this.shopScene.visible = false;
        this.buttonShop.isOpen = false;
        this.buttonAccount.isOpen = false;
        this.buttonRanking.isOpen = false;


        const shopPanel = document.getElementById('shop-panel');
        if (shopPanel) {
            shopPanel.style.display = 'none'
        }

        this.game.stage.removeChild(this.shopScene);
    }

    closeScreenRank = () => {
        this.rankScene.visible = false;
        this.buttonShop.isOpen = false;
        this.buttonAccount.isOpen = false;
        this.buttonRanking.isOpen = false;
        const rankPanel = document.getElementById('rank-panel');
        if (rankPanel) {
            rankPanel.style.display = 'none'
        }

        this.game.stage.removeChild(this.rankScene);
    }

    customMouseIcon = () => {
        const defaultIcon = "url('assets/template/mouse.png'),auto";

        this.game.renderer.plugins.interaction.cursorStyles.pointer = defaultIcon;
    }
}

export default Main;