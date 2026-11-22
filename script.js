
// PIXEL FISH - CONFIGURAÇÕES

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const finalScoreElement = document.getElementById("finalScore");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

// VARIÁVEIS DO JOGO

let fish;
let obstacles;
let score;
let gameRunning = false;
let animationId;

const gravity = 0.32;
const jumpForce = -6.5;
const obstacleSpeed = 3.5;
const obstacleGap = 135;
const obstacleWidth = 55;

// CRIANDO O PEIXE

function createFish() {
    fish = {
        x: 90,
        y: 300,
        width: 30,
        height: 22,
        velocity: 0
    };
}

// DESENHANDO O PEIXE EM PIXEL ART

function drawFish() {
    const x = fish.x;
    const y = fish.y;

    ctx.fillStyle = "#ffb52e";

    // Corpo
    ctx.fillRect(x, y + 5, 20, 12);
    ctx.fillRect(x + 5, y, 18, 22);

    // Cauda
    ctx.fillRect(x - 7, y + 7, 7, 8);

    // Nadadeira
    ctx.fillStyle = "#e77d20";
    ctx.fillRect(x + 10, y + 15, 7, 5);

    // Olho
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + 17, y + 4, 5, 5);

    ctx.fillStyle = "#000000";
    ctx.fillRect(x + 19, y + 5, 2, 3);
}

// FUNDO DO OCEANO

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);

    gradient.addColorStop(0, "#0878a5");
    gradient.addColorStop(1, "#032b54");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 600);

    // Bolhas decorativas
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";

    for (let i = 0; i < 12; i++) {
        const x = (i * 73 + 35) % 400;
        const y = (i * 97 + 40) % 600;

        ctx.fillRect(x, y, 5, 5);
        ctx.fillRect(x + 2, y - 3, 2, 3);
    }

    // Fundo do mar
    ctx.fillStyle = "#07543f";
    ctx.fillRect(0, 570, 400, 30);

    ctx.fillStyle = "#0b8052";

    for (let i = 0; i < 400; i += 25) {
        ctx.fillRect(i, 565, 8, 5);
    }
}

// CRIANDO OS OBSTÁCULOS

function createObstacle() {
    const gapPosition = Math.floor(
        Math.random() * 280
    ) + 100;

    obstacles.push({
        x: 400,
        topHeight: gapPosition - obstacleGap / 2,
        bottomY: gapPosition + obstacleGap / 2,
        passed: false
    });
}

// DESENHANDO OS OBSTÁCULOS

function drawObstacles() {
    ctx.fillStyle = "#16834b";

    obstacles.forEach(obstacle => {

        // Alga superior
        ctx.fillRect(
            obstacle.x,
            0,
            obstacleWidth,
            obstacle.topHeight
        );

        // Alga inferior
        ctx.fillRect(
            obstacle.x,
            obstacle.bottomY,
            obstacleWidth,
            600 - obstacle.bottomY - 30
        );

        // Detalhes das algas
        ctx.fillStyle = "#31c76b";

        ctx.fillRect(
            obstacle.x + 8,
            0,
            7,
            obstacle.topHeight
        );

        ctx.fillRect(
            obstacle.x + 8,
            obstacle.bottomY,
            7,
            600 - obstacle.bottomY - 30
        );

        // Pontas das algas
        ctx.fillStyle = "#16834b";

        ctx.fillRect(
            obstacle.x - 5,
            obstacle.topHeight - 8,
            15,
            8
        );

        ctx.fillRect(
            obstacle.x + 35,
            obstacle.bottomY,
            15,
            8
        );

        ctx.fillStyle = "#16834b";
    });
}

// MOVIMENTAÇÃO DOS OBSTÁCULOS

function updateObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.x -= obstacleSpeed;

        // Aumentando a pontuação
        if (!obstacle.passed &&
            obstacle.x + obstacleWidth < fish.x) {

            score++;
            scoreElement.textContent = score;

            obstacle.passed = true;
        }
    });

    // Removendo obstáculos que saíram da tela
    obstacles = obstacles.filter(
        obstacle => obstacle.x + obstacleWidth > 0
    );

    // Criando novos obstáculos
    if (obstacles.length === 0 ||
        obstacles[obstacles.length - 1].x < 215) {

        createObstacle();
    }
}

// MOVIMENTAÇÃO DO PEIXE

function updateFish() {
    fish.velocity += gravity;
    fish.y += fish.velocity;
}

// FAZENDO O PEIXE NADAR

function jump() {
    if (gameRunning) {
        fish.velocity = jumpForce;
    }
}

// DETECTANDO COLISÕES

function checkCollision() {

    // Colisão com o teto ou fundo do oceano
    if (fish.y < 0 ||
        fish.y + fish.height > 570) {

        endGame();
        return;
    }

    // Colisão com os obstáculos
    obstacles.forEach(obstacle => {

        const fishRight = fish.x + fish.width;
        const fishBottom = fish.y + fish.height;

        if (
            fishRight > obstacle.x &&
            fish.x < obstacle.x + obstacleWidth &&
            (
                fish.y < obstacle.topHeight ||
                fishBottom > obstacle.bottomY
            )
        ) {
            endGame();
        }
    });
}

// DESENHANDO O JOGO

function drawGame() {
    drawBackground();
    drawObstacles();
    drawFish();
}

// ATUALIZANDO O JOGO

function gameLoop() {

    if (!gameRunning) return;

    updateFish();
    updateObstacles();
    checkCollision();

    drawGame();

    if (gameRunning) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// INICIANDO A PARTIDA

function startGame() {

    cancelAnimationFrame(animationId);

    createFish();

    obstacles = [];
    score = 0;

    scoreElement.textContent = score;

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    gameRunning = true;

    gameLoop();
}

// FINALIZANDO A PARTIDA

function endGame() {

    gameRunning = false;

    finalScoreElement.textContent = score;

    gameOverScreen.classList.remove("hidden");
}

// EVENTOS DOS BOTÕES

startButton.addEventListener("click", startGame);

restartButton.addEventListener("click", startGame);

// CONTROLES DO JOGADOR

canvas.addEventListener("click", jump);

document.addEventListener("keydown", function(event) {

    if (event.code === "Space" && gameRunning) {
        event.preventDefault();
        jump();
    }

});
