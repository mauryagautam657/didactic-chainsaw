const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 6;
const paddleSpeed = 6;
const ballSpeed = 4;
const computerSpeed = 4.5;

let gameRunning = false;
let playerScore = 0;
let computerScore = 0;

// Player paddle (left side)
const playerPaddle = {
    x: 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    move: function() {
        this.y += this.dy;
        // Collision with top wall
        if (this.y < 0) this.y = 0;
        // Collision with bottom wall
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
        }
    },
    draw: function() {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
};

// Computer paddle (right side)
const computerPaddle = {
    x: canvas.width - 20 - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    move: function() {
        this.y += this.dy;
        // Collision with top wall
        if (this.y < 0) this.y = 0;
        // Collision with bottom wall
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
        }
    },
    draw: function() {
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
};

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: ballSpeed,
    vy: ballSpeed * 0.5,
    radius: ballSize,
    move: function() {
        this.x += this.vx;
        this.y += this.vy;
    },
    draw: function() {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    },
    reset: function() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.vx = ballSpeed * (Math.random() > 0.5 ? 1 : -1);
        this.vy = ballSpeed * 0.5 * (Math.random() > 0.5 ? 1 : -1);
    }
};

// Keyboard input
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        gameRunning = !gameRunning;
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse input
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    // Move paddle towards mouse
    if (mouseY < playerPaddle.y + paddleHeight / 2) {
        playerPaddle.dy = -paddleSpeed;
    } else if (mouseY > playerPaddle.y + paddleHeight / 2) {
        playerPaddle.dy = paddleSpeed;
    } else {
        playerPaddle.dy = 0;
    }
});

// Handle arrow keys
function handlePlayerInput() {
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        playerPaddle.dy = -paddleSpeed;
    } else if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        playerPaddle.dy = paddleSpeed;
    } else {
        playerPaddle.dy = 0;
    }
}

// Computer AI
function computerAI() {
    const computerCenter = computerPaddle.y + paddleHeight / 2;
    const ballCenter = ball.y;
    
    if (computerCenter < ballCenter - 10) {
        computerPaddle.dy = computerSpeed;
    } else if (computerCenter > ballCenter + 10) {
        computerPaddle.dy = -computerSpeed;
    } else {
        computerPaddle.dy = 0;
    }
}

// Collision detection - Ball with paddles
function checkPaddleCollision() {
    // Player paddle collision
    if (ball.vx < 0 &&
        ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + playerPaddle.height) {
        ball.vx = -ball.vx * 1.05; // Add slight speed increase
        ball.x = playerPaddle.x + playerPaddle.width + ball.radius;
        // Add angle based on where ball hits paddle
        const hitPos = (ball.y - playerPaddle.y) / playerPaddle.height - 0.5;
        ball.vy += hitPos * 4;
    }
    
    // Computer paddle collision
    if (ball.vx > 0 &&
        ball.x + ball.radius > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height) {
        ball.vx = -ball.vx * 1.05; // Add slight speed increase
        ball.x = computerPaddle.x - ball.radius;
        // Add angle based on where ball hits paddle
        const hitPos = (ball.y - computerPaddle.y) / computerPaddle.height - 0.5;
        ball.vy += hitPos * 4;
    }
}

// Collision detection - Ball with top/bottom walls
function checkWallCollision() {
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy = -ball.vy;
    }
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.vy = -ball.vy;
    }
}

// Check if ball is out of bounds
function checkGameOver() {
    // Ball out on left side (computer scores)
    if (ball.x - ball.radius < 0) {
        computerScore++;
        document.getElementById('computerScore').textContent = computerScore;
        ball.reset();
    }
    // Ball out on right side (player scores)
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        document.getElementById('playerScore').textContent = playerScore;
        ball.reset();
    }
}

// Draw center line
function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Draw game status
function drawStatus() {
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED - Press SPACE to Resume', canvas.width / 2, canvas.height / 2);
    }
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw elements
    drawCenterLine();
    
    if (gameRunning) {
        // Update game state
        handlePlayerInput();
        computerAI();
        
        playerPaddle.move();
        computerPaddle.move();
        ball.move();
        
        // Collision detection
        checkPaddleCollision();
        checkWallCollision();
        checkGameOver();
    }
    
    // Draw game objects
    playerPaddle.draw();
    computerPaddle.draw();
    ball.draw();
    
    drawStatus();
    
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();

// Start game automatically
gameRunning = true;