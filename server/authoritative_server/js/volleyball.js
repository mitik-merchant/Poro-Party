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

  this.load.spritesheet('cat', 'assets/volleyball/Cat_1.png', { frameWidth: 263, frameHeight: 192 });  
  //load background
  this.load.image('sky', 'assets/volleyball/sky.png');
  this.load.image('net', 'assets/volleyball/platform2.png');
  this.load.image('ball', 'assets/volleyball/volleyball.png');
  this.load.image('ground', 'assets/volleyball/platform.png');
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
  
  this.ball = this.physics.add.sprite(400, 200, 'ball');
  this.ball.setBounce(1);
  this.ball.setCollideWorldBounds(true);
  this.ball.setVelocityX(100);

  this.balls.add(this.ball)
  //socket connection established
  io.on('connection', function (socket) {
    console.log('a user connected');
    
    // create a new player and add it to our players object
    players[socket.id] = {
      x: Math.floor(Math.random() * 700) + 50,
      y: 500,
      playerId: socket.id,
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

}

function update() {

  const speed = 250
  //constantly emit each player's position
  this.players.getChildren().forEach((player) => {
    const input = players[player.playerId].input;

    if (input.left) {
      player.setVelocityX(-speed);
    } else if (input.right) {
      player.setVelocityX(speed);
    } else {
      player.setVelocityX(0);
    }
    if (input.up) {
      player.setVelocityY(-330);
    } else {
      player.setVelocityY(0);
    }
    players[player.playerId].x = player.x;
    players[player.playerId].y = player.y;

  });
  //emit player positions
  io.emit('playerUpdates', players);

  ball_x = this.ball.x;
  ball_y = this.ball.y;

  //emit ball positions
  io.emit('ballUpdates', {ball_x,ball_y})

}

//pass data into player function
function handlePlayerInput(self, playerId, input) {
  self.players.getChildren().forEach((player) => {
    if (playerId === player.playerId) {
      players[player.playerId].input = input;
    }
  });
}

//create sprite for player
function addPlayer(self, playerInfo) {
  const player = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'cat');
  player.playerId = playerInfo.playerId;
  self.players.add(player);
  player.setBounce(0.2);
  player.setScale(0.2, 0.2);  
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

function hitVolleyball(player, ball) {
  ball.setVelocityY(-400);
  if (ball.x < player.x) {
      ball.setVelocityX(-200);
  } else {
      ball.setVelocityX(200);
  }
}

const game = new Phaser.Game(config);
window.gameLoaded();
