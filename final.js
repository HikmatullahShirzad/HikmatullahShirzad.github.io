// === Main Menu and Game Variables ===
let gameMode = null; // "1v1" or "bot"
let botLevel = 1;    // 1-10 for bot difficulty
let inMenu = true;

// --- Sound Setup ---
const kickSound = new Audio('kick.mp3');
const goalSound = new Audio('goal.mp3');
kickSound.volume = 0.6;
goalSound.volume = 1.0;

// === Game Variables ===
const player1 = document.getElementById('player1');
const player2 = document.getElementById('player2');
const ball = document.getElementById('ball');
const scoreLeft = document.getElementById('score-left');
const scoreRight = document.getElementById('score-right');

const fieldWidth = 700, fieldHeight = 380;
const playerWidth = 44, playerHeight = 84, ballSize = 32;
let player1X = 180, player1Y = 150, player2X = 480, player2Y = 150;
let ballX = 334, ballY = 174;
let scoreL = 0, scoreR = 0;
let ballVX = 0, ballVY = 0;
let keys = {};

function setupMenu() {
  if (document.getElementById("game-menu")) return;

  const menu = document.createElement('div');
  menu.id = "game-menu";
  menu.style = `
    position:fixed; left:0; top:0; width:100vw; height:100vh; 
    background:#222d; display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:1000;
  `;

  menu.innerHTML = `
    <div style="background:#218c4a; border-radius:24px; padding:40px 60px; box-shadow:0 8px 40px #0008; text-align:center;">
      <h1 style="color:#fff; margin-bottom:32px;">Soccer Game</h1>
      <button id="btn-1v1" style="margin-bottom:18px; font-size:1.2em; padding:12px 50px; cursor:pointer;">1 vs 1 (Local)</button>
      <br>
      <div style="margin-bottom:8px; color:#fff; font-size:1.18em;">or play against a bot:</div>
      <div>
        ${[...Array(10)].map((_,i)=>`<button class="btn-bot" data-lv="${i+1}" style="margin:2px 2px; font-size:1em; padding:8px 12px; cursor:pointer;">Bot Lv.${i+1}</button>`).join("")}
      </div>
      <div style="color:#fff; font-size:0.95em; margin-top:18px;">Use Arrow keys (P1) and WASD (P2)</div>
    </div>
  `;
  document.body.appendChild(menu);

  document.getElementById("btn-1v1").onclick = start1v1;
  [...menu.querySelectorAll(".btn-bot")].forEach(btn => {
    btn.onclick = () => startBot(Number(btn.dataset.lv));
  });
}

function showMenu() {
  inMenu = true;
  document.getElementById('game-menu').style.display = 'flex';
  document.getElementById('game-container').style.display = 'none';
  if (document.getElementById('scoreboard')) document.getElementById('scoreboard').style.display = 'none';
  if (document.getElementById('infoText')) document.getElementById('infoText').style.display = 'none';
}

function hideMenu() {
  inMenu = false;
  document.getElementById('game-menu').style.display = 'none';
  document.getElementById('game-container').style.display = '';
  if (document.getElementById('scoreboard')) document.getElementById('scoreboard').style.display = '';
  if (document.getElementById('infoText')) document.getElementById('infoText').style.display = '';
}

function start1v1() {
  gameMode = "1v1";
  hideMenu();
  resetPositions();
  draw();
  update();
}

function startBot(level) {
  gameMode = "bot";
  botLevel = level;
  hideMenu();
  resetPositions();
  draw();
  update();
}

function setupPlayers() {
  const structure = `
    <div class="head"></div>
    <div class="body"></div>
    <div class="shorts"></div>
    <div class="left-arm"></div>
    <div class="right-arm"></div>
    <div class="left-leg"></div>
    <div class="right-leg"></div>
    <div class="left-foot"></div>
    <div class="right-foot"></div>
  `;
  player1.innerHTML = structure;
  player2.innerHTML = structure;
}
setupPlayers();

