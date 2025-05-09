// Get the canvas and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Player position
let playerX = 275;
let playerY = 300;

// Ball position
let ballX = playerX;
let ballY = playerY - 20;
let ballSpeed = 0;
let ballMoving = false;

// Draw the game scene
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw soccer field
    ctx.fillStyle = "green"; // Green field
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw player (circle)
    ctx.fillStyle = "orange"; // Orange player
    ctx.beginPath();
    ctx.arc(playerX, playerY, 20, 0, Math.PI * 2);
    ctx.fill();

    // Draw ball
    ctx.fillStyle = "white"; // White ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "black"; // Black outline
    ctx.stroke();
}

// Update ball movement
function updateBall() {
    if (ballMoving) {
        ballY -= ballSpeed; // Move ball upwards
        if (ballY < 50) { //the ball  Stop when reaching the top
            ballMoving = false;
            ballY = playerY - 20;
            ballX = playerX;
        }
    }
}

// this will Handle the players movement and shooting
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" && playerX > 50) {
        playerX -= 10;
        if (!ballMoving) ballX -= 10;
    } else if (event.key === "ArrowRight" && playerX < 550) {
        playerX += 10;
        if (!ballMoving) ballX += 10;
    } else if (event.key === " ") { // Spacebar to shoot
        if (!ballMoving) {
            ballMoving = true;
            ballSpeed = 5;
        }
    }
});

// Game loop
function gameLoop() {
    updateBall();
    drawGame();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();

