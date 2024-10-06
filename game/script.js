const grid = document.querySelector(".grid"); // Select the grid element
const resultDisplay = document.querySelector(".results"); // Select the results display element
let currentShooterIndex = 382; // Initial position of the shooter (adjusted for larger grid)
const width = 20; // Width of the grid (adjusted for larger grid)
const aliensRemoved = []; // Array to keep track of removed aliens
let isGoingRight = true; // Flag to check if invaders are moving right
let direction = 1; // Direction of invader movement (1 for right, -1 for left)
let results = 0; // Player's score
let lastTime = 0; // Timestamp of the last frame
const speed = 600; // Speed of invader movement in milliseconds

// Load the images
const invaderImg = new Image();
invaderImg.src = 'images/invader.png'; // Path to your invader image

const shooterImg = new Image();
shooterImg.src = 'images/shooter.png'; // Path to your shooter image

// Ensure images are loaded before starting the game
Promise.all([
    new Promise((resolve) => invaderImg.onload = resolve),
    new Promise((resolve) => shooterImg.onload = resolve)
]).then(() => {
    // Create the grid squares
    for (let i = 0; i < width * width; i++) {
        const square = document.createElement("div"); // Create a new div element
        grid.appendChild(square); // Append the div to the grid
    }

    const squares = Array.from(document.querySelectorAll(".grid div")); // Convert NodeList to Array

    // Initial positions of the alien invaders
    const alienInvaders = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
        40, 41, 42, 43, 44, 45, 46, 47, 48, 49
    ];

    // Function to draw the invaders
    function draw() {
        for (let i = 0; i < alienInvaders.length; i++) {
            if (!aliensRemoved.includes(i)) { // Check if the invader is not removed
                squares[alienInvaders[i]].style.backgroundImage = `url(${invaderImg.src})`;
                squares[alienInvaders[i]].style.backgroundSize = 'cover';
                squares[alienInvaders[i]].style.backgroundRepeat = 'no-repeat';
                squares[alienInvaders[i]].classList.add("invader");
            }
        }
    }

    draw(); // Draw the invaders

    squares[currentShooterIndex].style.backgroundImage = `url(${shooterImg.src})`;
    squares[currentShooterIndex].style.backgroundSize = 'cover';
    squares[currentShooterIndex].style.backgroundRepeat = 'no-repeat';
    squares[currentShooterIndex].classList.add("shooter");

    // Function to remove invaders from their current positions
    function remove() {
        for (let i = 0; i < alienInvaders.length; i++) {
            squares[alienInvaders[i]].style.backgroundImage = ''; // Remove invader image from the square
            squares[alienInvaders[i]].classList.remove("invader");
        }
    }

    // Function to move the shooter
    function moveShooter(e) {
        squares[currentShooterIndex].style.backgroundImage = ''; // Remove shooter image from the current position
        squares[currentShooterIndex].classList.remove("shooter");
        switch (e.key) {
            case "ArrowLeft":
                if (currentShooterIndex % width !== 0) currentShooterIndex -= 1; // Move left if not at the edge
                break;
            case "ArrowRight":
                if (currentShooterIndex % width < width - 1) currentShooterIndex += 1; // Move right if not at the edge
                break;
        }
        squares[currentShooterIndex].style.backgroundImage = `url(${shooterImg.src})`; // Add shooter image to the new position
        squares[currentShooterIndex].style.backgroundSize = 'cover';
        squares[currentShooterIndex].style.backgroundRepeat = 'no-repeat';
        squares[currentShooterIndex].classList.add("shooter");
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

            if (squares[currentShooterIndex].style.backgroundImage.includes('invader.png')) {
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
            if (currentLaserIndex >= 0) { // Ensure the laser doesn't go out of bounds
                squares[currentLaserIndex].classList.remove("laser"); // Remove laser class from the current position
            }
            currentLaserIndex -= width; // Move laser up by one row

            if (currentLaserIndex >= 0) { // Ensure the laser doesn't go out of bounds
                squares[currentLaserIndex].classList.add("laser"); // Add laser class to the new position
            }

            // Check for collision with invader
            if (currentLaserIndex >= 0 && squares[currentLaserIndex].style.backgroundImage.includes('invader.png')) {
                squares[currentLaserIndex].classList.remove("laser");
                squares[currentLaserIndex].style.backgroundImage = '';
                squares[currentLaserIndex].classList.add("boom");

                // Remove boom class immediately
                squares[currentLaserIndex].classList.remove("boom");

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
});