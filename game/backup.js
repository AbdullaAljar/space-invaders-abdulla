const grid = document.querySelector(".grid");
const resultDisplay = document.querySelector(".results");
const livesDisplay = document.createElement("div");
const countdownDisplay = document.querySelector('.countdown');
const pauseOverlay = document.querySelector(".pause-overlay");
const gameOverOverlay = document.getElementById("game-over-overlay");
const gameOverMessage = document.getElementById("game-over-message");
const continueBtn = document.getElementById("continue-btn");
const restartBtn = document.getElementById("restart-btn");
const finalRestartBtn = document.getElementById("final-restart-btn");

let currentShooterIndex = 382;
const width = 20;
let alienInvaders = []; // Declared globally to avoid scope issues
let aliensRemoved = [];
let isGoingRight = true;
let direction = 1;
let results = 0;
let speed = 600;
let isPaused = false;
let playerLives = 3;
let score = 0;
let startTime = new Date().getTime();
let totalTime = 45;
let remainingTime = totalTime;
let countdownInterval;
let invaderLaserIntervals = [];
let canShoot = true;
let canSpecialShoot = true;
let isShooting = false;
let specialShooting = false;
let animationFrameId;
const normalShootCooldownTime = 1000;
const specialShootCooldownTime = 5000; // 5-second cooldown for special shooting
const targetFPS = 60;
const frameDuration = 1000 / targetFPS;
let lastTimestamp = 0;
let lastMoveTime = 0;
let invaderMoveInterval = 500;
const minMoveInterval = 100;

// Load the images
const invaderImg = new Image();
invaderImg.src = 'images/invader.png';

const shooterImg = new Image();
shooterImg.src = 'images/shooter.png';

// Function to calculate score in real-time
function updateScore() {
    const currentTime = new Date().getTime();
    const timeElapsed = (currentTime - startTime) / 1000;
    const timePenalty = Math.floor(timeElapsed * 5);
    const points = 100 - timePenalty;
    score += Math.max(points, 10);
    resultDisplay.innerHTML = `Score: ${score}`;
}

// Function to update the displayed lives
function updateLivesDisplay() {
    livesDisplay.innerHTML = `Lives: ${playerLives}`;
    livesDisplay.classList.add('lives');
    document.body.insertBefore(livesDisplay, document.body.firstChild);
}

// Function to update the countdown timer
function updateCountdown() {
    if (remainingTime > 0 && !isPaused) {
        remainingTime--;
        countdownDisplay.innerHTML = `Time Left: ${remainingTime}s`;
    } else if (remainingTime <= 0) {
        clearInterval(countdownInterval);
        gameOver('TIME UP! Game Over', false);
    }
}

Promise.all([
    new Promise((resolve) => invaderImg.onload = resolve),
    new Promise((resolve) => shooterImg.onload = resolve)
]).then(() => {
    createGrid();
    startGame();
});

function createGrid() {
    for (let i = 0; i < width * width; i++) {
        const square = document.createElement("div");
        grid.appendChild(square);
    }
}

