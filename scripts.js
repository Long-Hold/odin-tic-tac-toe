/**Creates a signle instance of the gameBoard
 * gameBoard records, validates, updates, and displays the 
 * internal display of the UI game.
 * 
 * Tracks and assigns available player slots automatically
 */
const gameBoard = (function (){
    //Create 2D array representing game board
    const EMPTY = null;
    const X = 'X';
    const O = 'O';

    // Converts the symbol variable to a char representation
    const symbolToCharMap = {X, O, EMPTY};

    // An array containing valid symbols
    const validSymbols = [X, O];

    // When false - player slot can be taken
    // When true - player cannot be assigned
    const activePlayers = {X: false, O: false};

    // Initialize the gameboard with empty tiles
    const board = [
        [EMPTY,EMPTY,EMPTY],
        [EMPTY,EMPTY,EMPTY],
        [EMPTY,EMPTY,EMPTY]
    ];

    // Checks the winning patterns and returns the winner of the game
    // ---- PRIVATE METHOD ----
    const winner = () => {
        /**Checks all possible winning patterns
         * If a winner is found in a pattern, immediately return the symbol
         * of the winning player
         * 
         * If no winning player is found, return null
         */

        // Check horizontal row patterns
        /**If the first cell is not empty, then compare
         * each cell in that row with the first cell
         * if all values are the same, return that symbol as the winner.
         */
        const winningRow = board.find(row => 
            row[0] !== EMPTY && 
            row.every(cell => cell === row[0])
        );
        if (winningRow) return winningRow[0];

        //Check for vertical column patterns
        /** Checks each row in a given column for the same symbol
         * Returns the symbol in the first row in a column if all symbols in a column
         * are the same
         */
        const numCols = board[0].length;
        for (let col = 0; col < numCols; ++col) {
                const [firstRow, secondRow, thirdRow] = [board[0][col], board[1][col], board[2][col]];
                if (firstRow !== EMPTY && firstRow === secondRow && secondRow === thirdRow) {
                    return board[0][col];
                }
            }
        
        // Checks for cross winning pattern
        /**If the center of the board is filled, check the corners for a match
         * return the symbol of the center if symbols match
         */
        if (board[1][1] !== EMPTY) {
            if ((board[0][0] === board[1][1] && board[1][1] === board[2][2]) ||
                (board[0][2] === board[1][1] && board[1][1] === board[2][0])) {
                    return board[1][1];
            }
        }

        return null;
    }

    // Updates activePlayers list boolean values
    const markPlayerTaken = (obj) => {
        // Marks the passed player object value as true
        activePlayers[obj] = true;
        console.log(`Player ${obj} selected.`);
    }

    const getAvailablePlayer = () => {
        /**If an available player is found, return it's char representation
         * otherwise return null (no available players)
        */
        for (const obj in activePlayers) {
            if (activePlayers[obj] === false) {
                markPlayerTaken(obj);
                return symbolToCharMap[obj];
            }
        }

        return null;
    }

    // Returns an array with valid symbols
    const isSymbolValid = (symbol) => {
        return validSymbols.includes(symbol.toUpperCase());
    }

    // Determine which player's turn it is
    const player = () => {
        /**Iterates through the gameBoard array and ccounts the number
         * of empty spaces.
         * 
         * If there is an odd number of empty spaces, then it is
         * player X's turn else it is player Y's turn
         */
        let emptySpaces = 0;

        for (const row of board) {
            for (const ele of row) {
                if (ele === EMPTY) {
                    emptySpaces += 1;
                }
            }
        }

        return (emptySpaces % 2 === 1 ? X : O);
    }

    // Places the symbol of the current player at the passed array index
    const placeTile = (action) => {
        /**If the tile is EMPTY, place the symbol of the current player
         * at the received coordinates
         */
        if (Array.isArray(action) === false) {
            throw new TypeError('Passed parameter must be of Type: Array');
        }
        const [row, col] = action;

        if (row < 0 || col < 0) {
            throw new RangeError('Negative out-of-bounds placement');
        }
        if (row > board.length || col > board[0].length) {
            throw new RangeError('Positive out-of-bounds placement');
        }

        if (board[row][col] !== EMPTY) {
            console.error(`Tile: ${row}, ${col} is occupied.`);
        }
        else {
            board[row][col] = player();
        }

        return board;
    }

    // Method to return array storing coordiantes of empty cells
    const getEmptyCells = () => {
        /**Returns an array storing all empty cell locations
         * This method is utilized by an AI agent to help pick a placement
         */
        let emptySpaces = [];
        for (const row of board) {
            const rowIndex = board.indexOf(row);

            row.forEach((cell,colIndex) => {
                if (cell === EMPTY) {
                    emptySpaces.push([rowIndex, colIndex]);
                }
            })
        }

        return emptySpaces;
    }

    // Checks if board is in a terminal state, returns boolean
    const isTerminal = () => {
        /**Checks if the board is in a terminal state.
         * 
         * First check for a winner,
         * if no winner then check for any empty cells
         * 
         * If an empty cell is found, return false (game can continue)
         * 
         * Otherwise, return true (no winner found, but all cells are filled)
         */
        if (winner() !== null) {
            return true;
        }

        // Check for ANY empty tiles
        for (const row of board) {
            for (const cell of row) {
                if (cell === EMPTY) {
                    return false;
                }
            }
        }

        return true;
    }

    // Returns an integer representation of the winning player
    const getWinner = () => {
        /**Returns a numeric representation of the winning player
         * this is particularly helpful for the BOT AI player,
         * and makes win condition checking easier and more efficient
         */
        switch(winner()) {
            case X:
                console.log(`Player: ${X} Wins`);
                return symbolToCharMap[X];
            case O:
                console.log(`Player: ${O} wins`);
                return symbolToCharMap[O];
            default:
                console.log('No winner detected');
                return null;
        }
    }

    // Returns a deep copy of the internal array game state
    const getBoard = () => board.map(row => [...row]);

    return {isSymbolValid, player, placeTile, getEmptyCells, isTerminal, getWinner, getBoard, symbolToCharMap};
})();

