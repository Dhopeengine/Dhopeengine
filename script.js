const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restart');

const TILE_COUNT = 20; // grid size (20x20)
const TILE_SIZE = canvas.width / TILE_COUNT; // pixel size
let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 10, y: 10 };
let score = 0;
let gameInterval = null;
let gameSpeed = 100; // ms per tick
let gameOver = false;

function resetGame() {
  snake = [ { x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 } ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  gameOver = false;
  placeFood();
  updateScore();
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameTick, gameSpeed);
}

function placeFood() {
  while (true) {
    const x = Math.floor(Math.random() * TILE_COUNT);
    const y = Math.floor(Math.random() * TILE_COUNT);
    if (!snake.some(s => s.x === x && s.y === y)) {
      food = { x, y };
      return;
    }
  }
}

function updateScore() { scoreEl.textContent = `Score: ${score}`; }

function gameTick() {
  if (gameOver) return;

  // apply queued direction but prevent reversing
  if ((nextDirection.x !== -direction.x || nextDirection.y !== -direction.y)) {
    direction = nextDirection;
  }

  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // wall collision
  if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
    endGame();
    return;
  }

  // self collision
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    endGame();
    return;
  }

  snake.unshift(head);

  // food
  if (head.x === food.x && head.y === food.y) {
    score += 1;
    updateScore();
    placeFood();
    // speed up a little every 5 points
    if (score % 5 === 0 && gameSpeed > 40) {
      gameSpeed = Math.max(40, gameSpeed - 8);
      clearInterval(gameInterval);
      gameInterval = setInterval(gameTick, gameSpeed);
    }
  } else {
    snake.pop();
  }

  draw();
}

function endGame() {
  gameOver = true;
  clearInterval(gameInterval);
  // simple overlay text
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#ffb4b4';
  ctx.font = '24px system-ui, Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over — Press Restart', canvas.width/2, canvas.height/2);
}

function draw() {
  // background
  ctx.fillStyle = '#061021';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // grid lines (subtle)
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  for (let i=0;i<=TILE_COUNT;i++){
    ctx.beginPath();
    ctx.moveTo(i * TILE_SIZE, 0);
    ctx.lineTo(i * TILE_SIZE, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * TILE_SIZE);
    ctx.lineTo(canvas.width, i * TILE_SIZE);
    ctx.stroke();
  }

  // draw food
  ctx.fillStyle = '#ef4444';
  const fx = food.x * TILE_SIZE + TILE_SIZE/2;
  const fy = food.y * TILE_SIZE + TILE_SIZE/2;
  ctx.beginPath();
  ctx.arc(fx, fy, TILE_SIZE * 0.4, 0, Math.PI*2);
  ctx.fill();

  // draw snake
  for (let i = 0; i < snake.length; i++) {
    const s = snake[i];
    ctx.fillStyle = i === 0 ? '#10b981' : '#059669';
    ctx.fillRect(s.x * TILE_SIZE + 1, s.y * TILE_SIZE + 1, TILE_SIZE - 2, TILE_SIZE - 2);
    // head highlight
    if (i === 0) {
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.strokeRect(s.x * TILE_SIZE + 1, s.y * TILE_SIZE + 1, TILE_SIZE - 2, TILE_SIZE - 2);
    }
  }
}

// input handling
window.addEventListener('keydown', (e) => {
  if (gameOver) return;
  switch (e.key) {
    case 'ArrowUp': case 'w': case 'W': nextDirection = { x: 0, y: -1 }; break;
    case 'ArrowDown': case 's': case 'S': nextDirection = { x: 0, y: 1 }; break;
    case 'ArrowLeft': case 'a': case 'A': nextDirection = { x: -1, y: 0 }; break;
    case 'ArrowRight': case 'd': case 'D': nextDirection = { x: 1, y: 0 }; break;
  }
});

restartBtn.addEventListener('click', () => { resetGame(); });

// start
resetGame();
