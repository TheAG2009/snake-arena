/** * SNAKE ARENA: AG EDITION v2.4
 * Logic: 360° Follow (Mobile) | Snap-Grid (PC)
 * Assets: Integrated with /assets/sounds/
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('current-score');

// Load Sounds based on your directory
const sfx = {
    eat: new Audio('assets/sounds/eat.wav'),
    hit: new Audio('assets/sounds/hit.wav'),
    move: new Audio('assets/sounds/move.wav'),
    bgm: new Audio('assets/sounds/bgm.mp3')
};
sfx.bgm.loop = true;

let snake = [];
let food = { x: 0, y: 0 };
let score = 0;
let angle = -Math.PI / 2;
let speed = 4;
let gameActive = false;
let isInvincible = false;
let moveX = 0, moveY = -1, mode = 'keyboard';

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
    const interval = setInterval(() => {
        p += 10;
        document.getElementById('progress-bar').style.width = p + "%";
        if (p >= 100) {
            clearInterval(interval);
            document.getElementById('loader').classList.add('hidden');
            document.getElementById('intro').classList.remove('hidden');
        }
    }, 100);
}

function startMatch() {
    score = 0; speed = 4; snake = [];
    moveX = 0; moveY = -1;
    scoreEl.innerText = "000";
    sfx.bgm.play().catch(() => console.log("Audio requires user interaction"));

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    for(let i = 0; i < 15; i++) snake.push({ x: centerX, y: centerY + (i * 2) });
    
    spawnFood();
    document.getElementById('intro').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    
    gameActive = true;
    isInvincible = true;
    setTimeout(() => { isInvincible = false; }, 2000);
    requestAnimationFrame(update);
}

function spawnFood() {
    food.x = Math.random() * (canvas.width - 100) + 50;
    food.y = Math.random() * (canvas.height - 100) + 50;
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
        sfx.eat.play();
        spawnFood();
    } else {
        snake.pop();
    }

    if (!isInvincible) {
        for(let i = 20; i < snake.length; i++) {
            if(Math.hypot(head.x - snake[i].x, head.y - snake[i].y) < 8) return endGame();
        }
    }

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.fillStyle = '#0a0a0b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Food
    ctx.shadowBlur = 15; ctx.shadowColor = '#ff00ff';
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath(); ctx.arc(food.x, food.y, 10, 0, Math.PI*2); ctx.fill();

    // Snake
    ctx.shadowBlur = 10; ctx.shadowColor = '#00f3ff';
    snake.forEach((part, i) => {
        const size = Math.max(5, 15 - (i * 0.3));
        ctx.fillStyle = isInvincible && i % 2 === 0 ? '#fff' : `rgba(0, 243, 255, ${1 - (i/snake.length)})`;
        ctx.beginPath(); ctx.arc(part.x, part.y, size, 0, Math.PI*2); ctx.fill();
    });
}

// 360 Mobile Logic
window.addEventListener('touchstart', (e) => {
    mode = 'touch';
    angle = Math.atan2(e.touches[0].clientY - snake[0].y, e.touches[0].clientX - snake[0].x);
}, {passive: false});

window.addEventListener('touchmove', (e) => {
    mode = 'touch';
    angle = Math.atan2(e.touches[0].clientY - snake[0].y, e.touches[0].clientX - snake[0].x);
    if(gameActive) e.preventDefault();
}, {passive: false});

// PC WASD Logic
window.addEventListener('keydown', e => {
    mode = 'keyboard';
    const k = e.key.toLowerCase();
    if ((k === 'w' || k === 'arrowup') && moveY === 0) { moveX = 0; moveY = -1; sfx.move.play(); }
    if ((k === 's' || k === 'arrowdown') && moveY === 0) { moveX = 0; moveY = 1; sfx.move.play(); }
    if ((k === 'a' || k === 'arrowleft') && moveX === 0) { moveX = -1; moveY = 0; sfx.move.play(); }
    if ((k === 'd' || k === 'arrowright') && moveX === 0) { moveX = 1; moveY = 0; sfx.move.play(); }
});

document.getElementById('start-btn').onclick = startMatch;
document.getElementById('restart-btn').onclick = startMatch;

function endGame() {
    gameActive = false;
    sfx.bgm.pause();
    sfx.hit.play();
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-container').classList.add('hidden');
    document.getElementById('game-over').classList.remove('hidden');
}