function draw() {
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
  if (inMenu) return;

  // Player 1 (Arrow keys)
  if (keys['ArrowUp'] && player1Y > 0) player1Y -= 4;
  if (keys['ArrowDown'] && player1Y < fieldHeight - playerHeight) player1Y += 4;
  if (keys['ArrowLeft'] && player1X > 0) player1X -= 4;
  if (keys['ArrowRight'] && player1X < fieldWidth - playerWidth) player1X += 4;

  // Player 2 (WASD or Bot)
  if (gameMode === "1v1") {
    if ((keys['w'] || keys['W']) && player2Y > 0) player2Y -= 4;
    if ((keys['s'] || keys['S']) && player2Y < fieldHeight - playerHeight) player2Y += 4;
    if ((keys['a'] || keys['A']) && player2X > 0) player2X -= 4;
    if ((keys['d'] || keys['D']) && player2X < fieldWidth - playerWidth) player2X += 4;
  } else if (gameMode === "bot") {
    updateBotPlayer();
  }

  // Ball movement
  ballX += ballVX;
  ballY += ballVY;
  ballVX *= 0.97;
  ballVY *= 0.97;

  // Ball collision with walls/goals
  if (ballY <= 0) { ballY = 0; ballVY *= -0.7; }
  if (ballY >= fieldHeight - ballSize) { ballY = fieldHeight - ballSize; ballVY *= -0.7; }
  if (ballX <= 0) { // left goal
    if (ballY + ballSize / 2 > 135 && ballY + ballSize / 2 < 245) {
      scoreR++; updateScore(); playGoalSound(); resetPositions();
    } else {
      ballX = 0; ballVX *= -0.7;
    }
  }
  if (ballX >= fieldWidth - ballSize) { // right goal
    if (ballY + ballSize / 2 > 135 && ballY + ballSize / 2 < 245) {
      scoreL++; updateScore(); playGoalSound(); resetPositions();
    } else {
      ballX = fieldWidth - ballSize; ballVX *= -0.7;
    }
  }

  // Player-ball collisions
  [
    [player1X, player1Y], [player2X, player2Y]
  ].forEach(([px, py], idx) => {
    let playerCenterX = px + playerWidth / 2;
    let playerCenterY = py + 25 + 18;
    let ballCenterX = ballX + ballSize / 2;
    let ballCenterY = ballY + ballSize / 2;
    let dx = playerCenterX - ballCenterX;
    let dy = playerCenterY - ballCenterY;
    let dist = Math.sqrt(dx * dx + dy * dy);
    let collisionDist = 18 + ballSize / 2;
    if (dist < collisionDist) {
      let angle = Math.atan2(dy, dx);
      ballVX = -Math.cos(angle) * 7;
      ballVY = -Math.sin(angle) * 7;
      let overlap = (collisionDist) - dist;
      ballX += Math.cos(angle) * overlap;
      ballY += Math.sin(angle) * overlap;
      playKickSound();
    }
  });

  // Prevent players from overlapping
  let p1cx = player1X + playerWidth / 2;
  let p1cy = player1Y + 14;
  let p2cx = player2X + playerWidth / 2;
  let p2cy = player2Y + 14;
  let dxp = p1cx - p2cx;
  let dyp = p1cy - p2cy;
  let distp = Math.sqrt(dxp * dxp + dyp * dyp);
  if (distp < 28) {
    let angle = Math.atan2(dyp, dxp);
    let overlap = 28 - distp;
    player1X += Math.cos(angle) * (overlap / 2);
    player1Y += Math.sin(angle) * (overlap / 2);
    player2X -= Math.cos(angle) * (overlap / 2);
    player2Y -= Math.sin(angle) * (overlap / 2);
  }

  draw();
  requestAnimationFrame(update);
}

function updateBotPlayer() {
  // Bot AI parameters per level
  const speedArr = [2,2.2,2.5,2.8,3.1,3.4,3.8,4.2,4.6,5.2];
  const reactArr = [0.33,0.36,0.39,0.43,0.48,0.53,0.59,0.66,0.75,0.85];
  const errorArr = [38,33,28,23,18,13,9,5,3,1];

  let speed = speedArr[botLevel-1];
  let react = reactArr[botLevel-1];
  let error = errorArr[botLevel-1];

  let targetX = Math.max(0, Math.min(fieldWidth - playerWidth, ballX + (Math.random()-0.5)*error));
  let targetY = Math.max(0, Math.min(fieldHeight - playerHeight, ballY + (Math.random()-0.5)*error));

  if (ballX > fieldWidth/2 || Math.random() > react) {
    if (player2X < targetX) player2X += speed;
    if (player2X > targetX) player2X -= speed;
    if (player2Y < targetY) player2Y += speed;
    if (player2Y > targetY) player2Y -= speed;
    player2X = Math.max(0, Math.min(fieldWidth-playerWidth, player2X));
    player2Y = Math.max(0, Math.min(fieldHeight-playerHeight, player2Y));
  }
}

function playKickSound() {
  try {
    kickSound.currentTime = 0;
    kickSound.play();
  } catch(e) { }
}

function playGoalSound() {
  try {
    goalSound.currentTime = 0;
    goalSound.play();
  } catch(e) { }
}

function updateScore() {
  scoreLeft.textContent = scoreL;
  scoreRight.textContent = scoreR;
}

function resetPositions() {
  player1X = 180; player1Y = 150;
  player2X = 480; player2Y = 150;
  ballX = 334; ballY = 174;
  ballVX = 0; ballVY = 0;
}

document.addEventListener('keydown', e => {
  if (!inMenu) keys[e.key] = true;
  // In menu: allow quick start with keys
  if (inMenu && (e.key === "1" || e.key === "2")) {
    if (e.key === "1") start1v1();
    if (e.key === "2") startBot(1);
  }
});
document.addEventListener('keyup', e => { keys[e.key] = false; });

setupMenu();
showMenu();
resetPositions();
draw();
