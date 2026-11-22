
/* =========================
   PIXEL FISH
   GAME VERSION 1.1
========================= */

// ELEMENTOS HTML

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const bestScoreElement = document.getElementById("bestScore");
const finalScoreElement = document.getElementById("finalScore");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const recordMessage = document.getElementById("recordMessage");

// CONFIGURAÇÕES

const gravity = 0.34;
const jumpForce = -6.5;

const obstacleSpeed = 3.6;
const obstacleGap = 135;
const obstacleWidth = 55;

let gameRunning = false;
let animationId;

let fish;
let obstacles = [];
let bubbles = [];
let particles = [];

let score = 0;
let fishAnimation = 0;

// RECORDE SALVO NO NAVEGADOR

let bestScore = 0;

try {
    bestScore = Number(
        localStorage.getItem("pixelFishRecord")
    ) || 0;
} catch (error) {
    bestScore = 0;
}

bestScoreElement.textContent = bestScore;


/* =========================
   CRIANDO O PEIXE
========================= */

function createFish() {

    fish = {
        x: 90,
        y: 280,
        width: 30,
        height: 22,
        velocity: 0
    };

}


/* =========================
   DESENHANDO O PEIXE
========================= */

function drawFish() {

    const x = Math.round(fish.x);
    const y = Math.round(fish.y);

    fishAnimation++;

    // CORPO

    ctx.fillStyle = "#ffb52e";

    ctx.fillRect(x, y + 5, 20, 12);
    ctx.fillRect(x + 5, y, 18, 22);

    // CAUDA ANIMADA

    ctx.fillStyle = "#e77d20";

    if (Math.floor(fishAnimation / 8) % 2 === 0) {
        ctx.fillRect(x - 7, y + 7, 7, 8);
    } else {
        ctx.fillRect(x - 9, y + 4, 9, 8);
    }

    // NADDEIRA

    ctx.fillStyle = "#e77d20";
    ctx.fillRect(x + 10, y + 15, 7, 5);

    // OLHO

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + 17, y + 4, 5, 5);

    ctx.fillStyle = "#111111";
    ctx.fillRect(x + 19, y + 5, 2, 3);

}


/* =========================
   CRIANDO AS BOLHAS
========================= */

function createBubbles() {

    bubbles = [];

    for (let i = 0; i < 25; i++) {

        bubbles.push({
            x: Math.random() * 400,
            y: Math.random() * 600,
            size: Math.random() * 4 + 2,
            speed: Math.random() * 0.8 + 0.3
        });

    }

}


/* =========================
   ATUALIZANDO AS BOLHAS
========================= */

function updateBubbles() {

    bubbles.forEach(bubble => {

        bubble.y -= bubble.speed;

        if (bubble.y < -10) {

            bubble.y = 610;
            bubble.x = Math.random() * 400;

        }

    });

}


/* =========================
   DESENHANDO O FUNDO
========================= */

function drawBackground() {

    const gradient = ctx.createLinearGradient(
        0, 0, 0, 600
    );

    gradient.addColorStop(0, "#0878a5");
    gradient.addColorStop(1, "#032b54");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 600);

    // LUZES DO OCEANO

    ctx.fillStyle = "rgba(90, 220, 255, 0.07)";

    ctx.fillRect(40, 0, 30, 570);
    ctx.fillRect(250, 0, 45, 570);

    // BOLHAS

    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 2;

    bubbles.forEach(bubble => {

        ctx.beginPath();

        ctx.arc(
            bubble.x,
            bubble.y,
            bubble.size,
            0,
            Math.PI * 2
        );

        ctx.stroke();

    });

    // FUNDO DO MAR

    ctx.fillStyle = "#07543f";
    ctx.fillRect(0, 570, 400, 30);

    ctx.fillStyle = "#0b8052";

    for (let i = 0; i < 400; i += 25) {

        ctx.fillRect(i, 565, 8, 5);

    }

}


/* =========================
   CRIANDO OS OBSTÁCULOS
========================= */

function createObstacle() {

    const gapPosition =
        Math.floor(Math.random() * 250) + 150;

    obstacles.push({

        x: 400,

        topHeight: gapPosition - obstacleGap / 2,

        bottomY: gapPosition + obstacleGap / 2,

        passed: false

    });

}


/* =========================
   DESENHANDO AS ALGAS
========================= */

function drawObstacles() {

    obstacles.forEach(obstacle => {

        const topHeight = obstacle.topHeight;
        const bottomHeight = 570 - obstacle.bottomY;

        // ALGAS SUPERIORES

        ctx.fillStyle = "#126b43";

        ctx.fillRect(
            obstacle.x,
            0,
            obstacleWidth,
            topHeight
        );

        // ALGAS INFERIORES

        ctx.fillRect(
            obstacle.x,
            obstacle.bottomY,
            obstacleWidth,
            bottomHeight
        );

        // DETALHES SUPERIORES

        ctx.fillStyle = "#31c76b";

        ctx.fillRect(
            obstacle.x + 10,
            0,
            7,
            topHeight
        );

        ctx.fillRect(
            obstacle.x + 35,
            0,
            5,
            topHeight
        );

        // DETALHES INFERIORES

        ctx.fillRect(
            obstacle.x + 10,
            obstacle.bottomY,
            7,
            bottomHeight
        );

        ctx.fillRect(
            obstacle.x + 35,
            obstacle.bottomY,
            5,
            bottomHeight
        );

        // PONTAS DAS ALGAS

        ctx.fillStyle = "#16834b";

        ctx.fillRect(
            obstacle.x - 5,
            topHeight - 8,
            15,
            8
        );

        ctx.fillRect(
            obstacle.x + 35,
            bottomY + obstacle.bottomY - 570,
            15,
            8
        );

    });

}


