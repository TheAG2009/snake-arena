/** * SNAKE ARENA: AG EDITION v3.0
 * Features: 360 Follow, Speed Scaling, Particle FX, Adaptive Growth
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('current-score');

// Load Assets from your folder structure
const sfx = {
    eat: new Audio('assets/sounds/eat.wav'),
    hit: new Audio('assets/sounds/hit.wav'),
    bgm: new Audio('assets/sounds/bgm.mp3')
};
sfx.bgm.loop = true;

let snake = [], food = { x: 0, y: 0 }, particles = [];
let score = 0, speed = 4, angle = -Math.PI / 2;
let gameActive = false, isInvincible = false;
let moveX = 0, moveY = -1, mode = 'keyboard';
let baseSize = 18; // Starting thickness

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
        p += Math.random() * 15;
        if (bar) bar.style.width = p + "%";
        if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                document.getElementById('loader').classList.add('hidden');
                document.getElementById('intro').classList.remove('hidden');
            }, 500);
        }
    }, 100);
}

function createParticles(x, y, color) {
    for (let i = 0; i < 15; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12,
            alpha: 1,
            color
        });
    }
}

function startMatch() {
    score = 0; speed = 4; baseSize = 18; snake = [];
    moveX = 0; moveY = -1; particles = [];
    scoreEl.innerText = "000";
    sfx.bgm.play().catch(() => {});

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    // Tighter initial body for smoother turns
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
    const pad = 80;
    food.x = Math.random() * (canvas.width - pad * 2) + pad;
    food.y = Math.random() * (canvas.height - pad * 2) + pad;
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

    // Boundary Logic
    if (head.x < 0 || head.x > canvas.width || head.y < 0 || head.y > canvas.height) {
        if (!isInvincible) return endGame();
    }

    snake.unshift(head);

    // Collision with Food
    if (Math.hypot(head.x - food.x, head.y - food.y) < (baseSize + 10)) {
        score += 10;
        scoreEl.innerText = score.toString().padStart(3, '0');
        
        // GROWTH & SPEED INCREASE
        speed += 0.25; 
        baseSize += 0.6; 
        
        sfx.eat.play().catch(() => {});
        createParticles(food.x, food.y, '#ff00ff');
        
        // Screen Shake
        document.body.classList.add('shake-light');
        setTimeout(() => document.body.classList.remove('shake-light'), 150);
        
        spawnFood();
    } else {
        snake.pop();
    }

    // Self Collision
    if (!isInvincible) {
        for(let i = 25; i < snake.length; i++) {
            if(Math.hypot(head.x - snake[i].x, head.y - snake[i].y) < baseSize/2) return endGame();
        }
    }

    // Update Particles
    particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        p.alpha -= 0.025;
        if (p.alpha <= 0) particles.splice(i, 1);
    });

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.fillStyle = '#0a0a0b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Particles
    particles.forEach(p => {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Neon Apple
    ctx.shadowBlur = 20; ctx.shadowColor = '#ff00ff';
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath(); ctx.arc(food.x, food.y, 14, 0, Math.PI*2); ctx.fill();

    // Snake Visuals
    ctx.shadowBlur = 15; ctx.shadowColor = '#00f3ff';
    snake.forEach((part, i) => {
        const size = Math.max(8, baseSize - (i * 0.3));
        ctx.fillStyle = isInvincible && i % 2 === 0 ? '#fff' : `rgba(0, 243, 255, ${1 - (i/snake.length)})`;
        ctx.beginPath(); ctx.arc(part.x, part.y, size, 0, Math.PI*2); ctx.fill();

        if (i === 0) { // SNAKE FACE LOGIC
            ctx.shadowBlur = 0;
            ctx.fillStyle = "white"; 
            const eyeDist = size * 0.55;
            const lx = part.x + Math.cos(angle - 0.7) * eyeDist;
            const ly = part.y + Math.sin(angle - 0.7) * eyeDist;
            const rx = part.x + Math.cos(angle + 0.7) * eyeDist;
            const ry = part.y + Math.sin(angle + 0.7) * eyeDist;
            ctx.beginPath(); ctx.arc(lx, ly, size/3.5, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(rx, ry, size/3.5, 0, Math.PI*2); ctx.fill();
            
            ctx.fillStyle = "black";
            ctx.beginPath(); ctx.arc(lx + Math.cos(angle)*2, ly + Math.sin(angle)*2, size/8, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(rx + Math.cos(angle)*2, ry + Math.sin(angle)*2, size/8, 0, Math.PI*2); ctx.fill();
        }
    });
}

// 360 Mobile Finger Tracking
window.addEventListener('touchmove', (e) => {
    mode = 'touch';
    const t = e.touches[0];
    angle = Math.atan2(t.clientY - snake[0].y, t.clientX - snake[0].x);
    if(gameActive) e.preventDefault();
}, {passive: false});

// PC WASD Controller
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
    sfx.bgm.pause();
    sfx.hit.play().catch(() => {});
    document.body.classList.add('shake-hard');
    setTimeout(() => document.body.classList.remove('shake-hard'), 300);
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-container').classList.add('hidden');
    document.getElementById('game-over').classList.remove('hidden');
}
