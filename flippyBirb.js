//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34; //widht/height = 408/228 -> 17/12 ratio
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
// let birdImg;
let birdImgs = [];
let birdImgIndex = 0;
let bird = {
  x: birdX,
  y: birdY,
  width: birdWidth,
  height: birdHeight,
};

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 -> 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;
let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -1.5; //pipes moving spd
let velocityY = 0.71;
let gravity = 0.2;

let score = 0;
let timer = 1500; // units = ms

// let wingsound = new Audio("./sfx_wing.wav");
let hitsoud = new Audio("./sfx_hit.wav");
let bgm = new Audio("./comedy-fun-230281.mp3");
bgm.loop = true;

let gameOver = false;
window.onload = function () {
  board = document.getElementById("board");
  board.width = boardWidth;
  board.height = boardHeight;
  context = board.getContext("2d"); //use for drawing on the board

  //draw birb
  // context.fillStyle = "green";
  // context.fillRect(bird.x, bird.y, bird.width, bird.height);

  //load img
  // birdImg = new Image();
  // birdImg.src = "./flappybird0.png";
  // birdImg.onload = function () {
  //   context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
  // };

  for (let i = 0; i < 4; i++) {
    let birdImg = new Image();
    birdImg.src = `./flappybird${i}.png`;
    birdImgs.push(birdImg);
  }

  topPipeImg = new Image();
  topPipeImg.src = "./toppipe.png";

  bottomPipeImg = new Image();
  bottomPipeImg.src = "./bottompipe.png";

  requestAnimationFrame(update);

  setInterval(placePipes, timer);
  setInterval(animaBird, 100);
  document.addEventListener("keydown", moveBird);
  document.addEventListener("click", moveBird2);
};

function update() {
  requestAnimationFrame(update);
  if (gameOver) {
    return;
  }
  context.clearRect(0, 0, board.width, board.height);

  //bird
  velocityY += gravity;
  bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit it to top of the canvas(frame)
  // context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
  context.drawImage(
    birdImgs[birdImgIndex],
    bird.x,
    bird.y,
    bird.width,
    bird.height
  );
  birdImgIndex++;
  birdImgIndex %= birdImgs.length; //circle back to 0 in array

  if (bird.y > board.height) {
    gameOver = true;
  }

  //pipe
  for (let i = 0; i < pipeArray.length; i++) {
    let pipe = pipeArray[i];
    pipe.x += velocityX;
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      score += 0.5; // there are 2 points
      pipe.passed = true;
    }
    if ((score %= 10)) {
      timer - 100;
    }
    if (detecCollision(bird, pipe)) {
      hitsoud.play();
      gameOver = true;
    }
  }

  //clear pipes
  while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
    pipeArray.shift(); // remove first element
  }

  //score
  context.fillStyle = "black";
  context.font = "60px tiny5 ";
  context.fillText(score, 175, 50);
  if (gameOver) {
    context.fillText("GAME OVER", 30, 300);
    bgm.pause();
    bgm.currentTime = 0;
  }
}

function animaBird() {
  birdImgIndex++;
  birdImgIndex %= birdImgs.length; //circle back to 0 in array
}

function placePipes() {
  if (gameOver) {
    return;
  }
  //(0-1) * pipeHeight/2
  //0 -> -128 (pipeHeight/4)
  //1 -> -128 to -256 (pipeHeight/4 - pipeHeight/2) = -3/4 height

  let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
  let openSpace = board.height / 5;

  let topPipe = {
    img: topPipeImg,
    x: pipeX,
    y: randomPipeY,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };
  let botPipe = {
    img: bottomPipeImg,
    x: pipeX,
    y: randomPipeY + pipeHeight + openSpace,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };

  pipeArray.push(topPipe);
  pipeArray.push(botPipe);
}

function moveBird(e) {
  if (e.code == "Space" || e.code == "ArrowUp" || e.code == "Click") {
    bgm.play();
    //jump
    velocityY = -6;

    //restart game
    if (gameOver) {
      bird.y = bird.y;
      pipeArray = [];
      score = 0;
      gameOver = false;
    }
  }
}
function moveBird2(e) {
  bgm.play();
  //jump
  velocityY = -6;

  //restart game
  if (gameOver) {
    bird.y = bird.y;
    pipeArray = [];
    score = 0;
    gameOver = false;
  }
}

function detecCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
