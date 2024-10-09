const grid = document.querySelector(".grid");
const resultDisplay = document.querySelector(".results");
const livesDisplay = document.createElement("div");
const countdownDisplay = document.querySelector('.countdown');
const pauseOverlay = document.getElementById("pause-overlay");
const gameOverOverlay = document.getElementById("game-over-overlay");
const gameOverMessage = document.getElementById("game-over-message");
const continueBtn = document.getElementById("continue-btn");
const restartBtn = document.getElementById("restart-btn");
const finalRestartBtn = document.getElementById("final-restart-btn");
const startGameBtn = document.getElementById("start-game-btn");
const startGameOverlay = document.getElementById("start-game-overlay");

let currentShooterIndex = 382;
const width = 20;
let alienInvaders = [];
let aliensRemoved = [];
let isGoingRight = true;
let direction = 1;
let isPaused = false;
let isGameStarted = false;
let playerLives = 3;
let score = 0;
let totalTime = 45;
let remainingTime = totalTime;
let countdownInterval;
let invaderLaserIntervals = [];
let canShoot = true;
let canSpecialShoot = true;
let animationFrameId;
let startTime = new Date().getTime(); // Used to calculate time-based scoring
const normalShootCooldownTime = 1000;
const specialShootCooldownTime = 5000;
let invaderMoveInterval = 500;
const minMoveInterval = 100;

const invaderImg = new Image();
invaderImg.src = 'images/invader.png';

const shooterImg = new Image();
shooterImg.src = 'images/shooter.png';

// Wait until images are loaded to start the game setup
Promise.all([
    new Promise((resolve) => invaderImg.onload = resolve),
    new Promise((resolve) => shooterImg.onload = resolve)
]).then(() => {
    createGrid();
    updateLivesDisplay();
    resultDisplay.innerHTML = `Score: ${score}`;
});

// Function to create the game grid
function createGrid() {
    for (let i = 0; i < width * width; i++) {
        const square = document.createElement("div");
        grid.appendChild(square);
    }
}

// Function to start the game
function startGame() {
    if (isGameStarted) return;
    isGameStarted = true;
    startGameOverlay.style.display = "none";
    isPaused = false;
    startTime = new Date().getTime(); // Start the timer

    const squares = Array.from(document.querySelectorAll(".grid div"));

    alienInvaders = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
        40, 41, 42, 43, 44, 45, 46, 47, 48, 49
    ];

    draw();
    drawShooter();
    countdownInterval = setInterval(updateCountdown, 1000);
    animationFrameId = requestAnimationFrame(moveInvaders);
    startInvaderShooting();
}

