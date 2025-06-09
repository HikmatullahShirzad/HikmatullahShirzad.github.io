// Get the canvas element from the page and set up drawing context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Game objects and variables ---

// Paddle (the blue rectangle you move)
let paddle = {
    x: 210,           // horizontal position (from the left)
    y: 370,           // vertical position (from the top, near bottom)
    width: 80,        // paddle width
    height: 15,       // paddle height
    speed: 5,         // how fast it moves when you press a key
    dx: 0             // current horizontal movement (0 = stopped)
};

// Ball (the green circle that bounces)
let ball = {
    x: 250,           // horizontal position (center of the ball)
    y: 200,           // vertical position
    radius: 15,       // how big the ball is (radius)
    dx: 3,            // how much the ball moves left/right each frame
    dy: 3             // how much the ball moves up/down each frame
};

// Triangle (the red bonus shape that gives extra points)
let triangle = {
    x: Math.random() * 440 + 30,   // random horizontal spot (keeps it on screen)
    y: Math.random() * 200 + 50,   // random vertical spot (keeps it near top)
    size: 30,                      // size of the triangle
    active: true                   // is the bonus available?
};

let score = 0;                         // player's current score
let highScore = 0;                     // highest score ever reached in this session
if (localStorage.getItem("highScore")) {
    highScore = parseInt(localStorage.getItem("highScore"));
}
let gameOver = false;                  // is the game over?

// --- Scoreboard display function ---
function updateScoreboard() {
    // Show both current score and the best score so far
    document.getElementById('score').innerHTML =
      `Score: ${score} <span style="color:#ffa000;margin-left:16px;">| High Score: ${highScore}</span>`;
}

// --- Drawing functions ---

// Draw the blue paddle (rectangle)
function drawPaddle() {
    ctx.fillStyle = '#1976d2';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// Draw the green ball (circle)
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#43a047';
    ctx.fill();
    ctx.closePath();
}

// Draw the red triangle (bonus shape)
// Simply three points: top, bottom left, bottom right
// i used goodle for some help
function drawTriangle() {
    if (triangle.active) {
        ctx.beginPath();
        ctx.moveTo(triangle.x, triangle.y); // Top corner
        ctx.lineTo(triangle.x - triangle.size / 2, triangle.y + triangle.size); // Bottom left corner
        ctx.lineTo(triangle.x + triangle.size / 2, triangle.y + triangle.size); // Bottom right corner
        ctx.closePath();
        ctx.fillStyle = "#d32f2f";
        ctx.fill();
    }
}

// Draw everything onto the canvas, including Game Over message if needed
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // wipe the screen
    drawPaddle();
    drawBall();
    drawTriangle();

    // If the game is over, show the "Game Over" message
    if (gameOver) {
        ctx.font = "30px Arial";
        ctx.fillStyle = "#d32f2f";
        ctx.fillText("Game Over!", 170, 180);
        ctx.font = "18px Arial";
        ctx.fillStyle = "#0288d1";
        ctx.fillText("Press Space to Restart", 160, 220);
    }
}

// --- Game mechanics ---

// Move the paddle left or right, but keep it on the screen
function movePaddle() {
    paddle.x += paddle.dx;
    if (paddle.x < 0) paddle.x = 0; // don't go off left edge
    if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width; // don't go off right edge
}

// Move the ball and handle bounces, scoring, and game over
function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Bounce off the left and right walls
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx *= -1;
    }
    // Bounce off the top wall
    if (ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }

    // Bounce off the paddle (if ball hits the paddle, bounce up and add to score)
    if (
        ball.y + ball.radius > paddle.y &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width
    ) {
        ball.dy *= -1; // bounce up
        ball.y = paddle.y - ball.radius; // keep the ball above the paddle
        score++; // add 1 point
        // Update high score if this is your best run
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
        }
        updateScoreboard();
    }

    // If the ball goes below the bottom of the screen, the game is over
    if (ball.y - ball.radius > canvas.height) {
        gameOver = true;
        score = 0; // Optionally reset score here, or keep it until restart
        updateScoreboard();
    }

    // If the ball touches the triangle bonus and it's still active, add bonus points!
    // We check if the ball's center is within the triangle's 'bounding box'
    if (
        triangle.active &&
        ball.x > triangle.x - triangle.size / 2 &&
        ball.x < triangle.x + triangle.size / 2 &&
        ball.y - ball.radius < triangle.y + triangle.size &&
        ball.y + ball.radius > triangle.y
    ) {
        score += 3; // bonus points!
        triangle.active = false; // remove the bonus after you collect it
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
        }
        updateScoreboard();
    }
}

// --- Keyboard controls ---

// When a key is pressed, move the paddle or restart if needed
document.addEventListener('keydown', function(e) {
    if (e.code === 'ArrowLeft') {
        paddle.dx = -paddle.speed; // move left
    } else if (e.code === 'ArrowRight') {
        paddle.dx = paddle.speed; // move right
    } else if (e.code === 'Space' && gameOver) {
        restartGame(); // restart if game is over
    }
});

// When the key is released, stop moving the paddle
document.addEventListener('keyup', function(e) {
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        paddle.dx = 0;
    }
});

// --- Restart everything to play again ---

function restartGame() {
    // Put the ball back in the middle of the screen at the top
    ball.x = 250;
    ball.y = 200;

    // Make the ball start moving, randomly either to the left or right
    ball.dx = 3 * (Math.random() > 0.5 ? 1 : -1);

    // Always start with the ball moving downwards
    ball.dy = 3;

    // Move the paddle back to its starting spot near the bottom center
    paddle.x = 210;

    // Reset your score to zero for the new game
    score = 0;

    // Give the triangle a new random position somewhere near the top
    triangle.x = Math.random() * 440 + 30;
    triangle.y = Math.random() * 200 + 50;

    // Make the triangle active again, so you can collect it for bonus points
    triangle.active = true;

    // The game is no longer over – you're starting fresh!
    gameOver = false;

    // Update the scoreboard so it shows the new (reset) score
    updateScoreboard();
}

// --- Main game loop: update positions and redraw everything ---
function update() {
    if (!gameOver) {
        movePaddle();
        moveBall();
    }
    draw();
    requestAnimationFrame(update); // repeat this function for the next frame
}

updateScoreboard(); // show scores at the top at the start
update(); // Start the game!