/* =========================
   MOVIMENTAÇÃO DOS OBSTÁCULOS
========================= */

function updateObstacles() {

    obstacles.forEach(obstacle => {

        obstacle.x -= obstacleSpeed;

        // PONTUAÇÃO

        if (
            !obstacle.passed &&
            obstacle.x + obstacleWidth < fish.x
        ) {

            score++;

            scoreElement.textContent = score;

            obstacle.passed = true;

            createScoreParticles();

        }

    });

    // REMOVENDO OBSTÁCULOS ANTIGOS

    obstacles = obstacles.filter(
        obstacle => obstacle.x + obstacleWidth > 0
    );

    // CRIANDO NOVOS OBSTÁCULOS

    if (
        obstacles.length === 0 ||
        obstacles[obstacles.length - 1].x < 210
    ) {

        createObstacle();

    }

}


/* =========================
   MOVIMENTAÇÃO DO PEIXE
========================= */

function updateFish() {

    fish.velocity += gravity;

    fish.y += fish.velocity;

}


/* =========================
   FAZENDO O PEIXE NADAR
========================= */

function jump() {

    if (!gameRunning) return;

    fish.velocity = jumpForce;

}


/* =========================
   PARTÍCULAS DE PONTUAÇÃO
========================= */

function createScoreParticles() {

    for (let i = 0; i < 8; i++) {

        particles.push({

            x: fish.x + 15,
            y: fish.y + 10,

            velocityX: (Math.random() - 0.5) * 3,
            velocityY: (Math.random() - 0.5) * 3,

            life: 25

        });

    }

}


function updateParticles() {

    particles.forEach(particle => {

        particle.x += particle.velocityX;
        particle.y += particle.velocityY;

        particle.life--;

    });

    particles = particles.filter(
        particle => particle.life > 0
    );

}


function drawParticles() {

    ctx.fillStyle = "#ffe66d";

    particles.forEach(particle => {

        ctx.fillRect(
            particle.x,
            particle.y,
            4,
            4
        );

    });

}


/* =========================
   DETECTANDO COLISÕES
========================= */

function checkCollision() {

    // TETO E FUNDO

    if (
        fish.y < 0 ||
        fish.y + fish.height > 570
    ) {

        endGame();
        return;

    }

    // COLISÃO COM AS ALGAS

    obstacles.forEach(obstacle => {

        if (!gameRunning) return;

        const margin = 4;

        const fishLeft = fish.x + margin;
        const fishRight = fish.x + fish.width - margin;

        const fishTop = fish.y + margin;
        const fishBottom = fish.y + fish.height - margin;

        const obstacleRight = obstacle.x + obstacleWidth;

        const horizontalCollision =
            fishRight > obstacle.x &&
            fishLeft < obstacleRight;

        const verticalCollision =
            fishTop < obstacle.topHeight ||
            fishBottom > obstacle.bottomY;

        if (horizontalCollision && verticalCollision) {

            endGame();

        }

    });

}


/* =========================
   DESENHANDO O JOGO
========================= */

function drawGame() {

    drawBackground();

    drawObstacles();

    drawParticles();

    drawFish();

}


/* =========================
   ATUALIZANDO O JOGO
========================= */

function gameLoop() {

    if (!gameRunning) return;

    updateFish();

    updateObstacles();

    updateBubbles();

    updateParticles();

    checkCollision();

    drawGame();

    if (gameRunning) {

        animationId = requestAnimationFrame(gameLoop);

    }

}


/* =========================
   INICIANDO A PARTIDA
========================= */

function startGame() {

    cancelAnimationFrame(animationId);

    createFish();

    obstacles = [];
    particles = [];

    score = 0;

    fishAnimation = 0;

    scoreElement.textContent = score;

    createBubbles();

    createObstacle();

    startScreen.classList.add("hidden");

    gameOverScreen.classList.add("hidden");

    gameRunning = true;

    gameLoop();

}


/* =========================
   FINALIZANDO A PARTIDA
========================= */

function endGame() {

    if (!gameRunning) return;

    gameRunning = false;

    cancelAnimationFrame(animationId);

    finalScoreElement.textContent = score;

    // VERIFICANDO NOVO RECORDE

    if (score > bestScore) {

        bestScore = score;

        try {

            localStorage.setItem(
                "pixelFishRecord",
                bestScore
            );

        } catch (error) {

            console.log("Não foi possível salvar o recorde.");

        }

        bestScoreElement.textContent = bestScore;

        recordMessage.textContent = "NOVO RECORDE!";

    } else {

        recordMessage.textContent = "Continue tentando!";

    }

    gameOverScreen.classList.remove("hidden");

    drawGame();

}


/* =========================
   CONTROLES DO JOGO
========================= */

// BOTÕES

startButton.addEventListener("click", startGame);

restartButton.addEventListener("click", startGame);


// TECLADO

document.addEventListener("keydown", function(event) {

    if (event.code === "Space") {

        event.preventDefault();

        if (gameRunning) {

            jump();

        }

    }

});


// CLIQUE E TOQUE NA TELA

canvas.addEventListener("pointerdown", function(event) {

    event.preventDefault();

    jump();

});


/* =========================
   TELA INICIAL
========================= */

createFish();

createBubbles();

drawGame();
