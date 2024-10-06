const grid = document.querySelector(".grid");
const resultDisplay = document.querySelector(".results");
const livesDisplay = document.createElement("div"); // Add lives display element
const pauseOverlay = document.querySelector(".pause-overlay");
const gameOverOverlay = document.getElementById("game-over-overlay");
const gameOverMessage = document.getElementById("game-over-message");
const continueBtn = document.getElementById("continue-btn");
const restartBtn = document.getElementById("restart-btn");
const finalRestartBtn = document.getElementById("final-restart-btn");

let currentShooterIndex = 382; // Shooter starts at the bottom
const width = 20; // Width of the grid
let aliensRemoved = [];
let isGoingRight = true;
let direction = 1;
let results = 0;
let lastTime = 0;
let speed = 600; // Initial speed of aliens
let isPaused = false;
let playerLives = 2; // Player starts with 3 lives
let canShoot = true; // Variable to handle 1-second cooldown for normal shooting
let canSpecialShoot = true; // To track cooldown of special shooting
let isShooting = false; // Track if "Up" arrow is held down for normal shooting
let specialShooting = false; // Track if "Down" arrow is held for special shooting
const normalShootCooldownTime = 1000; // 1-second cooldown for normal shooting
const specialShootCooldownTime = 5000; // 5-second cooldown for special shooting

// Load the images
const invaderImg = new Image();
invaderImg.src = 'images/invader.png';

const shooterImg = new Image();
shooterImg.src = 'images/shooter.png';

// Function to calculate score
function calculateScore() {
    const timeTaken = (endTime - startTime) / 1000;
    const baseScore = 1000;
    const timePenalty = Math.floor(timeTaken) * 5;
    const finalScore = baseScore + results * 100 - timePenalty;
    return Math.max(finalScore, 0);
}

// Function to update the displayed lives
function updateLivesDisplay() {
    livesDisplay.innerHTML = `Lives: ${playerLives}`;
    livesDisplay.classList.add('lives');
    document.body.insertBefore(livesDisplay, document.body.firstChild); // Add lives display to the DOM
}

