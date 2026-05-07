const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('current-score');

let snake = [], food = { x: 0, y: 0 };
let score = 0, speed = 4, angle = -Math.PI / 2;
let gameActive = false, isInvincible = false;
let moveX = 0, moveY = -1, mode = 'keyboard';
let baseSize = 20; // Starting thickness

window.onload = () => {
    resize();
    let p = 0;
    const load = setInterval(() => {
        p += 10;
        document.getElementById('progress-bar').style.width = p + "%";
        if (p >= 100) {
            clearInterval(load);
            document.getElementById('loader').classList.add('hidden');
            document.getElementById('intro').classList.remove('hidden');
        }
    }, 100);
};

window.addEventListener('resize', resize);
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function startMatch() {
    score = 0; speed = 4; baseSize = 20; snake = [];
    moveX = 0; moveY = -1;
    scoreEl.innerText = "000";
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
        head.x += moveX * speed; head.y += moveY * speed;
        angle = Math.atan2(moveY, moveX);
    } else {
        head.x += Math.cos(angle) * speed; head.y += Math.sin(angle) * speed;
    }

    if (head.x < 0 || head.x > canvas.width || head.y < 0 || head.y > canvas.height) {
        if (!isInvincible) return endGame();
    }

    snake.unshift(head);

    if (Math.hypot(head.x - food.x, head.y - food.y) < (baseSize + 5)) {
        score += 10;
        scoreEl.innerText = score.toString().padStart(3, '0');
        speed += 0.05;
        baseSize += 0.5; // SNAKE GROWS WIDER
        spawnFood();
    } else {
        snake.pop();
    }

    if (!isInvincible) {
        for(let i = 20; i < snake.length; i++) {
            if(Math.hypot(head.x - snake[i].x, head.y - snake[i].y) < baseSize/2) return endGame();
        }
    }
    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.fillStyle = '#0a0a0b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Apple
    ctx.shadowBlur = 15; ctx.shadowColor = '#ff00ff';
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath(); ctx.arc(food.x, food.y, 12, 0, Math.PI*2); ctx.fill();

    // Snake Body
    ctx.shadowBlur = 10; ctx.shadowColor = '#00f3ff';
    snake.forEach((part, i) => {
        const size = Math.max(8, baseSize - (i * 0.3));
        ctx.fillStyle = isInvincible && i % 2 === 0 ? '#fff' : `rgba(0, 243, 255, ${1 - (i/snake.length)})`;
        ctx.beginPath(); ctx.arc(part.x, part.y, size, 0, Math.PI*2); ctx.fill();

        if (i === 0) { // DRAW FACE
            ctx.shadowBlur = 0;
            ctx.fillStyle = "white"; // Eyes
            const eyeDist = size * 0.5;
            const lx = part.x + Math.cos(angle - 0.6) * eyeDist;
            const ly = part.y + Math.sin(angle - 0.6) * eyeDist;
            const rx = part.x + Math.cos(angle + 0.6) * eyeDist;
            const ry = part.y + Math.sin(angle + 0.6) * eyeDist;
            ctx.beginPath(); ctx.arc(lx, ly, size/4, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(rx, ry, size/4, 0, Math.PI*2); ctx.fill();
            
            ctx.fillStyle = "black"; // Pupils
            ctx.beginPath(); ctx.arc(lx + Math.cos(angle)*2, ly + Math.sin(angle)*2, size/8, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(rx + Math.cos(angle)*2, ry + Math.sin(angle)*2, size/8, 0, Math.PI*2); ctx.fill();
        }
    });
}

// Controls
window.addEventListener('touchmove', (e) => {
    mode = 'touch';
    const t = e.touches[0];
    angle = Math.atan2(t.clientY - snake[0].y, t.clientX - snake[0].x);
    if(gameActive) e.preventDefault();
}, {passive: false});

window.addEventListener('keydown', e => {
    mode = 'keyboard';
    const k = e.key.toLowerCase();
    if ((k === 'w' || k === 'arrowup') && moveY === 0) { moveX = 0; moveY = -1; }
    if ((k === 's' || k === 'arrowdown') && moveY === 0) { moveX = 0; moveY = 1; }
    if ((k === 'a' || k === 'arrowleft') && moveX === 0) { moveX = -1; moveY = 0; }
    if ((k === 'd' || k === 'arrowright') && moveX === 0) { moveX = 1; moveY = 0; }
});

document.getElementById('start-btn').onclick = startMatch;
document.getElementById('restart-btn').onclick = startMatch;

function endGame() {
    gameActive = false;
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-container').classList.add('hidden');
    document.getElementById('game-over').classList.remove('hidden');
}
