class Volleyball extends Phaser.Scene {

  constructor(){
      super("Volleyball");
  }

  init(data){
    this.socket = data.socket;
  }
  
   preload() {
    //load sprites
    this.load.spritesheet("cat1", "assets/cats/Cat_1.png", {frameWidth:263, frameHeight:194});
    this.load.spritesheet("cat2", "assets/cats/Cat_2.png", {frameWidth:250, frameHeight:184});
    this.load.spritesheet("cat3", "assets/cats/Cat_3.png", {frameWidth:250, frameHeight:184});
    this.load.spritesheet("cat4", "assets/cats/Cat_4.png", {frameWidth:250, frameHeight:184});
    this.load.spritesheet("cat5", "assets/cats/Cat_5.png", {frameWidth:250, frameHeight:184});
    this.load.spritesheet("cat6", "assets/cats/Cat_6.png", {frameWidth:250, frameHeight:184});
    this.load.spritesheet("cat7", "assets/cats/Cat_7.png", {frameWidth:250, frameHeight:184});
    this.load.spritesheet("cat8", "assets/cats/Cat_8.png", {frameWidth:250, frameHeight:184});
  
    //load background
    this.load.image('volleyball_background', 'assets/volleyball/sky.png');
    this.load.image('net', 'assets/volleyball/platform2.png');
    this.load.image('volleyball', 'assets/volleyball/volleyball.png');
    this.load.image('ground', 'assets/volleyball/platform.png');
  }
  
   create() {
    var self = this;
    this.players = this.add.group();

    console.log("Client-side Volleyball Running")
    this.scene.launch("Rules_Volleyball");

    //add background
    this.add.image(400, 300, 'volleyball_background');
    this.add.image(400, 568, 'ground').setScale(2.3)
    this.add.image(400, 600, 'ground').setScale(2.3).setTint(0)

    this.add.image(400, 350, 'net').setScale(0.5).setRotation(Phaser.Math.DegToRad(90));
  
    // create the ball
    var ball = this.add.sprite(400, 200, 'volleyball');

    // Create text objects to display scores
    this.blueScoreText = this.add.text(640, 16, 'Blue: 0', {
      fontSize: '32px',
      fill: '#0000FF',
    });
    this.redScoreText = this.add.text(16, 16, 'Red: 0', {
      fontSize: '32px',
      fill: '#FF0000',
    });
  
    //listen for currentPlayers and self
    this.socket.on('currentPlayers_volley', function (players) {
      Object.keys(players).forEach(function (id) {
        displayPlayers(self, players[id], players[id].cat);
      });
    });
  
    //listen for player disconnection
    this.socket.on('disconnect_volleyball', function (playerId) {
      self.players.getChildren().forEach(function (player) {
        if (playerId === player.playerId) {
          player.usernameText.destroy();
          player.destroy();
        }
      });
    });
  
    //update player movements and animations from server
    this.socket.on('playerUpdates_volley', function (players) {
      Object.keys(players).forEach(function (id) {
        self.players.getChildren().forEach(function (player) {
          if (players[id].playerId === player.playerId) {
            player.setPosition(players[id].x, players[id].y);
            setUsername_Pos(player,players[id].x, players[id].y);
            // if (player.anims.getName() !== players[id].animationKey) {
            //   player.anims.play(players[id].animationKey, true);
            // }
          }
        });
      });
    });
  
    //update ball positions
    this.socket.on('ballUpdates', function(ball_Pos) {
      const {ball_x, ball_y} = ball_Pos;
      ball.setPosition(ball_x, ball_y);
    });

    this.socket.on('scoreUpdate', function (scores) {
      self.blueScoreText.setText(`Blue: ${scores.blueScore}`);
      self.redScoreText.setText(`Red: ${scores.redScore}`);
    });
  
    //create cursors
    this.cursors = this.input.keyboard.createCursorKeys();
    this.leftKeyPressed = false;
    this.rightKeyPressed = false;
    this.upKeyPressed = false;

    const volley_gameOverText = this.add.text(250, 150, "", {
      fill: "#000000",
      fontFamily: 'Arial',
      fontSize: "50px"
    });
  
    this.socket.on('gameOver', function(team) {
      volley_gameOverText.setText(team + " Won")
      self.socket.emit('')
    });
  
    this.socket.on('stopVolleyballScene', () => {
      self.scene.stop("Volleyball");
    });
    this.players.children.iterate(function (player) {
      player.setDepth(10);
  });
  }
  
   update() {
  
    const left = this.leftKeyPressed;
    const right = this.rightKeyPressed;
    const up = this.upKeyPressed;
  
    //handle cursor inputs
    //added new movements and cleaned up control/inputs
    if (this.cursors.right.isDown) {
      this.rightKeyPressed = true;
      this.leftKeyPressed = false;
      this.upKeyPressed = false;
    } 
    else if (this.cursors.left.isDown) {
      this.leftKeyPressed = true;
      this.rightKeyPressed = false;
      this.upKeyPressed = false;
    } 
    else{
      this.leftKeyPressed = false;
      this.rightKeyPressed = false;
      this.upKeyPressed = false;
    }
    if (this.cursors.up.isDown) {
      this.upKeyPressed = true;
    }
    //if the state of a key has been changed, emit the state of keys to server
    if ( left !== this.leftKeyPressed || right !== this.rightKeyPressed || up !== this.upKeyPressed) {
      this.socket.emit('volleyInput', { left: this.leftKeyPressed , right: this.rightKeyPressed, up: this.upKeyPressed });
    }
  }
  
  }
  
function displayPlayers(self, playerInfo, sprite) {
  if(playerInfo&&sprite){
  const player = self.add.sprite(playerInfo.x, playerInfo.y, sprite).setScale(0.2,0.2);
  if (player) {
    addUsername(player,self,playerInfo)
    //high depth value to bring the player sprite to the front
    player.setDepth(100);
    player.playerId = playerInfo.playerId;
    self.players.add(player);
    console.log(self.players)
  } else {
    console.error('Failed to create player sprite');
  }
  }
}