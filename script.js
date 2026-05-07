const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('current-score');

// Enhanced Physics & Aesthetics
let snake = [];
const snakeLength = 20;
const segmentDist = 5; // Distance between segments for smooth "rope" physics
let food = { x: 0, y: 0 };
let score = 0;
let angle = 0; // Continuous rotation instead of 4 directions
let speed = 3;
let gameActive = false;

// Input Handling
let keys = {};
let touchStart = null;

function init() {
    resize();
    resetGame();
    animate();
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.7; // Leave room for UI
}

function resetGame() {
    score = 0;
    speed = 3;
    snake = [];
    // Initialize snake with a few points
    for(let i=0; i<15; i++) {
        snake.push({ x: canvas.width/2, y: canvas.height/2 });
    }
    spawnFood();
    gameActive = true;
}

function spawnFood() {
    food.x = Math.random() * (canvas.width - 40) + 20;
    food.y = Math.random() * (canvas.height - 40) + 20;
}

// The "Secret Sauce" for smooth movement
function moveSnake() {
    let head = { ...snake[0] };

    // Keyboard rotation
    if (keys['ArrowLeft'] || keys['a']) angle -= 0.1;
    if (keys['ArrowRight'] || keys['d']) angle += 0.1;

    // Update Head Position based on angle
    head.x += Math.cos(angle) * speed;
    head.y += Math.sin(angle) * speed;

    // Boundary Check
    if (head.x < 0 || head.x > canvas.width || head.y < 0 || head.y > canvas.height) {
        gameOver();
    }

    snake.unshift(head);
    
    // Check Food Collision
    const dist = Math.hypot(head.x - food.x, head.y - food.y);
    if (dist < 20) {
        score += 10;
        scoreEl.innerText = score.toString().padStart(3, '0');
        speed += 0.1;
        spawnFood();
        // Don't pop to grow
    } else {
        snake.pop();
    }

    // Self Collision (Skip head and neck)
    for (let i = 10; i < snake.length; i++) {
        if (Math.hypot(head.x - snake[i].x, head.y - snake[i].y) < 10) {
            gameOver();
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Food (Glowing Orb)
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff00ff';
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.arc(food.x, food.y, 8, 0, Math.PI*2);
    ctx.fill();

    // Draw Snake (Smooth Path)
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00f3ff';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw body segments with tapering thickness
    for (let i = snake.length - 1; i >= 0; i--) {
        const size = Math.max(5, 15 - (i * 0.5)); // Tapers toward the tail
        ctx.strokeStyle = `rgba(0, 243, 255, ${1 - i/snake.length})`;
        ctx.lineWidth = size;
        
        ctx.beginPath();
        if (i === 0) {
            ctx.arc(snake[i].x, snake[i].y, size/2, 0, Math.PI*2);
            ctx.fill();
        } else {
            ctx.moveTo(snake[i-1].x, snake[i-1].y);
            ctx.lineTo(snake[i].x, snake[i].y);
            ctx.stroke();
        }
    }
}

function animate() {
    if (gameActive) {
        moveSnake();
        draw();
    }
    requestAnimationFrame(animate);
}

// IMPROVED MOBILE CONTROLS: Touch steering
window.addEventListener('touchstart', e => {
    touchStart = e.touches[0].clientX;
});

window.addEventListener('touchmove', e => {
    if (!touchStart) return;
    let touchMove = e.touches[0].clientX;
    let diff = touchMove - touchStart;
    
    // Sensitivity: Steering based on swipe offset
    angle += diff * 0.005; 
});

window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

function gameOver() {
    gameActive = false;
    alert("SYSTEM CRASHED. SCORE: " + score);
    location.reload(); 
}

init();
