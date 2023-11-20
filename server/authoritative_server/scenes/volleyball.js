const players = {};

const config = {
  type: Phaser.HEADLESS,
  parent: 'game',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 400 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  autoFocus: false
};

function preload() {

  this.load.spritesheet('cat', 'assets/cats/Cat_1.png', { frameWidth: 263, frameHeight: 192 });  
  this.load.spritesheet('cat2', 'assets/cats/Cat_2.png', { frameWidth: 263, frameHeight: 192 });  
  this.load.spritesheet('cat3', 'assets/cats/Cat_3.png', { frameWidth: 263, frameHeight: 192 });  
  this.load.spritesheet('cat4', 'assets/cats/Cat_4.png', { frameWidth: 263, frameHeight: 192 });  
  this.load.spritesheet('cat5', 'assets/cats/Cat_5.png', { frameWidth: 263, frameHeight: 192 });  
  this.load.spritesheet('cat6', 'assets/cats/Cat_6.png', { frameWidth: 263, frameHeight: 192 });  
  this.load.spritesheet('cat7', 'assets/cats/Cat_7.png', { frameWidth: 263, frameHeight: 192 });  
  this.load.spritesheet('cat8', 'assets/cats/Cat_8.png', { frameWidth: 263, frameHeight: 192 });   
  //load background
  this.load.image('sky', 'assets/volleyball/spaceship.png');
  this.load.image('net', 'assets/volleyball/platform2.png');
  this.load.image('earth', 'assets/volleyball/earth.png');
  this.load.image('mars', 'assets/volleyball/mars.png');
  this.load.image('saturn', 'assets/volleyball/saturn.png');
  this.load.image('ground', 'assets/volleyball/platform2.png');
}

