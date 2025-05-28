// the canvas and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Player position and aiming
let playerX = 275;
let playerY = 300;
let aimingAngle = 0; // degrees, 0 = straight up, range -60 to 60

// the ball position and its movement
let ballX = playerX;
let ballY = playerY - 20;
let ballSpeed = 0;
let ballMoving = false;
let ballVX = 0;
let ballVY = 0;

// Gthe goallies position
const goalkeeper = {
  x: 300,
  y: 120,
  width: 80,
  height: 20,
  speed: 3,
  direction: 1
};

// the state of the game
let shotsLeft = 8;
let goalsScored = 0;
let gameOver = false;

// drawing the games scene
function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // drawing soccer field
  ctx.fillStyle = "green"; // Green field
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // the post for the goal
  ctx.fillStyle = "white";
  ctx.fillRect(150, 50, 300, 10); // crossbar
  ctx.fillRect(150, 50, 10, 100); // left post
  ctx.fillRect(440, 50, 10, 100); // right post

  // drawing the  goallier
  ctx.fillStyle = "red";
  ctx.fillRect(goalkeeper.x - goalkeeper.width / 2, goalkeeper.y, goalkeeper.width, goalkeeper.height);

  // drawing the player
  ctx.fillStyle = "orange"; // Orange player
  ctx.beginPath();
  ctx.arc(playerX, playerY, 20, 0, Math.PI * 2);
  ctx.fill();

  // drawing the line for aiming
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(playerX, playerY);
  const rad = (aimingAngle * Math.PI) / 180;
  const aimLength = 50;
  ctx.lineTo(playerX + aimLength * Math.sin(rad), playerY - aimLength * Math.cos(rad));
  ctx.stroke();

  // drawing th eball and its position
  ctx.fillStyle = "white"; // White ball
  ctx.beginPath();
  ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "black"; // Black outline
  ctx.stroke();

  // drawing the scoreboard
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Goals: ${goalsScored}`, 10, 30);
  ctx.fillText(`Shots Left: ${shotsLeft}`, 10, 60);

  if (gameOver) {
    ctx.fillStyle = "yellow";
    ctx.font = "30px Arial";
    const message = goalsScored >= 5 ? "You Win!" : "You Lose!";
    ctx.fillText(message, canvas.width / 2 - 60, canvas.height / 2);
  }
}

// updating the goallies position
function updateGoalkeeper() {
  goalkeeper.x += goalkeeper.speed * goalkeeper.direction;
  if (goalkeeper.x + goalkeeper.width / 2 > 440 || goalkeeper.x - goalkeeper.width / 2 < 160) {
    goalkeeper.direction *= -1;
  }
}

// checking for collisions and the movement of the ball
function updateBall() {
  if (!ballMoving) return;

  ballX += ballVX;
  ballY += ballVY;

  // checking for collesions of th eball with the goallie
  if (
    ballY - 10 <= goalkeeper.y + goalkeeper.height &&
    ballY + 10 >= goalkeeper.y &&
    ballX + 10 >= goalkeeper.x - goalkeeper.width / 2 &&
    ballX - 10 <= goalkeeper.x + goalkeeper.width / 2
  ) {
    // what will happen if the shot is blocked by the goallie
    ballMoving = false;
    shotsLeft--;
    resetBall();
    checkGameOver();
    return;
  }

  // checking if the ball reached the goal line
  if (ballY <= 50) {
    if (ballX > 160 && ballX < 440) {
      // Goal scored
      goalsScored++;
    }
    ballMoving = false;
    shotsLeft--;
    resetBall();
    checkGameOver();
    return;
  }

  // what will happen if the ball gets out of the goal
  if (ballY < 0 || ballX < 0 || ballX > canvas.width) {
    ballMoving = false;
    shotsLeft--;
    resetBall();
    checkGameOver();
  }
}

// resetting the players position
function resetBall() {
  ballX = playerX;
  ballY = playerY - 20;
  ballVX = 0;
  ballVY = 0;
}

// checking if the game is over
function checkGameOver() {
  if (goalsScored >= 5) {
    gameOver = true;
  } else if (shotsLeft <= 0) {
    gameOver = true;
  }
}

// the controls for th emovemnt of the player
document.addEventListener("keydown", (event) => {
  if (gameOver) return;

  if (event.key === "ArrowLeft") {
    aimingAngle = Math.max(aimingAngle - 5, -60);
  } else if (event.key === "ArrowRight") {
    aimingAngle = Math.min(aimingAngle + 5, 60);
  } else if (event.key === " ") {
    if (!ballMoving && shotsLeft > 0) {
      ballMoving = true;
      const speed = 7;
      const rad = (aimingAngle * Math.PI) / 180;
      ballVX = speed * Math.sin(rad);
      ballVY = -speed * Math.cos(rad);
    }
  }
});

// Game loop
function gameLoop() {
  if (!gameOver) {
    updateGoalkeeper();
    updateBall();
  }
  drawGame();
  requestAnimationFrame(gameLoop);
}


resetBall();
gameLoop();
