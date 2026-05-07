/** 
 * SNAKE ARENA: AG EDITION v2.3
 * Hybrid Engine: 360° Touch Follow + Snap-Grid WASD
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('current-score');

let snake = [];
let food = { x: 0, y: 0 };
let score = 0;
let angle = -Math.PI / 2; 
let speed = 4;
let gameActive = false;
let isInvincible = false;

// Input Variables
let mode = 'keyboard'; 
let moveX = 0;
let moveY = -1;

window.onload = () => {
    resize();
    initLoader();
};

window.addEventListener('resize', resize);
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function initLoader() {
    let p = 0;
    const bar = document.getElementById('progress-bar');
    const interval = setInterval(() => {
        p += Math.random() * 25;
        if (bar) bar.style.width = p + "%";
        if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                document.getElementById('loader').classList.add('hidden');
                document.getElementById('intro').classList.remove('hidden');
            }, 500);
        }
    }, 150);
}

function startMatch() {
    score = 0; speed = 4;
    snake = [];
    isInvincible = true;
    moveX = 0; moveY = -1; 
    if(scoreEl) scoreEl.innerText = "000";

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    for(let i = 0; i < 15; i++) {
        snake.push({ x: centerX, y: centerY + (i * 2) });
    }
    
    spawnFood();
    document.getElementById('intro').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    
    gameActive = true;
    setTimeout(() => { isInvincible = false; }, 2000);
    requestAnimationFrame(update);
}

function spawnFood() {
    const pad = 60;
    food.x = Math.random() * (canvas.width - pad * 2) + pad;
    food.y = Math.random() * (canvas.height - pad * 2) + pad;
}

function update() {
    if (!gameActive) return;

    let head = { ...snake[0] };

    if (mode === 'keyboard') {
        head.x += moveX * speed;
        head.y += moveY * speed;
        angle = Math.atan2(moveY, moveX);
    } else {
        head.x += Math.cos(angle) * speed;
        head.y += Math.sin(angle) * speed;
    }

    if (head.x < 0 || head.x > canvas.width || head.y < 0 || head.y > canvas.height) {
        if (!isInvincible) return endGame();
    }

    snake.unshift(head);

    if (Math.hypot(head.x - food.x, head.y - food.y) < 25) {
        score += 10;
        scoreEl.innerText = score.toString().padStart(3, '0');
        speed += 0.1;
        spawnFood();
    } else {
        snake.pop();
    }

    if (!isInvincible) {
        for(let i = 18; i < snake.length; i++) {
            if(Math.hypot(head.x - snake[i].x, head.y - snake[i].y) < 8) return endGame();
        }
    }

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.fillStyle = '#0a0a0b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Node (Food)
    ctx.shadowBlur = 20; ctx.shadowColor = '#ff00ff';
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath(); ctx.arc(food.x, food.y, 10, 0, Math.PI*2); ctx.fill();

    // Snake Visuals
    ctx.shadowBlur = 12; ctx.shadowColor = '#00f3ff';
    snake.forEach((part, i) => {
        const size = Math.max(5, 15 - (i * 0.35));
        ctx.fillStyle = isInvincible && i % 2 === 0 ? '#fff' : `rgba(0, 243, 255, ${1 - (i/snake.length)})`;
        ctx.beginPath(); ctx.arc(part.x, part.y, size, 0, Math.PI*2); ctx.fill();
        
        if (i === 0) { // Head Eye Direction
            ctx.fillStyle = "#000"; ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(part.x + Math.cos(angle)*6, part.y + Math.sin(angle)*6, 2.5, 0, Math.PI*2);
            ctx.fill();
        }
    });
}

// 360° Touch Controller
function handleTouch(e) {
    if(!gameActive) return;
    mode = 'touch';
    const touch = e.touches[0];
    const head = snake[0];
    const dx = touch.clientX - head.x;
    const dy = touch.clientY - head.y;
    angle = Math.atan2(dy, dx);
    e.preventDefault();
}

window.addEventListener('touchstart', handleTouch, {passive: false});
window.addEventListener('touchmove', handleTouch, {passive: false});

// WASD / Arrow Key Controller
window.addEventListener('keydown', e => {
    mode = 'keyboard';
    const key = e.key.toLowerCase();
    if ((key === 'w' || key === 'arrowup') && moveY === 0) { moveX = 0; moveY = -1; }
    if ((key === 's' || key === 'arrowdown') && moveY === 0) { moveX = 0; moveY = 1; }
    if ((key === 'a' || key === 'arrowleft') && moveX === 0) { moveX = -1; moveY = 0; }
    if ((key === 'd' || key === 'arrowright') && moveX === 0) { moveX = 1; moveY = 0; }
});

document.getElementById('start-btn').onclick = startMatch;
document.getElementById('restart-btn').onclick = startMatch;

function endGame() {
    gameActive = false;
    document.getElementById('final-score').innerText = score;
    document.body.classList.add('shake');
    setTimeout(() => {
        document.body.classList.remove('shake');
        document.getElementById('game-container').classList.add('hidden');
        document.getElementById('game-over').classList.remove('hidden');
    }, 400);
}