function create() {
  const self = this;
  this.players = this.add.group();
  this.balls = this.add.group();
  //add background

  this.gameOver = false;

  this.platforms = this.physics.add.staticGroup();
  this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
  this.platforms.create(400, 350, 'net').setScale(0.05, 7).refreshBody();
  this.platforms.create(200, 220, 'ground').setScale(.5).refreshBody();
  this.platforms.create(600, 220, 'ground').setScale(.5).refreshBody();
  this.platforms.create(200, 400, 'ground').setScale(.5).refreshBody();
  this.platforms.create(600, 400, 'ground').setScale(.5).refreshBody();
  
  this.ball = this.physics.add.sprite(400, 200, 'earth');
  this.ball.body.allowGravity = false;
  this.ball.setBounce(1);
  this.ball.setCollideWorldBounds(true);
  this.ball.setVelocityX(300);
  this.ball.setVelocityY(300);

  this.ball2 = this.physics.add.sprite(400, 200, 'mars');
  this.ball2.body.allowGravity = false;
  this.ball2.setBounce(1);
  this.ball2.setCollideWorldBounds(true);
  this.ball2.setVelocityX(300);
  this.ball2.setVelocityY(300);

  this.ball3 = this.physics.add.sprite(400, 200, 'saturn');
  this.ball3.body.allowGravity = false;
  this.ball3.setBounce(1);
  this.ball3.setCollideWorldBounds(true);
  this.ball3.setVelocityX(300);
  this.ball3.setVelocityY(300);

  this.physics.add.collider(this.players, this.ball, function (player, ball) {
    hitVolleyball(player, ball, this.ball2, this.ball3);
  });

  this.physics.add.collider(this.players, this.ball2, function (player, ball2) {
    hitVolleyball(player, ball2, this.ball, this.ball3);
  });

  this.physics.add.collider(this.players, this.ball3, function (player, ball3) {
    hitVolleyball(player, ball3, this.ball, this.ball2);
  });

  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('cat', { start: 0, end: 1 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'look_right',
    frames: [{ key: 'cat', frame: 2 }],
    frameRate: 20
  });

  this.anims.create({
    key: 'look_left',
    frames: [{ key: 'cat', frame: 1 }],
    frameRate: 20
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('cat', { start: 2, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  //adding balls to a group
  this.balls.add(this.ball)
  this.balls.add(this.ball2)
  this.balls.add(this.ball3)

  //socket connection established
  io.on('connection', function (socket) {
    console.log('a user connected');
    
    // create a new player and add it to our players object
    players[socket.id] = {
      x: Math.floor(Math.random() * 700) + 50,
      y: 500,
      playerId: socket.id,
      status: 'alive',
      input: {
        left: false,
        right: false,
        up: false
      }
    };
    
    // add player to server
    addPlayer(self, players[socket.id]);

    // send the players object to the new player
    socket.emit('currentPlayers', players);

    // update all other players of the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);


    socket.on('disconnect', function () {
      console.log('user disconnected');
      // remove player from server
      removePlayer(self, socket.id);
      // remove this player from our players object
      delete players[socket.id];
      // emit a message to all players to remove this player
      io.emit('disconnect', socket.id);
    });

    // when a player moves, update the player data
    socket.on('playerInput', function (inputData) {
      handlePlayerInput(self, socket.id, inputData);
    });
  });

  //add colliders
  this.physics.add.collider(this.players, this.platforms);
  this.physics.add.collider(this.players, this.players);
  this.physics.add.collider(this.ball, this.platforms);
  this.physics.add.collider(this.ball, this.players);
  this.physics.add.collider(this.ball2, this.platforms);
  this.physics.add.collider(this.ball2, this.players);
  this.physics.add.collider(this.ball3, this.platforms);
  this.physics.add.collider(this.ball3, this.players);
  this.physics.add.collider(this.ball, this.ball2);
  this.physics.add.collider(this.ball, this.ball3);
  this.physics.add.collider(this.ball2, this.ball3);
}

function update() {

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
  io.emit('playerUpdates', players);

  var ball_x = this.ball.x;
  var ball_y = this.ball.y;
  var ball2_x = this.ball2.x;
  var ball2_y = this.ball2.y;
  var ball3_x = this.ball3.x;
  var ball3_y = this.ball3.y;

  //emit ball positions
  io.emit('ballUpdates', {ball_x,ball_y})
  io.emit('ballUpdates2', {ball2_x,ball2_y})
  io.emit('ballUpdates3', {ball3_x,ball3_y})

}

//pass data into player function
function handlePlayerInput(self, playerId, input, animationKey) {
  self.players.getChildren().forEach((player) => {
    if (playerId === player.playerId) {
      players[player.playerId].input = input;
      players[player.playerId].animationKey = animationKey;
    }
  });
}

//create sprite for player
function addPlayer(self, playerInfo) {
  const player = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'cat');

  // Set initial animation state
  player.playerId = playerInfo.playerId;
  self.players.add(player);
  player.setBounce(0.2);
  player.setScale(0.15, 0.15);  
  player.setCollideWorldBounds(true);

}


//delete sprite for player
function removePlayer(self, playerId) {
  self.players.getChildren().forEach((player) => {
    if (playerId === player.playerId) {
      player.destroy();
    }
  });
}

function hitVolleyball(player, ball, ball2, ball3) {
  if (ball) {
    player.x = 2000;
    player.y = 2000;
    player.setVisible(false);

    ball.setVelocityY(-600);
    if (ball.x < player.x) {
      ball.setVelocityX(-300);
    } else {
      ball.setVelocityX(300);
    }
  }

  if (ball2) {
    player.x = 2000;
    player.y = 2000;
    player.setVisible(false);

    ball2.setVelocityY(-600);
    if (ball2.x < player.x) {
      ball2.setVelocityX(-300);
    } else {
      ball2.setVelocityX(300);
    }
  }

  if (ball3) {
    player.x = 2000;
    player.y = 2000;
    player.setVisible(false);
    
    ball3.setVelocityY(-600);
    if (ball3.x < player.x) {
      ball3.setVelocityX(-300);
    } else {
      ball3.setVelocityX(300);
    }
  }

  players[player.playerId].status = 'eliminated';
  checkForWinner();
}

function checkForWinner() {
  const alivePlayers = Object.values(players).filter(p => p.status === 'alive');
  if (alivePlayers.length === 1) {
    const winnerId = alivePlayers[0].playerId;
    io.emit('gameOver', winnerId); // Notify all clients about the winner
  }
}

const game = new Phaser.Game(config);
window.gameLoaded();
