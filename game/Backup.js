/*
const grid = document.querySelector(".grid"); // Select the grid element
const resultDisplay = document.querySelector(".results"); // Select the results display element
let currentShooterIndex = 202; // Initial position of the shooter
const width = 15; // Width of the grid
const aliensRemoved = []; // Array to keep track of removed aliens
let isGoingRight = true; // Flag to check if invaders are moving right
let direction = 1; // Direction of invader movement (1 for right, -1 for left)
let results = 0; // Player's score
let lastTime = 0; // Timestamp of the last frame
const speed = 600; // Speed of invader movement in milliseconds

// Create the grid squares
for (let i = 0; i < width * width; i++) {
    const square = document.createElement("div"); // Create a new div element
    grid.appendChild(square); // Append the div to the grid
}

const squares = Array.from(document.querySelectorAll(".grid div")); // Convert NodeList to Array

// Initial positions of the alien invaders
const alienInvaders = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    30, 31, 32, 33, 34, 35, 36, 37, 38, 39
];

// Function to draw the invaders
function draw() {
    for (let i = 0; i < alienInvaders.length; i++) {
        if (!aliensRemoved.includes(i)) { // Check if the invader is not removed
            squares[alienInvaders[i]].classList.add("invader"); // Add invader class to the square
        }
    }
}

draw(); // Draw the invaders

squares[currentShooterIndex].classList.add("shooter"); // Add shooter class to the initial shooter position

// Function to remove invaders from their current positions
function remove() {
    for (let i = 0; i < alienInvaders.length; i++) {
        squares[alienInvaders[i]].classList.remove("invader"); // Remove invader class from the square
    }
}

// Function to move the shooter
function moveShooter(e) {
    squares[currentShooterIndex].classList.remove("shooter"); // Remove shooter class from the current position
    switch (e.key) {
        case "ArrowLeft":
            if (currentShooterIndex % width !== 0) currentShooterIndex -= 1; // Move left if not at the edge
            break;
        case "ArrowRight":
            if (currentShooterIndex % width < width - 1) currentShooterIndex += 1; // Move right if not at the edge
            break;
    }
    squares[currentShooterIndex].classList.add("shooter"); // Add shooter class to the new position
}

document.addEventListener("keydown", moveShooter); // Listen for keydown events to move the shooter

// Function to move the invaders
function moveInvaders(timestamp) {
    if (!lastTime) lastTime = timestamp; // Initialize lastTime if it's the first frame
    const elapsed = timestamp - lastTime; // Calculate elapsed time since the last frame

    if (elapsed > speed) { // Check if the elapsed time is greater than the speed
        const leftEdge = alienInvaders[0] % width === 0; // Check if the leftmost invader is at the left edge
        const rightEdge = alienInvaders[alienInvaders.length - 1] % width === width - 1; // Check if the rightmost invader is at the right edge
        remove(); // Remove invaders from their current positions

        if (rightEdge && isGoingRight) {
            for (let i = 0; i < alienInvaders.length; i++) {
                alienInvaders[i] += width; // Move down
            }
            direction = -1; // Change direction to left
            isGoingRight = false; // Update flag
        }

        if (leftEdge && !isGoingRight) {
            for (let i = 0; i < alienInvaders.length; i++) {
                alienInvaders[i] += width; // Move down
            }
            direction = 1; // Change direction to right
            isGoingRight = true; // Update flag
        }

        for (let i = 0; i < alienInvaders.length; i++) {
            alienInvaders[i] += direction; // Move invaders in the current direction
        }

        draw(); // Draw invaders in new positions

        if (squares[currentShooterIndex].classList.contains("invader")) {
            resultDisplay.innerHTML = "GAME OVER"; // Display game over message
            return; // Stop the animation
        }

        if (aliensRemoved.length === alienInvaders.length) {
            resultDisplay.innerHTML = "YOU WIN"; // Display win message
            return; // Stop the animation
        }

        lastTime = timestamp; // Update lastTime
    }

    requestAnimationFrame(moveInvaders); // Request the next frame
}

// Start the animation
requestAnimationFrame(moveInvaders);

// Function to shoot lasers
function shoot(e) {
    let laserId;
    let currentLaserIndex = currentShooterIndex;

    function moveLaser() {
        squares[currentLaserIndex].classList.remove("laser"); // Remove laser class from the current position
        currentLaserIndex -= width; // Move laser up by one row
        if (currentLaserIndex >= 0) { // Ensure the laser doesn't go out of bounds
            squares[currentLaserIndex].classList.add("laser"); // Add laser class to the new position
        }

        // Check for collision with invader
        if (squares[currentLaserIndex].classList.contains("invader")) {
            squares[currentLaserIndex].classList.remove("laser");
            squares[currentLaserIndex].classList.remove("invader");
            squares[currentLaserIndex].classList.add("boom");

            setTimeout(() => squares[currentLaserIndex].classList.remove("boom"), 300); // Timed explosion effect
            cancelAnimationFrame(laserId); // Stop the laser animation

            const alienRemoved = alienInvaders.indexOf(currentLaserIndex);
            aliensRemoved.push(alienRemoved);
            results++;
            resultDisplay.innerHTML = results;
        } else if (currentLaserIndex < 0) { // Stop the laser if it goes out of bounds
            cancelAnimationFrame(laserId);
        } else {
            laserId = requestAnimationFrame(moveLaser); // Continue moving the laser
        }
    }

    if (e.key === "ArrowUp") {
        laserId = requestAnimationFrame(moveLaser); // Start the laser animation
    }
}

document.addEventListener('keydown', shoot);
*/