function startGame() {
    const squares = Array.from(document.querySelectorAll(".grid div"));

    // Initialize alien invaders globally
    alienInvaders = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
        40, 41, 42, 43, 44, 45, 46, 47, 48, 49
    ];

    updateLivesDisplay();
    countdownInterval = setInterval(updateCountdown, 1000);

    function draw() {
        for (let i = 0; i < alienInvaders.length; i++) {
            if (!aliensRemoved.includes(i)) {
                squares[alienInvaders[i]].style.backgroundImage = `url(${invaderImg.src})`;
                squares[alienInvaders[i]].style.backgroundSize = 'cover';
                squares[alienInvaders[i]].style.backgroundRepeat = 'no-repeat';
                squares[alienInvaders[i]].classList.add("invader");
            }
        }
    }

    function remove() {
        for (let i = 0; i < alienInvaders.length; i++) {
            squares[alienInvaders[i]].style.backgroundImage = '';
            squares[alienInvaders[i]].classList.remove("invader");
        }
    }

    function drawShooter() {
        squares[currentShooterIndex].style.backgroundImage = `url(${shooterImg.src})`;
        squares[currentShooterIndex].style.backgroundSize = 'cover';
        squares[currentShooterIndex].style.backgroundRepeat = 'no-repeat';
        squares[currentShooterIndex].classList.add("shooter");
    }

    function removeShooter() {
        squares[currentShooterIndex].style.backgroundImage = '';
        squares[currentShooterIndex].classList.remove("shooter");
    }

    function moveShooter(e) {
        if (isPaused) return;

        removeShooter();
        switch (e.key) {
            case 'ArrowLeft':
                if (currentShooterIndex % width !== 0) currentShooterIndex -= 1;
                break;
            case 'ArrowRight':
                if (currentShooterIndex % width < width - 1) currentShooterIndex += 1;
                break;
        }
        drawShooter();
    }

    document.addEventListener('keydown', moveShooter);
    drawShooter();

    function moveInvaders(timestamp) {
        if (isPaused) return;

        const elapsed = timestamp - lastTimestamp;

        if (elapsed > frameDuration) {
            const timeSinceLastMove = timestamp - lastMoveTime;
            if (timeSinceLastMove > invaderMoveInterval) {
                const leftEdge = alienInvaders[0] % width === 0;
                const rightEdge = alienInvaders[alienInvaders.length - 1] % width === width - 1;
                remove();

                if (rightEdge && isGoingRight) {
                    for (let i = 0; i < alienInvaders.length; i++) {
                        alienInvaders[i] += width;
                    }
                    direction = -1;
                    isGoingRight = false;
                }

                if (leftEdge && !isGoingRight) {
                    for (let i = 0; i < alienInvaders.length; i++) {
                        alienInvaders[i] += width;
                    }
                    direction = 1;
                    isGoingRight = true;
                }

                for (let i = 0; i < alienInvaders.length; i++) {
                    alienInvaders[i] += direction;
                }

                draw();

                if (alienInvaders.some(invader => invader >= (width * (width - 1)))) {
                    gameOver('GAME OVER - Invaders reached the shooter\'s row', false);
                    return;
                }

                if (squares[currentShooterIndex].style.backgroundImage.includes('invader.png')) {
                    gameOver('GAME OVER', false);
                    return;
                }

                if (aliensRemoved.length === alienInvaders.length) {
                    gameOver('YOU WIN!', true);
                    return;
                }

                lastMoveTime = timestamp;
            }

            lastTimestamp = timestamp;
        }

        animationFrameId = requestAnimationFrame(moveInvaders);
    }

    function shoot() {
        if (!canShoot) return;

        let laserId;
        let currentLaserIndex = currentShooterIndex;

        canShoot = false;
        setTimeout(() => canShoot = true, normalShootCooldownTime);

        function moveLaser() {
            if (isPaused) return;

            squares[currentLaserIndex].classList.remove("laser");
            currentLaserIndex -= width;

            if (currentLaserIndex >= 0) {
                squares[currentLaserIndex].classList.add("laser");

                if (squares[currentLaserIndex].style.backgroundImage.includes('invader.png')) {
                    let alienIndex = alienInvaders.indexOf(currentLaserIndex);
                    aliensRemoved.push(alienIndex);
                    squares[currentLaserIndex].style.backgroundImage = '';
                    squares[currentLaserIndex].classList.remove("laser");

                    updateScore();

                    if (invaderMoveInterval > minMoveInterval) {
                        invaderMoveInterval -= 20;
                    }

                    cancelAnimationFrame(laserId);
                } else {
                    laserId = requestAnimationFrame(moveLaser);
                }
            }
        }

        laserId = requestAnimationFrame(moveLaser);
    }

    // Special shooting (Down arrow) with 3 shots and 5-second cooldown
    function specialShoot() {
        if (!canSpecialShoot) return;

        canSpecialShoot = false;
        setTimeout(() => canSpecialShoot = true, specialShootCooldownTime);

        let shots = 3; // Number of consecutive shots

        function fireSpecialShot() {
            if (shots === 0) return;

            let laserId;
            let currentLaserIndex = currentShooterIndex;

            function moveLaser() {
                if (isPaused) return;

                squares[currentLaserIndex].classList.remove("laser");
                currentLaserIndex -= width;

                if (currentLaserIndex >= 0) {
                    squares[currentLaserIndex].classList.add("laser");

                    if (squares[currentLaserIndex].style.backgroundImage.includes('invader.png')) {
                        let alienIndex = alienInvaders.indexOf(currentLaserIndex);
                        aliensRemoved.push(alienIndex);
                        squares[currentLaserIndex].style.backgroundImage = '';
                        squares[currentLaserIndex].classList.remove("laser");

                        updateScore();

                        cancelAnimationFrame(laserId);
                    } else {
                        laserId = requestAnimationFrame(moveLaser);
                    }
                }
            }

            shots--;
            laserId = requestAnimationFrame(moveLaser);

            setTimeout(fireSpecialShot, 50);
        }

        fireSpecialShot();
    }

    function togglePause(e) {
        if (e.key === "Escape" || e.key.toLowerCase() === "p") {
            isPaused = !isPaused;

            if (isPaused) {
                pauseOverlay.style.display = "block";
                cancelAnimationFrame(animationFrameId);
                clearInterval(countdownInterval);
                invaderLaserIntervals.forEach(interval => clearInterval(interval));
            } else {
                pauseOverlay.style.display = "none";
                countdownInterval = setInterval(updateCountdown, 1000);
                requestAnimationFrame(moveInvaders);
                startInvaderShooting();
            }
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === "ArrowUp" && !isShooting) {
            isShooting = true;
            shoot();
        }

        if (e.key === "ArrowDown" && !specialShooting && canSpecialShoot) {
            specialShooting = true;
            specialShoot();
        }

        if (e.key === "Escape" || e.key.toLowerCase() === "p") {
            togglePause(e);
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === "ArrowUp") {
            isShooting = false;
        }

        if (e.key === "ArrowDown") {
            specialShooting = false;
        }
    });

    startTime = new Date().getTime();
    animationFrameId = requestAnimationFrame(moveInvaders);
    startInvaderShooting();
}