// Ensure images are loaded before starting the game
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

    let alienInvaders = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
        40, 41, 42, 43, 44, 45, 46, 47, 48, 49
    ];

    updateLivesDisplay(); // Initialize lives display

    // Draw invaders
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

    // Remove invaders
    function remove() {
        for (let i = 0; i < alienInvaders.length; i++) {
            squares[alienInvaders[i]].style.backgroundImage = '';
            squares[alienInvaders[i]].classList.remove("invader");
        }
    }

    // Add shooter to the grid
    function drawShooter() {
        squares[currentShooterIndex].style.backgroundImage = `url(${shooterImg.src})`;
        squares[currentShooterIndex].style.backgroundSize = 'cover';
        squares[currentShooterIndex].style.backgroundRepeat = 'no-repeat';
        squares[currentShooterIndex].classList.add("shooter");
    }

    // Remove shooter from current position
    function removeShooter() {
        squares[currentShooterIndex].style.backgroundImage = '';
        squares[currentShooterIndex].classList.remove("shooter");
    }

    // Move shooter left and right with restricted movement range (middle 60% of the grid)
    function moveShooter(e) {
        removeShooter();

        switch (e.key) {
            case 'ArrowLeft':
                if (currentShooterIndex % width !== Math.floor(width * 0.2)) currentShooterIndex -= 1; // Restrict to left 20% of the grid
                break;
            case 'ArrowRight':
                if (currentShooterIndex % width < Math.ceil(width * 0.8) - 1) currentShooterIndex += 1; // Restrict to right 20% of the grid
                break;
        }

        drawShooter();
    }

    document.addEventListener('keydown', moveShooter);
    drawShooter(); // Initial draw of the shooter

    // Move invaders
    function moveInvaders(timestamp) {
        if (isPaused) return;

        if (!lastTime) lastTime = timestamp;
        const elapsed = timestamp - lastTime;

        // Adjust invader speed dynamically based on number of aliens removed
        let invaderSpeed = Math.max(speed - (aliensRemoved.length * 50), 200);

        if (elapsed > invaderSpeed) {
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

            // Check if invaders reach the shooter
            if (squares[currentShooterIndex].style.backgroundImage.includes('invader.png')) {
                endTime = new Date().getTime();
                gameOver('GAME OVER', false);
                return;
            }

            // Check if all aliens are destroyed
            if (aliensRemoved.length === alienInvaders.length) {
                endTime = new Date().getTime();
                const finalScore = calculateScore();
                gameOver(`YOU WIN! Final Score: ${finalScore}`, true);
                return;
            }

            lastTime = timestamp;
        }

        animationFrameId = requestAnimationFrame(moveInvaders);
    }

    // Invaders shoot lasers at random intervals
    function invaderShoot() {
        let randomInvaderIndex = alienInvaders[Math.floor(Math.random() * alienInvaders.length)];

        // Only shoot if the invader hasn't been removed
        if (!aliensRemoved.includes(alienInvaders.indexOf(randomInvaderIndex))) {
            let laserId;
            let currentLaserIndex = randomInvaderIndex;

            function moveLaserDown() {
                squares[currentLaserIndex].classList.remove("invader-laser");
                currentLaserIndex += width;

                if (currentLaserIndex < width * width) {
                    squares[currentLaserIndex].classList.add("invader-laser");

                    // Check if laser hits the player
                    if (currentLaserIndex === currentShooterIndex) {
                        squares[currentLaserIndex].classList.remove("invader-laser");

                        // Reduce player lives by 1
                        playerLives--;
                        updateLivesDisplay();

                        // Check if player is out of lives
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

    // Function to randomly trigger invader shooting
    function startInvaderShooting() {
        setInterval(invaderShoot, 1000 + Math.random() * 2000); // Invaders shoot between 1 to 3 second intervals
    }

    // Regular shooting (Up arrow) with 1-second cooldown
    function shoot() {
        if (!canShoot) return; // Prevent shooting if in cooldown

        let laserId;
        let currentLaserIndex = currentShooterIndex;

        canShoot = false; // Start 1-second cooldown
        setTimeout(() => canShoot = true, normalShootCooldownTime); // Reset cooldown after 1 second

        function moveLaser() {
            squares[currentLaserIndex].classList.remove("laser");
            currentLaserIndex -= width;

            if (currentLaserIndex >= 0) {
                squares[currentLaserIndex].classList.add("laser");

                // Check for collision with alien
                if (squares[currentLaserIndex].style.backgroundImage.includes('invader.png')) {
                    let alienIndex = alienInvaders.indexOf(currentLaserIndex);
                    aliensRemoved.push(alienIndex);
                    squares[currentLaserIndex].style.backgroundImage = '';
                    squares[currentLaserIndex].classList.remove("laser");

                    cancelAnimationFrame(laserId);
                } else if (currentLaserIndex < 0) {
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
        if (!canSpecialShoot) return; // Prevent special shooting if in cooldown

        canSpecialShoot = false; // Start 5-second cooldown after special shoot
        setTimeout(() => canSpecialShoot = true, specialShootCooldownTime);

        let shots = 3; // Number of consecutive shots

        function fireSpecialShot() {
            if (shots === 0) return; // Stop after 3 shots

            let laserId;
            let currentLaserIndex = currentShooterIndex;

            function moveLaser() {
                squares[currentLaserIndex].classList.remove("laser");
                currentLaserIndex -= width;

                if (currentLaserIndex >= 0) {
                    squares[currentLaserIndex].classList.add("laser");

                    // Check for collision with alien
                    if (squares[currentLaserIndex].style.backgroundImage.includes('invader.png')) {
                        let alienIndex = alienInvaders.indexOf(currentLaserIndex);
                        aliensRemoved.push(alienIndex);
                        squares[currentLaserIndex].style.backgroundImage = '';
                        squares[currentLaserIndex].classList.remove("laser");

                        cancelAnimationFrame(laserId);
                    } else if (currentLaserIndex < 0) {
                        cancelAnimationFrame(laserId);
                    } else {
                        laserId = requestAnimationFrame(moveLaser);
                    }
                }
            }

            shots--;
            laserId = requestAnimationFrame(moveLaser);

            // Fire next shot with almost no delay to simulate one heavy shot
            setTimeout(fireSpecialShot, 50); // Delay between each shot set to 50ms
        }

        fireSpecialShot(); // Start the first special shot
    }

    // Event listeners for continuous shooting and special shooting
    document.addEventListener('keydown', (e) => {
        if (e.key === "ArrowUp" && !isShooting) {
            isShooting = true;
            shoot();
        }

        if (e.key === "ArrowDown" && !specialShooting && canSpecialShoot) {
            specialShooting = true;
            specialShoot();
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

    // Start the game timer
    startTime = new Date().getTime();

    // Start the animation for moving invaders and their shooting
    animationFrameId = requestAnimationFrame(moveInvaders);
    startInvaderShooting(); // Start invader shooting

    function gameOver(message, isWin) {
        gameOverMessage.innerHTML = message;
        gameOverOverlay.style.display = "block";
        cancelAnimationFrame(animationFrameId); // Stop invader movement
    }

    continueBtn.addEventListener("click", () => {
        isPaused = false;
        pauseOverlay.style.display = "none";
        requestAnimationFrame(moveInvaders);
    });

    restartBtn.addEventListener("click", () => {
        location.reload();
    });

    finalRestartBtn.addEventListener("click", () => {
        location.reload();
    });
}
