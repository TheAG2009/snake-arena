const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('current-score');
const highScoreEl = document.getElementById('high-score');

// Game Settings
let gridSize = 20;
let tileCount;
let snake = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let dx = 0, dy = 0;
let nextDx = 0, nextDy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let speed = 7;
let gameActive = false;
let isMuted = false;

// Initialization
window.onload = () => {
    resizeCanvas();
    loadSimulation();
    highScoreEl.innerText = highScore.toString().padStart(3, '0');
};

function resizeCanvas() {
    const size = Math.min(window.innerWidth - 40, 400);
    canvas.width = size;
    canvas.height = size;
    tileCount = canvas.width / gridSize;
}

// Pseudo Loading Screen
function loadSimulation() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        document.getElementById('progress-bar').style.width = `${progress}%`;
        if (progress >= 100) {
            clearInterval(interval);
            transition('loader', 'intro');
        }
    }, 150);
}

function transition(from, to) {
    document.getElementById(from).classList.add('hidden');
    setTimeout(() => {
        document.getElementById(to).classList.remove('hidden');
        if(to === 'game-container') startGame();
    }, 800);
}

// Game Logic
function startGame() {
    gameActive = true;
    score = 0;
    speed = 7;
    snake = [{ x: 10, y: 10 }];
    dx = 1; dy = 0; nextDx = 1; nextDy = 0;
    spawnFood();
    gameLoop();
}

function gameLoop() {
    if (!gameActive) return;

    setTimeout(() => {
        clearCanvas();
        moveSnake();
        drawFood();
        drawSnake();
        checkCollision();
        gameLoop();
    }, 1000 / speed);
}

function clearCanvas() {
    ctx.fillStyle = '#0a0a0b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? '#00f3ff' : 'rgba(0, 243, 255, 0.6)';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00f3ff';
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function moveSnake() {
    dx = nextDx;
    dy = nextDy;
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreEl.innerText = score.toString().padStart(3, '0');
        speed += 0.2;
        spawnFood();
        playSound('eat');
    } else {
        snake.pop();
    }
}

function drawFood() {
    ctx.fillStyle = '#ff00ff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff00ff';
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/3, 0, Math.PI * 2);
    ctx.fill();
}

function spawnFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
}

function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
    }
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) gameOver();
    }
}

function gameOver() {
    gameActive = false;
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 200);
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
    }
    
    document.getElementById('final-score').innerText = score;
    transition('game-container', 'game-over');
    playSound('hit');
}

// Input Handling
window.addEventListener('keydown', e => {
    switch(e.key.toLowerCase()) {
        case 'w': case 'arrowup': if (dy !== 1) { nextDx = 0; nextDy = -1; } break;
        case 's': case 'arrowdown': if (dy !== -1) { nextDx = 0; nextDy = 1; } break;
        case 'a': case 'arrowleft': if (dx !== 1) { nextDx = -1; nextDy = 0; } break;
        case 'd': case 'arrowright': if (dx !== -1) { nextDx = 1; nextDy = 0; } break;
    }
});

// UI Buttons
document.getElementById('start-btn').onclick = () => transition('intro', 'game-container');
document.getElementById('restart-btn').onclick = () => transition('game-over', 'game-container');

// Mobile Touch
document.getElementById('btn-up').ontouchstart = () => { if (dy !== 1) { nextDx = 0; nextDy = -1; } };
document.getElementById('btn-down').ontouchstart = () => { if (dy !== -1) { nextDx = 0; nextDy = 1; } };
document.getElementById('btn-left').ontouchstart = () => { if (dx !== 1) { nextDx = -1; nextDy = 0; } };
document.getElementById('btn-right').ontouchstart = () => { if (dx !== -1) { nextDx = 1; nextDy = 0; } };

// Sound System Placeholder
function playSound(type) {
    if (isMuted) return;
    // Implementation: new Audio(`./assets/sounds/${type}.wav`).play();
}

// PWA Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
