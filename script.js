/** 
 * SNAKE ARENA: AG EDITION v2.2
 * FEATURES: Organic Tapering Body, Slide Steering, Invincibility Buffer
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('current-score');

let snake = [];
let food = { x: 0, y: 0 };
let score = 0;
let angle = 0; 
let speed = 4;
let gameActive = false;
let isInvincible = true; 

// Input State
let keys = {};
let lastTouchX = null;

window.onload = () => {
    resize();
    let p = 0;
    const loadInt = setInterval(() => {
        p += Math.random() * 25;
        document.getElementById('progress-bar').style.width = `${p}%`;
        if (p >= 100) {
            clearInterval(loadInt);
            setTimeout(() => {
                document.getElementById('loader').classList.add('hidden');
                document.getElementById('intro').classList.remove('hidden');
            }, 500);
        }
    }, 200);
};

window.addEventListener('resize', resize);
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Disable default mobile gestures (pull-to-refresh)
document.addEventListener('touchmove', (e) => { if (gameActive) e.preventDefault(); }, { passive: false });

function startMatch() {
    score = 0; speed = 4;
    angle = -Math.PI / 2;
    snake = [];
    isInvincible = true;
    scoreEl.innerText = "000";

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Initial short body to prevent instant crash
    for(let i = 0; i < 12; i++) {
        snake.push({ x: centerX, y: centerY + (i * 2) });
    }
    
    spawnFood();
    
    document.getElementById('intro').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    
    gameActive = true;
    setTimeout(() => { isInvincible = false; }, 2000); // 2s Grace period
    requestAnimationFrame(update);
}

function spawnFood() {
    const pad = 50;
    food.x = Math.random() * (canvas.width - pad * 2) + pad;
    food.y = Math.random() * (canvas.height - pad * 2) + pad;
}

function update() {
    if (!gameActive) return;

    // Movement logic
    if (keys['a'] || keys['ArrowLeft']) angle -= 0.09;
    if (keys['d'] || keys['ArrowRight']) angle += 0.09;

    let head = { ...snake[0] };
    head.x += Math.cos(angle) * speed;
    head.y += Math.sin(angle) * speed;

    // Wall Check
    if (head.x < 0 || head.x > canvas.width || head.y < 0 || head.y > canvas.height) {
        if (!isInvincible) return endGame();
    }

    snake.unshift(head);

    // Food Check
    if (Math.hypot(head.x - food.x, head.y - food.y) < 22) {
        score += 10;
        scoreEl.innerText = score.toString().padStart(3, '0');
        speed += 0.12;
        spawnFood();
    } else {
        snake.pop();
    }

    // Body Check
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

    // Draw Food
    ctx.shadowBlur = 20; ctx.shadowColor = '#ff00ff';
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath(); ctx.arc(food.x, food.y, 9, 0, Math.PI * 2); ctx.fill();

    // Draw Snake
    ctx.shadowBlur = 12; ctx.shadowColor = '#00f3ff';
    
    snake.forEach((part, i) => {
        const size = Math.max(5, 15 - (i * 0.35));
        ctx.fillStyle = isInvincible && i % 2 === 0 ? '#fff' : `rgba(0, 243, 255, ${1 - (i / snake.length)})`;
        
        ctx.beginPath();
        ctx.arc(part.x, part.y, size, 0, Math.PI * 2);
        ctx.fill();

        if (i === 0) { // Head Eye
            ctx.fillStyle = "#000"; ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(part.x + Math.cos(angle)*5, part.y + Math.sin(angle)*5, 2.5, 0, Math.PI*2);
            ctx.fill();
        }
    });
}

// Mobile Slide Steering
window.addEventListener('touchstart', (e) => { lastTouchX = e.touches[0].clientX; }, { passive: false });
window.addEventListener('touchmove', (e) => {
    if (lastTouchX === null) return;
    let deltaX = e.touches[0].clientX - lastTouchX;
    angle += deltaX * 0.007; 
    lastTouchX = e.touches[0].clientX;
}, { passive: false });
window.addEventListener('touchend', () => { lastTouchX = null; });

window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

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
