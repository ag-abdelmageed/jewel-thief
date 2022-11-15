const CENTER_HORIZONTAL = 400;
const CENTER_VERTICAL = 300;
let TILE_WIDTH = 40;
let TILE_HEIGHT = 40;

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
    create: create1,
    update: update,
  },
};

var player;
var jewels;
var guards;
var cursors;
var gameOver = false;
var tileSize = TILE_WIDTH;
var moveIncrement = 10;
var moveTimer = 150;
var lastPosx = 0;
var lastPosy = 0;
var screenWidth = CENTER_HORIZONTAL*2;
var screenHeight = CENTER_VERTICAL*2;
var pauseKeyboard = false;
var startincX;
var srartincY;
var currentTime;
var previousTime;

var game = new Phaser.Game(config);

function preload() {
  this.load.image("checkerboard", "assets/checkerboard.png");
  this.load.image("blueT", "assets/tileBlue.png");
  this.load.image("whiteT", "assets/tileWhite.png");
  this.load.image("wallV", "assets/wallV.png");
  this.load.image("wallH", "assets/wallH.png");
  this.load.image("jewel", "assets/jewel.png");
  this.load.image("guard", "assets/bomb.png");
  this.load.spritesheet("dude", "assets/RobberGuySpriteV2.png", {
    frameWidth: 59, //32
    frameHeight: 96, //48
  });
}

document.getElementById("level-select").addEventListener("change", (event) => {
  switchLevel(event.target.value);
});

function switchLevel(level) {
  game.destroy(true);
  switch (level) {
    case "1":
      config.scene.create = create1;
      game = new Phaser.Game(config);
      break;
    case "2":
      config.scene.create = create1;
      game = new Phaser.Game(config);
      break;
    case "3":
      config.scene.create = create3;
      game = new Phaser.Game(config);
      break;
    case "4":
      config.scene.create = create1;
      game = new Phaser.Game(config);
      break;
    case "5":
      config.scene.create = create1;
      game = new Phaser.Game(config);
      break;
    case "6":
      config.scene.create = create1;
      game = new Phaser.Game(config);
      break;
  }
}

function create1() {
  /// GENERATE CHECKERBOARD BACKGROUND ---------------------------------------------------
  let whiteTile = false;
  const bottom = 380;
  const tileScale = 0.99;
  const tileAdjustment = 0 * tileScale;

  // Loop through the columns
  for (
    let hl = CENTER_VERTICAL, hu = CENTER_VERTICAL;
    hl < bottom;
    hl += TILE_HEIGHT + tileAdjustment, hu -= TILE_HEIGHT + tileAdjustment
  ) {
    // Loop through the row
    for (
      let w = TILE_WIDTH / 2;
      w < config.width;
      w += TILE_WIDTH + tileAdjustment
    ) {
      // Is the first row being generated?
      if (hl === CENTER_VERTICAL) {
        // White or blue tile?
        if (whiteTile) {
          this.add.image(w, hl, "whiteT").setScale(tileScale);
        } else {
          this.add.image(w, hl, "blueT").setScale(tileScale);
        }
        // Switch colors
        whiteTile = !whiteTile;
      } else {
        // White or blue tile?
        if (whiteTile) {
          this.add.image(w, hu, "whiteT").setScale(tileScale);
          this.add.image(w, hl, "whiteT").setScale(tileScale);
        } else {
          this.add.image(w, hu, "blueT").setScale(tileScale);
          this.add.image(w, hl, "blueT").setScale(tileScale);
        }
        // Switch colors
        whiteTile = !whiteTile;
      }
    }
    // Alternate orders for row
    whiteTile = !whiteTile;
  }

  // GENERATE WALLS ---------------------------------------------------------------------
  // Create the horizontal walls and the vertical walls
  wallsH = this.physics.add.staticGroup();
  wallsV = this.physics.add.staticGroup();

  // Generate the vertical maze walls
  wallsV.create(20, CENTER_VERTICAL, "wallV");
  wallsV.create(780, CENTER_VERTICAL, "wallV");
  

  // Generate the horizontal maze walls
  c=0;
  for (let i = 60; i < 800; i += 120) {
    wall = wallsH.create(i, CENTER_VERTICAL - 80, "wallH");
    wall.name = "wallH"+c;
    c++;
  }
  c=1
  for (let i = 60; i < 800; i += 120) {
    wallsH.create(i, CENTER_VERTICAL + 80, "wallH");
    wall.name = "wallH"+(c);
    c++
  }
  

  // The player and its settings
  player = this.physics.add
    .sprite(20 + 6 * 40, CENTER_VERTICAL - 12, "dude")
    .setScale(0.6);

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

  jewel = this.physics.add.sprite(
    800 - 20 - 6 * 40,
    CENTER_VERTICAL - 10,
    "jewel"
  );
  jewel.setScale(0.125);

  guards = this.physics.add.group();

  //  stops player from going through platforms
  /*this.physics.add.collider(player, wallsH, function () {
    player.y = lastPosy;
    player.x = lastPosx;
  });
  this.physics.add.collider(player, wallsV, function () {
    player.y = lastPosy;
    player.x = lastPosx;
  });*/
  this.physics.add.collider(guards, wallsH);

  //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
  this.physics.add.overlap(player, jewel, collectJewel, null, this);

  //this.physics.add.collider(player, guards, hitGuard, null, this);

  //Collision event
}