function createPlayer(symbol, isAI = false) {
    /**Function factory to create player objects that can interact with the board
     * 
     * Parameters:
     *  symbol: char
     *  isAI: boolean
     * 
     * symbol is verified by the gameBoard object.
     * isAI helps automatic move making decisions between the gameBoard and UI
     */
    if (gameBoard.isSymbolValid(symbol) === false) {
        console.error(`${symbol} is not a valid symbol.`);
        return null;
    }

    const playerSymbol = symbol.toUpperCase();
    const status = isAI;

    const makeMove = (position) => {
        if (gameBoard.player() !== playerSymbol) {
            console.error(`Player: ${playerSymbol} cannot make a move right now.`)
            return gameBoard.getBoard();
        }

        try {
            return gameBoard.placeTile(position)
        } 
        catch (e) {
            console.error(e);
        }
    }

    return {playerSymbol, status, makeMove};
}

function createAIPlayer(symbol) {
    const playerObj = createPlayer(symbol);
    const makeAutomatedMove = () => {
        const tileChoice = Math.floor(Math.random() * gameBoard.getEmptyCells().length);

        playerObj.makeMove(tileChoice);
    }

    return {makeAutomatedMove};
}

// Calls the correct game process in order
const gameFlow = (function() {
    /**Controls the game flow logic.
     * 
     * Game flow logic:
     * 1. Initialize player objects.
     * 2. Initialize interactive UI.
     * 3. Place tiles (automatically in the case of AI players)
     * 4. Check board terminal state:
     *      If terminal, return winner or draw state
     *      If not terminal, await next tile placement
     */

    let playerX;
    let playerO;
    let AIPlayerStatus = false;

    const initializePlayerObjects = () => {
        /**Assigns game setting form data to the specificed Player One variable
         * Dependent on Symbol selection.
         * 
         * The other object is then automatically created using the only other available symbol
         * 
         * If user selects "Player vs Bot", then Player 2 is created with "isAI" set to true as well.
         */

        const [gameMode, playerOneSymbol] = formController.getGameSetup();

        if (gameMode === "player-vs-bot") {
            AIPlayerStatus = true;
        }

        switch (playerOneSymbol) {
            case gameBoard.symbolToCharMap.X:
                playerX = createPlayer(playerOneSymbol);
                playerO = createPlayer('O', AIPlayerStatus);
                break;

            case gameBoard.symbolToCharMap.O:
                playerO = createPlayer(playerOneSymbol);
                playerX = createPlayer('X', AIPlayerStatus);
                break;
            
            default:
                throw new Error('Player object creation failed');
        }
    }

    const initializeInternalGameState = (event) => {
        /**Upon form submission, this module method will create the player objects
         * within this module.
         * 
         * Additionally, it will call any relevant gameBoard module methods to initialize the
         * internal game state
         */
        if (event.target.tagName !== 'FORM') {
            console.error("Only form submission can initialize internal state");
            return;
        }

        initializePlayerObjects();
    }

    const initializeUI = (event) => {
        /**To prevent this method being called manually,
         * function param is first compared to its tag name.
         * This ensures only the game setup form can trigger the initialization of
         * the UI and playspace
         */
        if (event.target.tagName !== 'FORM') {
            console.error("Error: Only game form submission can initialize a game");
            return;
        }

        // Make the current player text visible
        currentPlayerUIController.displayContainerNode(event);
        // Update the current player display for the first time
        currentPlayerUIController.displayCurrentPlayer();

        // Make the gamegrid UI visible
        gameUIController.displayGameBoard(event);
    }

    const playGame = (coords) => {
        /**Takes an array containing the X, Y position of the move
         * 
         * Checks if game is terminal, if not, calls the player responsible for the move
         * and passes the coordinates to them
         */
        gameBoard.player() === playerX.playerSymbol ? playerX.makeMove(coords) : playerO.makeMove(coords);
        currentPlayerUIController.displayCurrentPlayer();
        if (gameBoard.isTerminal()) {
            activateTerminalUIStates();
            return gameBoard.getWinner();
        }
        return gameBoard.getBoard();
    }

    const activateTerminalUIStates = () => {
        /**Freezes the game grid UI
         * Hides the current player container
         * Displays the game over container
         */
        gameUIController.freezeGridUI();
        currentPlayerUIController.hideContainerNode();
        gameOverUIController.displayGameOverContainer();
    }
    return {initializeInternalGameState, initializeUI, playGame};
})();

