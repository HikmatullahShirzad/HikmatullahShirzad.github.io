const player1 = document.getElementById('player1');
const player2 = document.getElementById('player2');
const ball = document.getElementById('ball');
const scoreLeft = document.getElementById('score-left');
const scoreRight = document.getElementById('score-right');

const fieldWidth = 700, fieldHeight = 380;
const playerSize = 44, ballSize = 32;
let player1X = 180, player1Y = 170, player2X = 480, player2Y = 170;
let ballX = 334, ballY = 174;
let scoreL = 0, scoreR = 0;
let ballVX = 0, ballVY = 0;
let keys = {};

function draw() {
  // Pseudo-3D: For depth, scale Y and add a vertical offset for "height"
  const y3d = y => y * 0.92 + 22;

  player1.style.left = player1X + 'px';
  player1.style.top = y3d(player1Y) + 'px';
  player1.style.zIndex = Math.floor(player1Y);

  player2.style.left = player2X + 'px';
  player2.style.top = y3d(player2Y) + 'px';
  player2.style.zIndex = Math.floor(player2Y);

  ball.style.left = ballX + 'px';
  ball.style.top = y3d(ballY) + 'px';
  ball.style.zIndex = Math.floor(ballY) + 2;
}

function update() {
  // Player 1
  if (keys['ArrowUp'] && player1Y > 0) player1Y -= 4;
  if (keys['ArrowDown'] && player1Y < fieldHeight - playerSize) player1Y += 4;
  if (keys['ArrowLeft'] && player1X > 0) player1X -= 4;
  if (keys['ArrowRight'] && player1X < fieldWidth - playerSize) player1X += 4;

  // Player 2
  if ((keys['w'] || keys['W']) && player2Y > 0) player2Y -= 4;
  if ((keys['s'] || keys['S']) && player2Y < fieldHeight - playerSize) player2Y += 4;
  if ((keys['a'] || keys['A']) && player2X > 0) player2X -= 4;
  if ((keys['d'] || keys['D']) && player2X < fieldWidth - playerSize) player2X += 4;

  // Ball movement
  ballX += ballVX;
  ballY += ballVY;
  ballVX *= 0.97;
  ballVY *= 0.97;

  // Ball collision with walls
  if (ballY <= 0) { ballY = 0; ballVY *= -0.7; }
  if (ballY >= fieldHeight - ballSize) { ballY = fieldHeight - ballSize; ballVY *= -0.7; }
  if (ballX <= 0) { // left goal
    if (ballY + ballSize / 2 > 135 && ballY + ballSize / 2 < 245) {
      scoreR++; updateScore(); resetPositions();
    } else {
      ballX = 0; ballVX *= -0.7;
    }
  }
  if (ballX >= fieldWidth - ballSize) { // right goal
    if (ballY + ballSize / 2 > 135 && ballY + ballSize / 2 < 245) {
      scoreL++; updateScore(); resetPositions();
    } else {
      ballX = fieldWidth - ballSize; ballVX *= -0.7;
    }
  }

  // Player-ball collisions
  [ [player1X, player1Y], [player2X, player2Y] ].forEach(([px,py], idx) => {
    let dx = (px + playerSize/2) - (ballX + ballSize/2);
    let dy = (py + playerSize/2) - (ballY + ballSize/2);
    let dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < (playerSize/2 + ballSize/2)) {
      let angle = Math.atan2(dy, dx);
      ballVX = -Math.cos(angle) * 7;
      ballVY = -Math.sin(angle) * 7;
      let overlap = (playerSize/2 + ballSize/2) - dist;
      ballX += Math.cos(angle) * overlap;
      ballY += Math.sin(angle) * overlap;
    }
  });

  // Prevent players from overlapping
  let dxp = (player1X + playerSize/2) - (player2X + playerSize/2);
  let dyp = (player1Y + playerSize/2) - (player2Y + playerSize/2);
  let distp = Math.sqrt(dxp * dxp + dyp * dyp);
  if (distp < playerSize) {
    let angle = Math.atan2(dyp, dxp);
    let overlap = playerSize - distp;
    player1X += Math.cos(angle) * (overlap / 2);
    player1Y += Math.sin(angle) * (overlap / 2);
    player2X -= Math.cos(angle) * (overlap / 2);
    player2Y -= Math.sin(angle) * (overlap / 2);
  }

  draw();
  requestAnimationFrame(update);
}

function updateScore() {
  scoreLeft.textContent = scoreL;
  scoreRight.textContent = scoreR;
}

function resetPositions() {
  player1X = 180; player1Y = 170;
  player2X = 480; player2Y = 170;
  ballX = 334; ballY = 174;
  ballVX = 0; ballVY = 0;
}

document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

resetPositions();
draw();
update();