function create3() {
  /// GENERATE CHECKERBOARD BACKGROUND ---------------------------------------------------
  let whiteTile = false;
  const bottom = 600;
  const tileScale = 0.99;
  const tileAdjustment = 0 * tileScale;

  // Loop through the columns
  for (
    let hl = CENTER_VERTICAL, hu = CENTER_VERTICAL;
    hl < bottom;
    hl += TILE_HEIGHT + tileAdjustment, hu -= TILE_HEIGHT + tileAdjustment
  ) {
    // Loop through the row
    for (
      let w = TILE_WIDTH / 2;
      w < config.width;
      w += TILE_WIDTH + tileAdjustment
    ) {
      // Is the first row being generated?
      if (hl === CENTER_VERTICAL) {
        // White or blue tile?
        if (whiteTile) {
          this.add.image(w, hl, "whiteT").setScale(tileScale);
        } else {
          this.add.image(w, hl, "blueT").setScale(tileScale);
        }
        // Switch colors
        whiteTile = !whiteTile;
      } else {
        // White or blue tile?
        if (whiteTile) {
          this.add.image(w, hu, "whiteT").setScale(tileScale);
          this.add.image(w, hl, "whiteT").setScale(tileScale);
        } else {
          this.add.image(w, hu, "blueT").setScale(tileScale);
          this.add.image(w, hl, "blueT").setScale(tileScale);
        }
        // Switch colors
        whiteTile = !whiteTile;
      }
    }
    // Alternate orders for row
    whiteTile = !whiteTile;
  }

  // GENERATE WALLS ---------------------------------------------------------------------
  // Create the horizontal walls and the vertical walls
  wallsH = this.physics.add.staticGroup();
  wallsV = this.physics.add.staticGroup();

  // Generate the vertical maze walls
  for (let i = 60; i < 800; i += 120) {
  wallsV.create(20, i, "wallV");
  wallsV.create(screenWidth-20, i, "wallV");
  }

  for (let i = 60; i < 800; i += 120) {
    wallsH.create(i, 20, "wallH");
    wallsH.create(i, screenHeight-20, "wallH");
    wallsH.create(i, 60, "wallH");
    wallsH.create(i, screenHeight-60, "wallH");
  }

  wallsH.create(40, 140, "wallH");

for(let i = 0; i < 5; ++i){
  wallsV.create(180+ 80* i, 100+ 80* i, "wallV");
  wallsV.create(100+80* i, 180+80* i, "wallV");
  wallsH.create(220+80* i, 140+80* i, "wallH");
  wallsH.create(140+80* i, 220+80* i, "wallH");
}

  // The player and its settings
  player = this.physics.add
    .sprite(60, 100, "dude")
    .setScale(0.2);

  //Player physics properties. Give the little guy a slight bounce.
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

  jewel = this.physics.add.sprite(
    800 - 20 - 6 * 40,
    CENTER_VERTICAL - 10,
    "jewel"
  );
  jewel.setScale(0.125);

  guards = this.physics.add.group();

  this.physics.add.collider(guards, platforms);

  //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
  this.physics.add.overlap(player, jewel, collectJewel, null, this);

  //this.physics.add.collider(player, guards, hitGuard, null, this);

  //Collision event
}

var moving = false;
function update() {
  if (gameOver) {
    return;
  }

  //Player movement
  var flag = false;
  if (pauseKeyboard == false){  
    if (this.input.keyboard.checkDown(cursors.left, moveTimer)) {
      if (player.x - tileSize >= 0){
        wallsV.getChildren().forEach(function (sprite) {
          if ((player.x - tileSize/2 <= (sprite.x)+sprite.width) && (player.x - tileSize/2 >= (sprite.x)-sprite.width)){
            flag = true;
          }
        });
        if (flag == false){
          moving = true;
          move("left")
        }
      }
    } 
    else if (this.input.keyboard.checkDown(cursors.right, moveTimer)) {
      if (player.x + tileSize <= screenWidth){  
        wallsV.getChildren().forEach(function (sprite) {
          if ((player.x + tileSize/2 <= (sprite.x)+sprite.width) && (player.x + tileSize/2 >= (sprite.x)-sprite.width)){
            flag = true;
          }
        });
        if (flag == false){
          moving = true;
          move("right")
        }
      }
    }
    if (this.input.keyboard.checkDown(cursors.up, moveTimer)) {
      if (player.y - tileSize >= 0){
        wallsH.getChildren().forEach(function (sprite) {
          if ((player.y - tileSize/2 <= (sprite.y)+sprite.height) && (player.y - tileSize/2 >= (sprite.y)-sprite.height)){
            flag = true;
          }
        });
        if (flag == false){
          moving = true;
          move("up")
        }
      }
    } 
    else if (this.input.keyboard.checkDown(cursors.down, moveTimer)) {
      if (player.y + tileSize <= screenHeight) {
        wallsH.getChildren().forEach(function (sprite) {
          if ((player.y + tileSize/2 <= (sprite.y)+sprite.height) && (player.y + tileSize/2 >= (sprite.y)-sprite.height)){
            flag = true;
          }
        });
        if (flag == false){
          moving = true;
          move("down") 
        }
      }
    } 

  }

}
  

//TODO GET THE MOVEMENT TO WORK
//it is not stopping which is an issue
function move(dir){
  counter = 0;
  previousTime = new Date();
  var prevSec = previousTime.getTime()
  while (counter < tileSize){
    currentTime = new Date();
    currentSec = currentTime.getTime()
    if (currentSec - prevSec >= 10){
      if (dir == "up"){
        //player.anims.play("up", true);
        player.y -=1
      }
      else if (dir == "down"){
        //player.anims.play("down", true);
        player.y +=1
      }
      else if (dir == "right"){
        //player.anims.play("right", true);
        //player.x += 1
        player.body.setVelocity(25, 0)
      }
      else if (dir == "left"){
        //player.anims.play("left", true);
        player.x -=1;
      }
      prevSec = currentSec;
      counter ++;
    }
  }
  moving = false;
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