// Manages the interactive game board
const gameUIController = (function() {
    /**Handles interactions with the UI and communicates with
     * the gameBoard object to maintain a consistent state between
     * the UI and internal game state tracking
     */

    let coords = null;
    const gameGridNode = document.querySelector('.gamegrid');
    gameGridNode.addEventListener('click', (event) => getGridPosition(event));

    // Receives the coordinates of a clicked grid cell
    const getGridPosition = (event) => {
        // Ignore if the click was not on a div container
        if (!event.target.dataset.position) {
            return;
        }

        const nodeDataset = event.target.dataset.position;
        // Convert the dataset string to a set of X, Y coordinates
        coords = Array.from(nodeDataset, Number);

        // If the internal grid shows this square as taken, ignore input
        if (gameBoard.getBoard()[coords[0]][coords[1]] !== null) {
            return;
        }
        transferGridPosition();
        updateGridUI(event);
        console.log(coords);
    }

    // Transfers the selected grid coordinates to the gameFlow controller
    const transferGridPosition = () => {
        if (coords === null) {
            return;
        }

        return gameFlow.playGame(coords);
    }

    // Updates a grid square to match the internal grid state
    const updateGridUI = (event) => {
        /**Creates an img node that stores the image of the selected tile
         * This newly created node is then appended to the selected div container.
         */
        const [x, y] = coords;

        const symbol = document.createElement('img');
        const imgSource = gameBoard.getBoard()[x][y] === 'X' ? 'svgs/x_symbol.svg' : 'svgs/o_symbol.svg';

        symbol.src = imgSource;
        event.target.appendChild(symbol);
    }

    const displayGameBoard = (event) => {
        if (event.target.tagName !== 'FORM') {
            console.log('invalid');
            return;
        }

       gameGridNode.style.display = 'grid';
    }

    // Freezes the grid area if the board turns terminal
    const freezeGridUI = () => {
        if (gameBoard.isTerminal()) {
            gameGridNode.style.pointerEvents = "none";
            console.log('Game Grid UI frozen.');
        }
    };

    const unfreezeGridUI = () => {
        gameGridNode.style.pointerEvents = 'auto';
        console.log('Game Grid UI un-frozen.');
    }

    return {displayGameBoard, freezeGridUI, unfreezeGridUI};
})();