// Function to toggle pause
function togglePause(e) {
    if (e.key === "Escape" || e.key.toLowerCase() === "p") {
        if (!isGameStarted) return;
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

// Function to update the lives display
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

// Function to draw the alien invaders
function draw() {
    const squares = Array.from(document.querySelectorAll(".grid div"));
    for (let i = 0; i < alienInvaders.length; i++) {
        if (!aliensRemoved.includes(i)) {
            squares[alienInvaders[i]].style.backgroundImage = `url(${invaderImg.src})`;
            squares[alienInvaders[i]].style.backgroundSize = 'cover';
            squares[alienInvaders[i]].style.backgroundRepeat = 'no-repeat';
            squares[alienInvaders[i]].classList.add("invader");
        }
    }
}

// Function to remove alien invaders from the grid
function remove() {
    const squares = Array.from(document.querySelectorAll(".grid div"));
    for (let i = 0; i < alienInvaders.length; i++) {
        squares[alienInvaders[i]].style.backgroundImage = '';
        squares[alienInvaders[i]].classList.remove("invader");
    }
}

// Function to draw the shooter
function drawShooter() {
    const squares = Array.from(document.querySelectorAll(".grid div"));
    squares[currentShooterIndex].style.backgroundImage = `url(${shooterImg.src})`;
    squares[currentShooterIndex].style.backgroundSize = 'cover';
    squares[currentShooterIndex].style.backgroundRepeat = 'no-repeat';
    squares[currentShooterIndex].classList.add("shooter");
}

// Function to remove the shooter from the grid
function removeShooter() {
    const squares = Array.from(document.querySelectorAll(".grid div"));
    squares[currentShooterIndex].style.backgroundImage = '';
    squares[currentShooterIndex].classList.remove("shooter");
}

// Function to move the shooter based on keypress
function moveShooter(e) {
    if (isPaused) return;

    const squares = Array.from(document.querySelectorAll(".grid div"));
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

// Function to move the alien invaders
function moveInvaders(timestamp) {
    if (isPaused) return;

    const squares = Array.from(document.querySelectorAll(".grid div"));
    const elapsed = timestamp - lastTimestamp;

    if (elapsed > 1000 / 60) { // Frame duration adjustment
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

// Function to handle shooting
function shoot(e) {
    if (e.key === 'ArrowUp' && canShoot) {
        let laserId;
        let currentLaserIndex = currentShooterIndex;
        const squares = Array.from(document.querySelectorAll(".grid div"));

        canShoot = false;
        setTimeout(() => canShoot = true, normalShootCooldownTime);

        function moveLaser() {
            if (isPaused) return;

            squares[currentLaserIndex].classList.remove("laser");
            currentLaserIndex -= width;

            if (currentLaserIndex >= 0) {
                squares[currentLaserIndex].classList.add("laser");

                // Check for collision with alien invaders
                if (squares[currentLaserIndex].style.backgroundImage.includes('invader.png')) {
                    let alienIndex = alienInvaders.indexOf(currentLaserIndex);
                    aliensRemoved.push(alienIndex);
                    squares[currentLaserIndex].style.backgroundImage = '';
                    squares[currentLaserIndex].classList.remove("laser");

                    updateScore(); // Update score when invader is hit

                    if (invaderMoveInterval > minMoveInterval) {
                        invaderMoveInterval -= 20; // Increase speed as aliens are removed
                    }

                    cancelAnimationFrame(laserId);
                } else {
                    laserId = requestAnimationFrame(moveLaser);
                }
            } else {
                squares[currentLaserIndex].classList.remove("laser");
                cancelAnimationFrame(laserId);
            }
        }

        laserId = requestAnimationFrame(moveLaser);
    }

    // Handle special triple shooting with the down key
    if (e.key === 'ArrowDown' && canSpecialShoot) {
        canSpecialShoot = false;
        setTimeout(() => canSpecialShoot = true, specialShootCooldownTime);

        let shots = 3; // Number of consecutive shots
        let currentLaserIndex = currentShooterIndex;

        function fireTripleShot() {
            if (shots === 0) return; // Stop after 3 shots

            let laserId;
            currentLaserIndex = currentShooterIndex;

            function moveLaser() {
                if (isPaused) return;

                const squares = Array.from(document.querySelectorAll(".grid div"));
                squares[currentLaserIndex].classList.remove("laser");
                currentLaserIndex -= width;

                if (currentLaserIndex >= 0) {
                    squares[currentLaserIndex].classList.add("laser");

                    // Check for collision with alien invaders
                    if (squares[currentLaserIndex].style.backgroundImage.includes('invader.png')) {
                        let alienIndex = alienInvaders.indexOf(currentLaserIndex);
                        aliensRemoved.push(alienIndex);
                        squares[currentLaserIndex].style.backgroundImage = '';
                        squares[currentLaserIndex].classList.remove("laser");

                        updateScore(); // Update score when invader is hit

                        if (invaderMoveInterval > minMoveInterval) {
                            invaderMoveInterval -= 20; // Increase speed as aliens are removed
                        }

                        cancelAnimationFrame(laserId);
                    } else {
                        laserId = requestAnimationFrame(moveLaser);
                    }
                } else {
                    squares[currentLaserIndex].classList.remove("laser");
                    cancelAnimationFrame(laserId);
                }
            }

            // Fire the next shot after the same delay as the single shot
            shots--;
            laserId = requestAnimationFrame(moveLaser);
            setTimeout(fireTripleShot, normalShootCooldownTime); // Same cooldown as normal shot
        }

        fireTripleShot(); // Start triple shooting
    }
}

// Function to update score
function updateScore() {
    let currentTime = new Date().getTime();
    let timeElapsed = (currentTime - startTime) / 1000; // Time elapsed in seconds
    let baseScore = 100; // Base score for hitting an invader
    let timePenalty = Math.floor(timeElapsed); // Subtract points based on how much time has passed
    let pointsEarned = Math.max(baseScore - timePenalty, 10); // Ensure score doesn't drop below 10

    score += pointsEarned; // Add calculated points to the score
    resultDisplay.innerHTML = `Score: ${score}`;
}

// Function to handle the game over logic
function gameOver(message, isWin) {
    gameOverMessage.innerHTML = message;
    gameOverOverlay.style.display = "block";
    clearInterval(countdownInterval);
    cancelAnimationFrame(animationFrameId);
    invaderLaserIntervals.forEach(interval => clearInterval(interval));
    document.removeEventListener('keydown', moveShooter);
}

// Function to start invader shooting at random intervals
function startInvaderShooting() {
    invaderLaserIntervals.push(setInterval(() => {
        invaderShoot();
    }, 1000 + Math.random() * 2000));
}

// Function to handle invader shooting
function invaderShoot() {
    const squares = Array.from(document.querySelectorAll(".grid div"));

    let randomInvaderIndex = alienInvaders[Math.floor(Math.random() * alienInvaders.length)];

    if (!aliensRemoved.includes(alienInvaders.indexOf(randomInvaderIndex))) {
        let laserId;
        let currentLaserIndex = randomInvaderIndex;

        function moveLaserDown() {
            if (isPaused) return;

            squares[currentLaserIndex].classList.remove("invader-laser");
            currentLaserIndex += width;

            if (currentLaserIndex < width * width) {
                squares[currentLaserIndex].classList.add("invader-laser");

                if (currentLaserIndex === currentShooterIndex) {
                    squares[currentLaserIndex].classList.remove("invader-laser");
                    playerLives--;
                    updateLivesDisplay();

                    if (playerLives === 0) {
                        gameOver('GAME OVER - You were hit 3 times!', false);
                    }

                    cancelAnimationFrame(laserId);
                } else {
                    laserId = requestAnimationFrame(moveLaserDown);
                }
            } else {
                squares[currentLaserIndex].classList.remove("invader-laser");
                cancelAnimationFrame(laserId);
            }
        }

        laserId = requestAnimationFrame(moveLaserDown);
    }
}

// Event listeners for starting the game
startGameBtn.addEventListener("click", () => {
    startGame();
});

document.addEventListener('keydown', moveShooter);
document.addEventListener('keydown', shoot);
document.addEventListener('keydown', togglePause);

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
