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

var game = new Phaser.Game(config);

function preload() {
  this.load.image("checkerboard", "assets/checkerboard.png");
  this.load.image("blueT", "assets/tileBlue.png");
  this.load.image("whiteT", "assets/tileWhite.png");
  this.load.image("wallV", "assets/wallV.png");
  this.load.image("wallH", "assets/wallH.png");
  this.load.image("jewel", "assets/jewel.png");
  this.load.image("guard", "assets/bomb.png");
  this.load.spritesheet("dude", "assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
}

function create() {
  // GENERATE CHECKERBOARD BACKGROUND ---------------------------------------------------
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
    for (let w = TILE_WIDTH / 2; w < 800; w += TILE_WIDTH + tileAdjustment) {
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
  // wallsV.create(60, CENTER_VERTICAL, "wallV");
  // wallsV.create(745, CENTER_VERTICAL, "wallV");

  // Generate the horizontal maze walls
  for (let i = 60; i < 800; i += 120) {
    wallsH.create(i, CENTER_VERTICAL - 80, "wallH");
    wallsH.create(i, CENTER_VERTICAL + 80, "wallH");
  }

  // The player and its settings
  player = this.physics.add.sprite(101, CENTER_VERTICAL - 20, "dude");

  //  Player physics properties. Give the little guy a slight bounce.
  player.setBounce(0.2);
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

  jewel = this.physics.add.sprite(650, CENTER_VERTICAL, "jewel");
  jewel.setScale(0.1);

  guards = this.physics.add.group();

  //  Collide the player with the vertical walls
  this.physics.add.collider(player, wallsV);
  this.physics.add.collider(guards, wallsV);

  // Collide the player with the horizontal walls
  this.physics.add.collider(player, wallsH);
  this.physics.add.collider(guards, wallsH);

  //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
  this.physics.add.overlap(player, jewel, collectJewel, null, this);

  this.physics.add.collider(player, guards, hitGuard, null, this);
}

function update() {
  if (gameOver) {
    return;
  }

  // What X direction is player moving
  if (cursors.left.isDown) {
    // Left, so set velocity to left (negative)
    player.setVelocityX(-160);

    // Adjust animation to left
    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    // Right, so set velocity to right (positive)
    player.setVelocityX(160);

    // Adjust animation to right
    player.anims.play("right", true);
  } else {
    // None, so set velocity to still in X (0)
    player.setVelocityX(0);

    // Adjust animation to no horizontal movement
    player.anims.play("turn");
  }

  // What Y direction is player moving
  if (cursors.up.isDown) {
    // Up, so set velocity to up (negative)
    player.setVelocityY(-160);

    // Adjust animation to up
  } else if (cursors.down.isDown) {
    // Down, so set velocity to down (positive)
    player.setVelocityY(160);

    // Adjust animation to down
  } else {
    // None, so set velocity to still in Y (0)
    player.setVelocityY(0);

    // Adjust animation to no vertical movement (maybe?)
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