// Controls the game mode form
const formController = (function() {
    const gameSetUpForm = document.getElementById('game-setup');
    let gameMode;
    let playerOneSymbol;

    gameSetUpForm.addEventListener('submit', (event) => {
        event.preventDefault();
        gameSetupData(event);

        // Hide the section container that holds the form and header
        gameSetUpForm.parentNode.style.display = "none";

        gameFlow.initializeInternalGameState(event);
        gameFlow.initializeUI(event);
    })

    const gameSetupData = (event) => {
        /**Assigns the selected game mode
         * and player one symbol to internal values
         */
        const formData = new FormData(event.target);

        gameMode = formData.get('gameMode');
        playerOneSymbol = formData.get('playerSymbol');
    }

    const getGameSetup = () => [gameMode, playerOneSymbol];

    return {getGameSetup};
})();

// Controls the container that appears when board becomes terminal
const gameOverUIController = (function() {
    const gameOverCntnr = document.querySelector('.game-over-container');
    
    gameOverCntnr.addEventListener('click', (event) => {
        // Only process clicks coming from the restart buttons
        if (event.target.tagName !== 'BUTTON') {
            return;
        }

        switch (event.target.id) {
            case 'rematch':
                console.log('TODO! Add rematch functionality!');
                break;

            case 'new-game':
                resetState();
                break;

            default:
                console.error('Invalid case passed to event listener');
                break;
        }
    })

    // Reloads the webpage, effectively resetting everything
    const resetState = () => window.location.reload();

    const displayGameOverContainer = () => {
        if (gameBoard.isTerminal()) {
            gameOverCntnr.style.display = 'block';
            displayGameOverMessage();
        }
    }

    const displayGameOverMessage = () => {
        /**Displays a custom game over message depending on the terminal condition.
         * If gameBoard is terminal and there is no winner, then display "No Winner!"
         * 
         * Otherwise display the symbol of the winning player.
         */

        // Select the h1 element that will display the custom message
        const winStateMessageNode = gameOverCntnr.firstElementChild;
        const winnerSymbol = getWinnerSymbol();
        
        // Appens the winner symbol to the span element within the win message
        winStateMessageNode.firstElementChild.append(winnerSymbol)
    }

    const getWinnerSymbol = () => {
        /**This method is called during the game over message display process.
         * 
         * Returns the .svg image of the respective winner, or TIE if no winner was found
         * in the terminal board.
         */

        const imageNode = document.createElement('img');
        switch(gameBoard.getWinner()) {
            case 'X':
                imageNode.src = './svgs/x_symbol.svg';
                return imageNode;

            case 'O':
                imageNode.src = './svgs/o_symbol.svg';
                return imageNode
            
            case null:
                return 'TIE';
            
            default:
                console.error('No valid win state found.');
                return;
        }
    }

    return {displayGameOverContainer};
})();

// Updates the current player UI with the symbol of the respective player
const currentPlayerUIController = (function() {
    const currentPlayerContainer = document.querySelector('.current-player-display');
    const currentPlayerNode = currentPlayerContainer.firstElementChild.firstElementChild;
    const symbolNode = document.createElement('img');

    currentPlayerNode.appendChild(symbolNode);

    const displayContainerNode = (event) => {
        /**Upon game settings form submission,
         * this container can be made visible
         */
        if (event.target.tagName !== 'FORM') {
            console.error('Error: Current Player UI can only be displayed upon form submission.');
            return;
        }

        currentPlayerContainer.style.display = 'block';
    }

    const hideContainerNode = () => {
        if (gameBoard.isTerminal()) {
            currentPlayerContainer.style.display = 'none';
        }
    }

    const displayCurrentPlayer = () => symbolNode.src = symbolFileManager.getCurrentSymbol();

    return {displayContainerNode, hideContainerNode ,displayCurrentPlayer};
})();

// Stores the paths to the player symbol .svg files and returns them as needed
const symbolFileManager = (function() {
    const xSymbol = './svgs/x_symbol.svg';
    const oSymbol = './svgs/o_symbol.svg';

    const getCurrentSymbol = () => gameBoard.player() === 'X' ? xSymbol : oSymbol;
    return {getCurrentSymbol};
})();

const playerX = createPlayer('X');
const playerO = createPlayer('O');