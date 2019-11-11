import PIXI from './pixi';

class Game {
    constructor(arg) {
		this.config = arg.config;
    }

    init = () => {
        this.game = new PIXI.Application({
            width: 512,
            height: 512,
            antialiasing: true,
            transparent: false,
            resolution: 1
		});
		
		this.loader = new PIXI.Loader();

		this.resources = this.loader.resources;

        document.body.appendChild(this.game.view);
    }

    loaderResource = () => {
        this.loader.add(this.config.urlSource).load(this.setup)
    }

    setup = (resource) => {
        //Make the game scene and add it to the stage
        this.gameScene = new PIXI.Container();
        this.game.stage.addChild(this.gameScene);
        //Make the sprites and add them to the `gameScene`
        //Create an alias for the texture atlas frame ids
		this.id = this.resources[this.config.urlSource].textures;

        //Dungeon
        this.dungeon = new PIXI.Sprite(this.id["dungeon.png"]);
        this.gameScene.addChild(this.dungeon);
        //Door
        this.door = new PIXI.Sprite(this.id["door.png"]);
        this.door.position.set(32, 0);
        this.gameScene.addChild(this.door);
        //this.explorer
        this.explorer = new PIXI.Sprite(this.id["explorer.png"]);
        this.explorer.x = 68;
        this.explorer.y = this.gameScene.height / 2 - this.explorer.height / 2;
        this.explorer.vx = 0;
        this.explorer.vy = 0;
        this.gameScene.addChild(this.explorer);

        //Treasure
        this.treasure = new PIXI.Sprite(this.id["treasure.png"]);
        this.treasure.x = this.gameScene.width - this.treasure.width - 48;
        this.treasure.y = this.gameScene.height / 2 - this.treasure.height / 2;
        this.gameScene.addChild(this.treasure);
        //Make the blobs
        let numberOfBlobs = 6,
            spacing = 48,
            xOffset = 150,
            speed = 2,
            direction = 1;
        //An array to store all the blob monsters
        this.blobs = [];
        //Make as many blobs as there are `numberOfBlobs`
        for (let i = 0; i < numberOfBlobs; i++) {
            //Make a blob
            let blob = new PIXI.Sprite(this.id["blob.png"]);
            //Space each blob horizontally according to the `spacing` value.
            //`xOffset` determines the point from the left of the screen
            //at which the first blob should be added
            let x = spacing * i + xOffset;
            //Give the blob a random y position
            let y = this.randomInt(0, this.game.stage.height - blob.height);
            //Set the blob's position
            blob.x = x;
            blob.y = y;
            //Set the blob's vertical velocity. `direction` will be either `1` or
            //`-1`. `1` means the enemy will move down and `-1` means the blob will
            //move up. Multiplying `direction` by `speed` determines the blob's
            //vertical direction
            blob.vy = speed * direction;
            //Reverse the direction for the next blob
            direction *= -1;
            //Push the blob into the `blobs` array
            this.blobs.push(blob);
            //Add the blob to the `gameScene`
            this.gameScene.addChild(blob);
        }
        //Create the health bar
        this.healthBar = new PIXI.Container();
        this.healthBar.position.set(this.game.stage.width - 170, 4)
        this.gameScene.addChild(this.healthBar);
        //Create the black background rectangle
        let innerBar = new PIXI.Graphics();
        innerBar.beginFill(0x000000);
        innerBar.drawRect(0, 0, 128, 8);
        innerBar.endFill();
        this.healthBar.addChild(innerBar);
        //Create the front red rectangle
        let outerBar = new PIXI.Graphics();
        outerBar.beginFill(0xFF3300);
        outerBar.drawRect(0, 0, 128, 8);
        outerBar.endFill();
        this.healthBar.addChild(outerBar);
        this.healthBar.outer = outerBar;
        //Create the `gameOver` scene
        this.gameOverScene = new PIXI.Container();
        this.game.stage.addChild(this.gameOverScene);
        //Make the `gameOver` scene invisible when the game first starts
        this.gameOverScene.visible = false;
        //Create the text sprite and add it to the `gameOver` scene
        let style = new PIXI.TextStyle({
            fontFamily: "Futura",
            fontSize: 64,
            fill: "white"
        });
        this.message = new PIXI.Text("The End!", style);
        this.message.x = 120;
		this.message.y = this.game.stage.height / 2 - 32;

        this.gameOverScene.addChild(this.message);
        //Capture the keyboard arrow keys
        let left = this.keyboard(37),
            up = this.keyboard(38),
            right = this.keyboard(39),
            down = this.keyboard(40);
        //Left arrow key `press` method
        left.press = () => {
            //Change the this.explorer's velocity when the key is pressed
            this.explorer.vx = -5;
            this.explorer.vy = 0;
        };
        //Left arrow key `release` method
        left.release = () => {
            //If the left arrow has been released, and the right arrow isn't down,
            //and the this.explorer isn't moving vertically:
            //Stop the this.explorer
            if (!right.isDown && this.explorer.vy === 0) {
                this.explorer.vx = 0;
            }
        };
        //Up
        up.press = () => {
            this.explorer.vy = -5;
            this.explorer.vx = 0;
        };
        up.release = () => {
            if (!down.isDown && this.explorer.vx === 0) {
                this.explorer.vy = 0;
            }
        };
        //Right
        right.press = () => {
            this.explorer.vx = 5;
            this.explorer.vy = 0;
        };
        right.release = () => {
            if (!left.isDown && this.explorer.vy === 0) {
                this.explorer.vx = 0;
            }
        };
        //Down
        down.press = () => {
            this.explorer.vy = 5;
            this.explorer.vx = 0;
        };
        down.release = () => {
            if (!up.isDown && this.explorer.vx === 0) {
                this.explorer.vy = 0;
            }
        };

        //Set the game state
        this.state = this.play;

        //Start the game loop 
        this.game.ticker.add(delta => this.gameLoop(delta));
    }

