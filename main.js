var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var player;
var jewels;
var guards;
var platforms;
var cursors;
var gameOver = false;
var tileSize = 80;
var moveIncrement = 10;
var moveTimer = 150;
var lastPosx = 0;
var lastPosy = 0;
var screenWidth = 800;
var screenHeight = 600;
var pauseKeyboard = false;

var game = new Phaser.Game(config);

function preload() {
  this.load.image("checkerboard", "assets/checkerboard.png");
  this.load.image("ground", "assets/Brickwall.png");
  this.load.image("jewel", "assets/jewel.png");
  this.load.image("guard", "assets/bomb.png");
  this.load.spritesheet("dude", "assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
}

function create() {
  //  A simple background for our game
  background = this.add.image(400, 300, "checkerboard");
  background.setScale(2)  

  //  The platforms group contains the ground and the 2 ledges we can jump on
  platforms = this.physics.add.staticGroup();

  //  Here we create the ground.
  //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
  platforms.create(400, 568, "ground").setScale(0.4).refreshBody();

  //  Now let's create some ledges

  platforms.create(600, 400, "ground").setScale(0.4).refreshBody();
  platforms.create(50, 250, "ground").setScale(0.4).refreshBody();
  platforms.create(750, 220, "ground").setScale(0.4).refreshBody();

  // The player and its settings
  player = this.physics.add.sprite(120, 500, "dude");

  //  Player physics properties. Give the little guy a slight bounce.
  //player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  player.body.onWorldBounds = true;

  //  Our player animations, turning, walking left and walking right.
  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20,
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });

  //  Input Events
  cursors = this.input.keyboard.createCursorKeys();

  jewel = this.physics.add.sprite(100, 100, "jewel");
  jewel.setScale(0.1);

  guards = this.physics.add.group();

  //  stops player from going through platforms
  this.physics.add.collider(player, platforms, function (){
    player.y = lastPosy;
    player.x = lastPosx;
  });
  this.physics.add.collider(guards, platforms); 

  //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
  this.physics.add.overlap(player, jewel, collectJewel, null, this);

  //this.physics.add.collider(player, guards, hitGuard, null, this);

  //Collision event
}

function update() {
  if (gameOver) {
    return;
  }

  //Player movement
  if (pauseKeyboard == false){
    if (this.input.keyboard.checkDown(cursors.left, moveTimer)) {
      if (player.x - tileSize >= 0){
        move("left")
      }
    } 
    else if (this.input.keyboard.checkDown(cursors.right, moveTimer)) {
      if (player.x + tileSize <= screenWidth){  
        move("right")
      }
    }
    if (this.input.keyboard.checkDown(cursors.up, moveTimer)) {
      if (player.y - tileSize >= 0){
        move("up")
      }
    } 
    else if (this.input.keyboard.checkDown(cursors.down, moveTimer)) {
      if (player.y + tileSize <= screenHeight) {
        move("down")
      }
    } 
  }
}

function animate(dir){
  if (dir == "up"){
    player.y -= tileSize;
  }
}

function move(dir){
  counter = 0;
  if (dir == "up"){
    pauseKeyboard = true;
    lastPosx = player.x;
    lastPosy = player.y;
    //timedEvent = this.time.delayedCall(3000, animate, [], game);
    animate(dir);
    pauseKeyboard = false;
  }
  else if (dir == "left"){
    lastPosx = player.x;
    lastPosy = player.y;
    player.x -= tileSize;
    player.anims.play("left", true);
  }
  else if (dir == "right"){
    lastPosx = player.x;
    lastPosy = player.y;
    player.x += tileSize;
    player.anims.play("right", true);
  }
  else if (dir == "down"){
    lastPosx = player.x;
    lastPosy = player.y;
    player.y += tileSize;
  }
}

function collectJewel(player, jewel) {
  jewel.disableBody(true, true);
    //TODO RUN GAMEOVER CODE
    
    /*spawn guard code*/
    var guard = guards.create(20, 16, "guard");
    guard = guards.create(200, 500, "guard");
    guard.setBounce(1);
    guard.setCollideWorldBounds(true);
   // guard.setVelocity(Phaser.Math.Between(-200, 200), 20);
    guard.allowGravity = false;
}

  function hitGuard(player, guard) {
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play("turn");

    gameOver = true;
  }

