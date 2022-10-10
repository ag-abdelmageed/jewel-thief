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
var moveTimer = 150;
var lastPosx = 0;
var lastPosy = 0;

var game = new Phaser.Game(config);

function preload() {
  this.load.image("checkerboard", "assets/checkerboard.png");
  this.load.image("ground", "assets/platform.png");
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
  platforms.create(400, 568, "ground").setScale(2).refreshBody();

  //  Now let's create some ledges
  platforms.create(600, 400, "ground");
  platforms.create(50, 250, "ground");
  platforms.create(750, 220, "ground");

  // The player and its settings
  player = this.physics.add.sprite(120, 500, "dude");

  //  Player physics properties. Give the little guy a slight bounce.
  //player.setBounce(0.2);
  player.setCollideWorldBounds(true);

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

  //  Collide the player and the stars with the platforms
  //FIX THIS
  this.physics.add.collider(player, platforms, function (){
    if (lastPosy != null) {
      player.y = lastPosy;
    }
    if (lastPosx != null){
      player.x = lastPosx;
    }
    lastPosx = player.x;
    lastPosy = player.y;
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

  if (this.input.keyboard.checkDown(cursors.left, moveTimer)) {
    lastPosx = player.x;
    lastPosy = player.y;
    player.x -= tileSize;
    player.anims.play("left", true);
  } 
  else if (this.input.keyboard.checkDown(cursors.right, moveTimer)) {
    lastPosx = player.x;
    lastPosy = player.y;
    player.x += tileSize;
    player.anims.play("right", true);
  }

  if (this.input.keyboard.checkDown(cursors.up, moveTimer)) {
    lastPosy = player.y;
    lastPosx = player.x;;
    player.y -= tileSize;
  } 
  else if (this.input.keyboard.checkDown(cursors.down, moveTimer)) {
    lastPosy = player.y;
    lastPosx = player.x;
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

  function hitGuard(player, guard) {
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play("turn");

    gameOver = true;
  }
}
