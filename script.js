// Game canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let snake = [];
let food = {};
let direction = '';
let nextDirection = '';
let gameInterval;
let gameSpeed = 100; // milliseconds
let gridSize = 20;
let gridCount = canvas.width / gridSize;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;

// DOM elements
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Initialize high score display
highScoreElement.textContent = highScore;

// Event listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
document.addEventListener('keydown', changeDirection);

// Initialize game
function initGame() {
    // Create snake
    snake = [
        { x: Math.floor(gridCount / 2) * gridSize, y: Math.floor(gridCount / 2) * gridSize }
    ];
    
    // Create initial food
    createFood();
    
    // Reset score
    score = 0;
    scoreElement.textContent = score;
    
    // Reset direction
    direction = '';
    nextDirection = '';
    
    // Draw initial state
    drawGame();
}

// Start game
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gameInterval = setInterval(gameLoop, gameSpeed);
        startBtn.disabled = true;
    }
}

// Restart game
function restartGame() {
    clearInterval(gameInterval);
    gameRunning = false;
    startBtn.disabled = false;
    initGame();
}

// Game loop
function gameLoop() {
    // Update snake direction
    direction = nextDirection;
    
    // Move snake
    moveSnake();
    
    // Check collisions
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // Check if snake eats food
    if (snake[0].x === food.x && snake[0].y === food.y) {
        eatFood();
    } else {
        // Remove tail segment if no food was eaten
        snake.pop();
    }
    
    // Draw updated game state
    drawGame();
}

// Move snake
function moveSnake() {
    const head = { ...snake[0] };
    
    switch (direction) {
        case 'UP':
            head.y -= gridSize;
            break;
        case 'DOWN':
            head.y += gridSize;
            break;
        case 'LEFT':
            head.x -= gridSize;
            break;
        case 'RIGHT':
            head.x += gridSize;
            break;
        default:
            return; // Don't move if no direction
    }
    
    // Add new head segment
    snake.unshift(head);
}

// Change direction based on key press
function changeDirection(event) {
    const key = event.key;
    
    // Prevent opposite direction
    if (key === 'ArrowUp' && direction !== 'DOWN') {
        nextDirection = 'UP';
    } else if (key === 'ArrowDown' && direction !== 'UP') {
        nextDirection = 'DOWN';
    } else if (key === 'ArrowLeft' && direction !== 'RIGHT') {
        nextDirection = 'LEFT';
    } else if (key === 'ArrowRight' && direction !== 'LEFT') {
        nextDirection = 'RIGHT';
    }
    
    // Start game on first key press
    if (!gameRunning && nextDirection) {
        startGame();
    }
}

// Check for collisions with walls or self
function checkCollision() {
    const head = snake[0];
    
    // Check wall collision
    if (
        head.x < 0 ||
        head.x >= canvas.width ||
        head.y < 0 ||
        head.y >= canvas.height
    ) {
        return true;
    }
    
    // Check self collision (skip the head)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// Handle eating food
function eatFood() {
    // Increase score
    score += 10;
    scoreElement.textContent = score;
    
    // Update high score if needed
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore);
    }
    
    // Create new food
    createFood();
    
    // Speed up game slightly every 5 food items
    if (score % 50 === 0 && gameSpeed > 50) {
        clearInterval(gameInterval);
        gameSpeed -= 5;
        gameInterval = setInterval(gameLoop, gameSpeed);
    }
}

// Create food at random position
function createFood() {
    // Generate random coordinates
    const randomX = Math.floor(Math.random() * gridCount) * gridSize;
    const randomY = Math.floor(Math.random() * gridCount) * gridSize;
    
    // Check if food position overlaps with snake
    const isOnSnake = snake.some(segment => segment.x === randomX && segment.y === randomY);
    
    if (isOnSnake) {
        // If food is on snake, try again
        createFood();
    } else {
        // Set food position
        food = { x: randomX, y: randomY };
    }
}

// Draw game elements
function drawGame() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    snake.forEach((segment, index) => {
        // Head is green, body is lighter green
        ctx.fillStyle = index === 0 ? '#2E8B57' : '#3CB371';
        ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
        
        // Draw border
        ctx.strokeStyle = '#1E5631';
        ctx.strokeRect(segment.x, segment.y, gridSize, gridSize);
    });
    
    // Draw food
    ctx.fillStyle = '#FF6347';
    ctx.beginPath();
    ctx.arc(
        food.x + gridSize / 2,
        food.y + gridSize / 2,
        gridSize / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// Game over
function gameOver() {
    clearInterval(gameInterval);
    gameRunning = false;
    startBtn.disabled = false;
    
    // Draw game over screen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
}

// Initialize game on load
initGame();