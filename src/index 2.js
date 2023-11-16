//bring in the scenes
import "phaser";
import config from "./config/config.js";
import Login from "./scenes/Login.js";
import MainScene from "./scenes/MainScene.js";


class Game extends Phaser.Game {
    constructor(){

        super(config);
        //TODO: add scenes here 
        this.scene.add("MainScene",MainScene);
        this.scene.add("Login",Login);
        

        // start game in main scene
        this.scene.start("MainScene");
    }
}

window.onload = function(){
    window.game = new Game();
};