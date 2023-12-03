class Soccer extends Phaser.Scene {

  constructor(){
      super("Soccer");
  }

  init(data){
    this.socket = data.socket;
    this.io = data.io;
    this.blueScore = 0;
    this.redScore = 0;
  }

  preload() {
    //load spritesheets
    this.load.spritesheet('cat1', 'assets/cats/Cat_1.png', { frameWidth: 263, frameHeight: 192 });  
    this.load.spritesheet('cat2', 'assets/cats/Cat_2.png', { frameWidth: 250, frameHeight: 184 });  
    this.load.spritesheet('cat3', 'assets/cats/Cat_3.png', { frameWidth: 250, frameHeight: 184 });  
    this.load.spritesheet('cat4', 'assets/cats/Cat_4.png', { frameWidth: 250, frameHeight: 184 });  
    this.load.spritesheet('cat5', 'assets/cats/Cat_5.png', { frameWidth: 250, frameHeight: 184 });  
    this.load.spritesheet('cat6', 'assets/cats/Cat_6.png', { frameWidth: 250, frameHeight: 184 });  
    this.load.spritesheet('cat7', 'assets/cats/Cat_7.png', { frameWidth: 250, frameHeight: 184 });  
    this.load.spritesheet('cat8', 'assets/cats/Cat_8.png', { frameWidth: 250, frameHeight: 184 });   
    //load background
    this.load.image('soccer_sky', 'assets/soccer/field.png');
    this.load.image('soccer_net', 'assets/soccer/grass.png');
    this.load.image('soccerball', 'assets/soccer/soccerball.png');
    this.load.image('soccer_ground', 'assets/soccer/grass.png');
  }

  create() {

    console.log("Server-side Soccer Game Running")
    
    const self = this;
    this.players = this.add.group();
    this.balls = this.add.group();
    
    //add players to this scene
    for (const playerId in players){
      var randomX = Math.random() * self.game.config.width //set the cats at random y position and standard x position
      var yPos = self.game.config.height - 100
      players[playerId].y = yPos
      players[playerId].x = randomX
      addPlayer(this, players[playerId])
    }

    //emit players to put
    this.io.emit("currentPlayers_soccer", players)

    //handle player inputs and change player object
    for (let [id, socket] of Object.entries(this.io.sockets.connected)) {
      console.log(id);
      socket.on('soccerInput', function (inputData) {
        handlePlayerInput(self, id, inputData);
        })
  }
    
    this.gameOver = false;

    this.platforms = this.physics.add.staticGroup();
    this.net = this.physics.add.staticGroup();
    //ground
    this.platforms.create(400, 568, 'soccer_ground').setScale(2).refreshBody();
    this.platforms.create(400, 600, 'soccer_ground').setScale(2).refreshBody().setTint(0);

    //create left net object
    this.net.create(20, 460, 'soccer_net').setScale(0.02, 5).refreshBody();
    this.net.create(30, 380, 'soccer_net').setScale(0.02, 0.5).refreshBody();
    this.net.create(40, 360, 'soccer_net').setScale(0.02, 0.5).refreshBody();
    this.net.create(50, 350, 'soccer_net').setScale(0.02, 0.5).refreshBody();
    this.net.create(60, 330, 'soccer_net').setScale(0.02, 0.5).refreshBody();
    this.net.create(70, 315, 'soccer_net').setScale(0.02, 0.5).refreshBody();

    this.platforms.create(30, 360, 'soccer_net').setScale(0.02, 0.5).refreshBody();
    this.platforms.create(40, 340, 'soccer_net').setScale(0.02, 0.5).refreshBody();
    this.platforms.create(50, 330, 'soccer_net').setScale(0.02, 0.5).refreshBody();
    this.platforms.create(60, 310, 'soccer_net').setScale(0.02, 0.5).refreshBody();
    this.platforms.create(70, 295, 'soccer_net').setScale(0.02, 0.5).refreshBody();
    this.platforms.create(80, 280, 'soccer_net').setScale(0.02, 1).refreshBody();

    //create right net objects
    this.net.create(780, 460, 'soccer_net').setScale(0.02, 5).refreshBody();
    this.net.create(770, 380, 'soccer_net').setScale(0.02, 0.5).refreshBody();
    this.net.create(760, 360, 'soccer_net').setScale(0.02, 0.5).refreshBody();
    this.net.create(750, 350, 'soccer_net').setScale(0.02, 0.5).refreshBody();
    this.net.create(740, 330, 'soccer_net').setScale(0.02, 0.5).refreshBody();
    this.net.create(730, 315, 'soccer_net').setScale(0.02, 0.5).refreshBody();

    this.platforms.create(770, 360, 'soccer_net').setScale(0.02, 0.5).refreshBody();
    this.platforms.create(760, 340, 'soccer_net').setScale(0.02, 0.5).refreshBody();
    this.platforms.create(750, 330, 'soccer_net').setScale(0.02, 0.5).refreshBody();
    this.platforms.create(740, 310, 'soccer_net').setScale(0.02, 0.5).refreshBody();
    this.platforms.create(730, 295, 'soccer_net').setScale(0.02, 0.5).refreshBody();
    this.platforms.create(720, 280, 'soccer_net').setScale(0.02, 1).refreshBody();
    
    //create ball sprite
    this.ball = this.physics.add.sprite(400, 200, 'soccerball');
    this.ball.setBounce(1);
    this.ball.setCollideWorldBounds(true);
    this.ball.setVelocityY(300);
    this.balls.add(this.ball);
    this.ball.setScale(2);

    this.physics.add.collider(this.players, this.ball);
    this.physics.add.collider(this.ball, this.net, function (ball, net) {
      // Check for scoring when the ball touches the ground
      if (ball.x < 80 && ball.x > 20) {
        // Blue side scores

        console.log(this.blueScore)
        this.blueScore = this.blueScore + 1;
        console.log(this.blueScore)
      } else if (ball.x > 720 && ball.x < 780) {
        // Red side scores
        this.redScore = this.redScore +1;
      }
      // Emit score updates to all players
      let b = this.blueScore;
      let r = this.redScore;
      console.log(b)
      io.emit('scoreUpdate', { b, r });

      // Reset the ball position
      ball.setPosition(400, 200);
      ball.setVelocityX(0);
      ball.setVelocityY(300);
    });

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('cat1', { start: 0, end: 1 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'look_right',
      frames: [{ key: 'cat1', frame: 2 }],
      frameRate: 20
    });

    this.anims.create({
      key: 'look_left',
      frames: [{ key: 'cat1', frame: 1 }],
      frameRate: 20
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('cat1', { start: 2, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    //add colliders
    this.physics.add.collider(this.players, this.platforms);
    this.physics.add.collider(this.players, this.players);
    this.physics.add.collider(this.ball, this.platforms);
    this.physics.add.collider(this.ball, this.players);
    this.physics.add.collider(this.net, this.ball);
    this.physics.add.collider(this.net, this.players);
  }

  update() {

    const speed = 250
    //constantly emit each player's position
    this.players.getChildren().forEach((player) => {
      const input = players[player.playerId].input;
      var animationKey = 'look_left';

      if (input.left) {
        player.setVelocityX(-speed);
        animationKey = 'left'
      } else if (input.right) {
        player.setVelocityX(speed);
        animationKey = 'right'
      } else {
        player.setVelocityX(0);
        if (animationKey == 'right') {
          animationKey = 'look_right'
        }
      }
      if (input.up && player.body.touching.down) {
        player.setVelocityY(-400);
      }

      players[player.playerId].x = player.x;
      players[player.playerId].y = player.y;

      handlePlayerInput(this, player.playerId, input, animationKey); // Pass animation key
    });
    //emit player positions
    io.emit('playerUpdates_soccer', players);

    var ball_x = this.ball.x;
    var ball_y = this.ball.y;

    //emit ball positions
    io.emit('soccer_ballUpdates', {ball_x,ball_y})

    if(getSoccerWinner() != null) {
      io.emit('gameOver', getSoccerWinner());
  
      let countdown = 5;
      const timerInterval = setInterval(() => {
        countdown--;
        if(countdown === 0) {
          clearInterval(timerInterval);
          io.emit('stopSoccerScene');
          gameActive = false;
          this.scene.stop("Soccer");
        }
      }, 300);
    }

  }
}
function getSoccerWinner(blueScore, redScore) {  
  if (blueScore == 5) {
    return "Blue"
  }
  else if (redScore == 5) {
    return "Red";
  }
  else{
    return null;
  }
}
