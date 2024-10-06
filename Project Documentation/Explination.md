- **const grid = document.querySelector('.grid');**
  - **Find Element**: This line finds the first element in the document with the class name 'grid' and assigns it to the variable `grid`.

- **const resultDisplay = document.querySelector('.results');**
  - **Find Element**: This line finds the first element in the document with the class name 'results' and assigns it to the variable `resultDisplay`.

- **const width = 15;**
  - **Set Width**: This line sets a constant variable `width` to 15, which likely represents the width of the grid.

- **const aliensRemoved = [];**
  - **Initialize Array**: This line initializes an empty array `aliensRemoved` to keep track of which aliens have been removed.

- **for (let i = 0; i < width * width; i++) { const square = document.createElement('div'); grid.appendChild(square); }**
  - **Create Squares**: This loop runs `width * width` times (225 times if `width` is 15). In each iteration, it creates a new `div` element and appends it to the `grid` element, effectively creating a grid of squares.

- **const squares = Array.from(document.querySelectorAll('.grid div'));**
  - **Select All Squares**: This line selects all `div` elements within the element with the class 'grid' and converts the NodeList into an array, assigning it to the variable `squares`.

- **const alienInvaders = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39];**
  - **Define Alien Positions**: This array contains the initial positions of the alien invaders on the grid. Each number represents an index in the `squares` array where an alien invader will be placed.


## function Draw:

1. **Function Definition**: The `draw` function is defined. This function will be used to update the visual representation of the game.

2. **For Loop**: The `for` loop iterates over each element in the `alienInvaders` array. The loop runs from `i = 0` to `i < alienInvaders.length`.

3. **Check if Alien is Removed**: Inside the loop, there is an `if` statement that checks if the current index `i` is not included in the `aliensRemoved` array. This means it checks if the alien at the current index has not been removed.

4. **Add Class to Square**: If the alien has not been removed, the code `squares[alienInvaders[i]].classList.add('invader')` is executed. This line:
   - Accesses the `squares` array at the position specified by `alienInvaders[i]`.
   - Adds the class `'invader'` to the element at that position. This is typically used to visually mark the element as an invader on the game board.

5. **Function Call**: After defining the `draw` function, it is called with `draw()`, which executes the code inside the function.

### Summary
- The `draw` function iterates over the `alienInvaders` array.
- For each alien that has not been removed (i.e., not in the `aliensRemoved` array), it adds the class `'invader'` to the corresponding element in the `squares` array.
- This visually updates the game board to show the current position of the invaders.

## The e Key
- Parameter e: The e parameter in the moveShooter function represents the event object. When an event occurs (like a key press), the event object contains information about that event.
- e.key: This property of the event object contains the value of the key that was pressed. For example, if the left arrow key is pressed, e.key would be 'ArrowLeft'.
How It Works
- Remove Shooter Class: The function starts by removing the 'shooter' class from the current position. This is done to prepare for moving the shooter to a new position.
- Switch Statement: The switch(e.key) statement is used to handle different key presses. Depending on which key is pressed, different actions can be taken to move the shooter.

- ArrowLeft: If the left arrow key is pressed and the shooter is not at the left edge of the grid, the shooter moves one position to the left.
- ArrowRight: If the right arrow key is pressed and the shooter is not at the right edge of the grid, the shooter moves one position to the right.
- Update Position: After updating the currentShooterIndex, the 'shooter' class is added to the new position to visually move the shooter.

This setup allows the shooter to move left and right based on key presses

- Remove Class: Clears the visual marker from the old position.
- Update Index: Changes the position index based on the key press.
- Add Class: Marks the new position with the 'shooter' class.
This process ensures that the shooter appears to move smoothly across the grid. Without removing the class first, the shooter would appear in multiple positions at once, which would be confusing.


- **document.getElementById**: This method returns the element that has the ID attribute with the specified value. It is used to find and access elements in the DOM by their unique ID.

- **addEventListener**: This method attaches an event handler to an element. It listens for specified events (like 'click', 'mouseover', etc.) and executes a function when the event occurs.

- **document.createElement**: This method creates a new HTML element specified by the tag name (like 'div', 'li', 'p', etc.). It does not add the element to the document; it just creates it in memory.

- **textContent**: This property sets or returns the text content of the specified node. It is used to change or retrieve the text inside an element.

- **appendChild**: This method adds a node to the end of the list of children of a specified parent node. It is used to insert new elements into the DOM.

Great question! Let's clarify the differences between moving the shooter and the invaders, and why we use `+= 1` for the shooter and `- 1` in the context of the invaders.

### Moving the Shooter
When moving the shooter, we are responding to user input (key presses) to move the shooter left or right on the grid.

- **ArrowLeft**: `currentShooterIndex -= 1;` moves the shooter one position to the left.
- **ArrowRight**: `currentShooterIndex += 1;` moves the shooter one position to the right.

### Moving the Invaders
When moving the invaders, the logic is a bit different because we are typically moving all invaders together in a coordinated manner, often in a pattern (e.g., left to right, then down, then right to left).

#### Example Scenario
Let's say we are moving the invaders to the left:

- **Left Edge Check**: `const leftEdge = alienInvaders[0] % width === 0;` checks if the leftmost invader is at the left edge.
- **Right Edge Check**: `const rightEdge = alienInvaders[alienInvaders.length - 1] % width === width - 1;` checks if the rightmost invader is at the right edge.

### Why `- 1`?
In the `moveInvaders` function, you might use `- 1` to check if the invaders have reached the left edge of the grid. This is part of the logic to determine if the invaders need to change direction or move down.


### Summary
- **Shooter Movement**: Directly responds to user input, moving left (`- 1`) or right (`+ 1`).
- **Invader Movement**: Follows a pattern, often involving edge checks and coordinated movement, which may include moving down and changing direction.


Code Adjustments switching from setInterval to requestAnimationFrame:
Timestamp Handling: Added a timestamp parameter to the moveInvaders function to calculate the elapsed time.
Elapsed Time Calculation: Used the timestamp to determine if enough time has passed to move the invaders.
Recursive Calls: Replaced setInterval with requestAnimationFrame to create a smooth animation loop.
Key Updates:
Initialization: lastTime is initialized to track the last frame’s timestamp.
Elapsed Time Check: The elapsed time is calculated to control the movement speed.
Recursive Call: requestAnimationFrame(moveInvaders) is called within the moveInvaders function to continue the animation loop.