    gameLoop = (delta) => {
        //Update the current game state:
        this.state(delta);
    }

    play = (delta) => {
        //use the this.explorer's velocity to make it move
        this.explorer.x += this.explorer.vx;
        this.explorer.y += this.explorer.vy;
		//Contain the this.explorer inside the area of the dungeon
        this.contain(this.explorer, {
            x: 28,
            y: 10,
            width: 488,
            height: 480
        });
        //this.contain(this.explorer, stage);
        //Set `this.explorerHit` to `false` before checking for a collision
        this.explorerHit = false;
        //Loop through all the sprites in the `enemies` array
        this.blobs.forEach((blob) => {
            //Move the blob
            blob.y += blob.vy;
			//Check the blob's screen boundaries
            let blobHitsWall = this.contain(blob, {
                x: 28,
                y: 10,
                width: 488,
                height: 480
            });
            //If the blob hits the top or bottom of the stage, reverse
            //its direction
            if (blobHitsWall === "top" || blobHitsWall === "bottom") {
                blob.vy *= -1;
            }
            //Test for a collision. If any of the enemies are touching
            //the this.explorer, set `this.explorerHit` to `true`
            if (this.hitTestRectangle(this.explorer, blob)) {
                this.explorerHit = true;
            }
        });
        //If the this.explorer is hit...
        if (this.explorerHit) {
            //Make the this.explorer semi-transparent
            this.explorer.alpha = 0.5;
            //Reduce the width of the health bar's inner rectangle by 1 pixel
            this.healthBar.outer.width -= 1;
        } else {
            //Make the this.explorer fully opaque (non-transparent) if it hasn't been hit
            this.explorer.alpha = 1;
        }
        //Check for a collision between the this.explorer and the treasure
        if (this.hitTestRectangle(this.explorer, this.treasure)) {
            //If the treasure is touching the this.explorer, center it over the this.explorer
            this.treasure.x = this.explorer.x + 8;
            this.treasure.y = this.explorer.y + 8;
        }
        //Does the this.explorer have enough health? If the width of the `innerBar`
        //is less than zero, end the game and display "You lost!"
        if (this.healthBar.outer.width < 0) {
            this.state = this.end;
            this.message.text = "You lost!";
        }
        //If the this.explorer has brought the treasure to the exit,
        //end the game and display "You won!"
        if (this.hitTestRectangle(this.treasure, this.door)) {
            this.state = this.end;
            this.message.text = "You won!";
        }
    }

    end = () => {
        this.gameScene.visible = false;
        this.gameOverScene.visible = true;
    }

    /* Helper functions */
    contain = (sprite, container) => {
        let collision = undefined;
        //Left
        if (sprite.x < container.x) {
            sprite.x = container.x;
            collision = "left";
        }
        //Top
        if (sprite.y < container.y) {
            sprite.y = container.y;
            collision = "top";
        }
        //Right
        if (sprite.x + sprite.width > container.width) {
            sprite.x = container.width - sprite.width;
            collision = "right";
        }
        //Bottom
        if (sprite.y + sprite.height > container.height) {
            sprite.y = container.height - sprite.height;
            collision = "bottom";
        }
        //Return the `collision` value
        return collision;
    }

    //The `hitTestRectangle` function
    hitTestRectangle = (r1, r2) => {
        //Define the variables we'll need to calculate
        let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
        //hit will determine whether there's a collision
        hit = false;
        //Find the center points of each sprite
        r1.centerX = r1.x + r1.width / 2;
        r1.centerY = r1.y + r1.height / 2;
        r2.centerX = r2.x + r2.width / 2;
        r2.centerY = r2.y + r2.height / 2;
        //Find the half-widths and half-heights of each sprite
        r1.halfWidth = r1.width / 2;
        r1.halfHeight = r1.height / 2;
        r2.halfWidth = r2.width / 2;
        r2.halfHeight = r2.height / 2;
        //Calculate the distance vector between the sprites
        vx = r1.centerX - r2.centerX;
        vy = r1.centerY - r2.centerY;
        //Figure out the combined half-widths and half-heights
        combinedHalfWidths = r1.halfWidth + r2.halfWidth;
        combinedHalfHeights = r1.halfHeight + r2.halfHeight;
        //Check for a collision on the x axis
        if (Math.abs(vx) < combinedHalfWidths) {
            //A collision might be occurring. Check for a collision on the y axis
            if (Math.abs(vy) < combinedHalfHeights) {
                //There's definitely a collision happening
                hit = true;
            } else {
                //There's no collision on the y axis
                hit = false;
            }
        } else {
            //There's no collision on the x axis
            hit = false;
        }
        //`hit` will be either `true` or `false`
        return hit;
    };


    //The `randomInt` helper function
    randomInt = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    //The `keyboard` helper function
    keyboard = (keyCode) => {
        var key = {};
        key.code = keyCode;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;
        //The `downHandler`
        key.downHandler = (event) => {
            if (event.keyCode === key.code) {
                if (key.isUp && key.press) key.press();
                key.isDown = true;
                key.isUp = false;
            }
            event.preventDefault();
        };
        //The `upHandler`
        key.upHandler = (event) => {
            if (event.keyCode === key.code) {
                if (key.isDown && key.release) key.release();
                key.isDown = false;
                key.isUp = true;
            }
            event.preventDefault();
        };
        //Attach event listeners
        window.addEventListener(
            "keydown", key.downHandler.bind(key), false
        );
        window.addEventListener(
            "keyup", key.upHandler.bind(key), false
        );
        return key;
    }

}

export default Game;