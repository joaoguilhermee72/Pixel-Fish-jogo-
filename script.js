
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const scoreElement = document.getElementById("score");
const bestScoreElement = document.getElementById("bestScore");
const finalScoreElement = document.getElementById("finalScore");

let fish;
let obstacles;
let score;
let bestScore = Number(localStorage.getItem("pixelFishBest")) || 0;

let gameRunning = false;
let animationId = null;
let frame = 0;

const gravity = 0.34;
const jumpForce = -6.5;
const obstacleSpeed = 3.6;
const obstacleGap = 135;
const obstacleWidth = 55;

const fishSize = 30;

bestScoreElement.textContent = bestScore;

function createFish() {
    return {
        x: 90,
        y: canvas.height / 2,
        velocity: 0,
        size: fishSize
    };
}

function startGame() {
    if (animationId !== null) {
        cancelAnimationFrame(animationId);
    }

    fish = createFish();
    obstacles = [];
    score = 0;
    frame = 0;

    scoreElement.textContent = score;

    startScreen.style.display = "none";
    gameOverScreen.style.display = "none";

    gameRunning = true;

    jump();
    gameLoop();
}

function jump() {
    if (!gameRunning) return;

    fish.velocity = jumpForce;
}

function createObstacle() {
    const minHeight = 50;
    const maxHeight = canvas.height - obstacleGap - 50;

    const topHeight =
        Math.random() * (maxHeight - minHeight) + minHeight;

    obstacles.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + obstacleGap,
        passed: false
    });
}

function drawBackground() {
    ctx.fillStyle = "#75d5e8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bolhas
    for (let i = 0; i < 12; i++) {
        const x = (i * 97 + frame * 0.4) % canvas.width;
        const y = (i * 83 + frame * 0.7) % canvas.height;

        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.beginPath();
        ctx.arc(x, y, 3 + (i % 4), 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawFish() {
    ctx.save();

    ctx.translate(fish.x, fish.y);

    const rotation = Math.min(
        Math.max(fish.velocity * 0.04, -0.4),
        0.5
    );

    ctx.rotate(rotation);

    // Cauda
    ctx.fillStyle = "#ff9f43";
    ctx.fillRect(-20, -5, 9, 12);
    ctx.fillRect(-25, -9, 7, 7);
    ctx.fillRect(-25, 4, 7, 7);

    // Corpo
    ctx.fillStyle = "#ffbd59";
    ctx.fillRect(-13, -12, 25, 24);
    ctx.fillRect(-8, -16, 16, 4);
    ctx.fillRect(-8, 12, 16, 4);

    // Nadadeira
    ctx.fillStyle = "#f07c38";
    ctx.fillRect(-2, 5, 10, 7);
    ctx.fillRect(1, 2, 5, 3);

    // Olho
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(5, -8, 8, 9);

    ctx.fillStyle = "#222222";
    ctx.fillRect(9, -6, 4, 5);

    ctx.restore();
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        const bottomHeight = canvas.height - obstacle.bottomY;

        // Obstáculo superior
        ctx.fillStyle = "#267d53";
        ctx.fillRect(
            obstacle.x,
            0,
            obstacleWidth,
            obstacle.topHeight
        );

        ctx.fillStyle = "#42b875";
        ctx.fillRect(
            obstacle.x - 5,
            obstacle.topHeight - 15,
            obstacleWidth + 10,
            15
        );

        // Obstáculo inferior
        ctx.fillStyle = "#267d53";
        ctx.fillRect(
            obstacle.x,
            obstacle.bottomY,
            obstacleWidth,
            bottomHeight
        );

        ctx.fillStyle = "#42b875";
        ctx.fillRect(
            obstacle.x - 5,
            obstacle.bottomY,
            obstacleWidth + 10,
            15
        );
    });
}

function updateFish() {
    fish.velocity += gravity;
    fish.y += fish.velocity;

    if (
        fish.y + fish.size / 2 >= canvas.height ||
        fish.y - fish.size / 2 <= 0
    ) {
        endGame();
    }
}

function updateObstacles() {
    if (frame % 95 === 0) {
        createObstacle();
    }

    obstacles.forEach(obstacle => {
        obstacle.x -= obstacleSpeed;

        if (!obstacle.passed && obstacle.x + obstacleWidth < fish.x) {
            obstacle.passed = true;
            score++;

            scoreElement.textContent = score;
        }
    });

    obstacles = obstacles.filter(
        obstacle => obstacle.x + obstacleWidth > 0
    );
}

function checkCollision() {
    const fishLeft = fish.x - fish.size / 2;
    const fishRight = fish.x + fish.size / 2;
    const fishTop = fish.y - fish.size / 2;
    const fishBottom = fish.y + fish.size / 2;

    for (const obstacle of obstacles) {
        const horizontalCollision =
            fishRight > obstacle.x &&
            fishLeft < obstacle.x + obstacleWidth;

        const verticalCollision =
            fishTop < obstacle.topHeight ||
            fishBottom > obstacle.bottomY;

        if (horizontalCollision && verticalCollision) {
            endGame();
            return;
        }
    }
}

function endGame() {
    if (!gameRunning) return;

    gameRunning = false;

    if (score > bestScore) {
        bestScore = score;

        localStorage.setItem("pixelFishBest", bestScore);
        bestScoreElement.textContent = bestScore;
    }

    finalScoreElement.textContent = score;

    gameOverScreen.style.display = "flex";
}

function gameLoop() {
    if (!gameRunning) return;

    frame++;

    drawBackground();

    updateFish();
    updateObstacles();

    drawObstacles();
    drawFish();

    checkCollision();

    if (gameRunning) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Botão jogar
startButton.addEventListener("click", startGame);

// Botão reiniciar
restartButton.addEventListener("click", startGame);

// Controles pelo teclado
document.addEventListener("keydown", event => {
    if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();

        if (gameRunning) {
            jump();
        }
    }
});

// Controles por toque e clique
canvas.addEventListener("pointerdown", event => {
    event.preventDefault();
    jump();
});
