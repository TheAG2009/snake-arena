/** 
 * SNAKE ARENA: NEON EVOLUTION
 * ENGINE BY: AG
 * VERSION: 2.0 (Smooth Motion & Swipe Support)
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('current-score');
const progressBar = document.getElementById('progress-bar');

let snake = [];
let food = { x: 0, y: 0 };
let score = 0;
let angle = 0; 
let speed = 4;
let gameActive = false;
let keys = {};
let touchStartX = null;

// Initialize
window.onload = () => {
    resize();
    simulateLoading();
};

window.onresize = resize;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function simulateLoading() {
    let p = 0;
    const interval = setInterval(() => {
        p += Math.random() * 20;
        progressBar.style.width = `${p}%`;
        if (p >= 100) {
            clearInterval(interval);
            transition('loader', 'intro');
        }
    }, 200);
}

function transition(from, to) {
    document.getElementById(from).classList.add('hidden');
    setTimeout(() => {
        document.getElementById(to).classList.remove('hidden');
        if(to === 'game-container') startMatch();
    }, 500);
}

function startMatch() {
    score = 0;
    speed = 4;
    angle = 0;
    snake = [];
    for(let i=0; i<20; i++) {
        snake.push({ x: canvas.width/2, y: canvas.height/2 });
    }
    spawnFood();
    gameActive = true;
    requestAnimationFrame(update);
}

function spawnFood() {
    food.x = Math.random() * (canvas.width - 60) + 30;
    food.y = Math.random() * (canvas.height - 60) + 30;
}

function update() {
    if (!gameActive) return;

    // Control Logic
    if (keys['a'] || keys['ArrowLeft']) angle -= 0.08;
    if (keys['d'] || keys['ArrowRight']) angle += 0.08;

    let head = { ...snake[0] };
    head.x += Math.cos(angle) * speed;
    head.y += Math.sin(angle) * speed;

    // Wall Collision
    if (head.x < 0 || head.x > canvas.width || head.y < 0 || head.y > canvas.height) {
        endGame();
    }

    snake.unshift(head);

    // Food Collision
    const dist = Math.hypot(head.x - food.x, head.y - food.y);
    if (dist < 25) {
        score += 10;
        scoreEl.innerText = score.toString().padStart(3, '0');
        speed += 0.15;
        spawnFood();
    } else {
        snake.pop();
    }

    // Body Collision
    for(let i=15; i<snake.length; i++) {
        if(Math.hypot(head.x - snake[i].x, head.y - snake[i].y) < 10) {
            endGame();
        }
    }

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.fillStyle = '#0a0a0b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Food
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff00ff';
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.arc(food.x, food.y, 10, 0, Math.PI*2);
    ctx.fill();

    // Draw AG Snake
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00f3ff';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = snake.length - 1; i >= 0; i--) {
        const size = Math.max(6, 18 - (i * 0.4));
        ctx.strokeStyle = `rgba(0, 243, 255, ${1 - (i / snake.length)})`;
        ctx.lineWidth = size;
        
        ctx.beginPath();
        if (i === 0) {
            ctx.fillStyle = '#00f3ff';
            ctx.arc(snake[i].x, snake[i].y, size/1.5, 0, Math.PI*2);
            ctx.fill();
        } else {
            ctx.moveTo(snake[i-1].x, snake[i-1].y);
            ctx.lineTo(snake[i].x, snake[i].y);
            ctx.stroke();
        }
    }
}

// Mobile Steering Logic
window.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
window.addEventListener('touchmove', e => {
    if(!touchStartX) return;
    let diff = e.touches[0].clientX - touchStartX;
    angle += diff * 0.002; // Steering sensitivity
});

// Keyboard
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

// UI Buttons
document.getElementById('start-btn').onclick = () => transition('intro', 'game-container');
document.getElementById('restart-btn').onclick = () => transition('game-over', 'game-container');

function endGame() {
    gameActive = false;
    document.getElementById('final-score').innerText = score;
    document.body.classList.add('shake');
    setTimeout(() => {
        document.body.classList.remove('shake');
        transition('game-container', 'game-over');
    }, 500);
}