// Function to handle game over
function gameOver(message, isWin) {
    gameOverMessage.innerHTML = message;
    gameOverOverlay.style.display = "block";
    clearInterval(countdownInterval);
    cancelAnimationFrame(animationFrameId);
    invaderLaserIntervals.forEach(interval => clearInterval(interval));
    document.removeEventListener('keydown', moveShooter);
    document.removeEventListener('keydown', shoot);
    document.removeEventListener('keydown', specialShoot);
}

// Function to start invader shooting with random intervals
function startInvaderShooting() {
    invaderLaserIntervals.push(setInterval(() => {
        invaderShoot();
    }, 1000 + Math.random() * 2000)); // Randomized shooting intervals
}

// Function to handle invader shooting
function invaderShoot() {
    const squares = Array.from(document.querySelectorAll(".grid div"));

    let randomInvaderIndex = alienInvaders[Math.floor(Math.random() * alienInvaders.length)];

    // Ensure the invader is not removed before it shoots
    if (!aliensRemoved.includes(alienInvaders.indexOf(randomInvaderIndex))) {
        let laserId;
        let currentLaserIndex = randomInvaderIndex;

        function moveLaserDown() {
            if (isPaused) return;

            squares[currentLaserIndex].classList.remove("invader-laser");
            currentLaserIndex += width; // Move the laser one row down

            if (currentLaserIndex < width * width) {
                squares[currentLaserIndex].classList.add("invader-laser");

                // Check if the laser hits the shooter
                if (currentLaserIndex === currentShooterIndex) {
                    squares[currentLaserIndex].classList.remove("invader-laser");
                    playerLives--;
                    updateLivesDisplay();

                    // End the game if lives are exhausted
                    if (playerLives === 0) {
                        gameOver('GAME OVER - You were hit 3 times!', false);
                    }

                    cancelAnimationFrame(laserId);
                } else {
                    laserId = requestAnimationFrame(moveLaserDown);
                }
            } else {
                // Remove the laser when it goes out of bounds
                squares[currentLaserIndex].classList.remove("invader-laser");
                cancelAnimationFrame(laserId);
            }
        }

        laserId = requestAnimationFrame(moveLaserDown);
    }
}

continueBtn.addEventListener("click", () => {
    isPaused = false;
    pauseOverlay.style.display = "none";
    requestAnimationFrame(moveInvaders);
    countdownInterval = setInterval(updateCountdown, 1000);
    startInvaderShooting();
});

restartBtn.addEventListener("click", () => {
    location.reload();
});

finalRestartBtn.addEventListener("click", () => {
    location.reload();
});
