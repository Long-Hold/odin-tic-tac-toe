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

    return {isSymbolValid, player, placeTile, getEmptyCells, isTerminal, getWinner, getBoard};
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

const gameFlow = (function() {
    /**Controls the game flow logic.
     * 
     * Game flow logic:
     * 1. Place tile
     * 2. Check board terminal state:
     *      If terminal, return winner or draw state
     *      If not terminal, await next tile placement
     */

    const playGame = (coords) => {
        /**Takes an array containing the X, Y position of the move
         * 
         * Checks if game is terminal, if not, calls the player responsible for the move
         * and passes the coordinates to them
         */
        gameBoard.player() === playerX.playerSymbol ? playerX.makeMove(coords) : playerO.makeMove(coords);
        if (gameBoard.isTerminal()) {
            return gameBoard.getWinner();
        }
        return gameBoard.getBoard();
    }
    return {playGame};
})();

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
        const [x, y] = coords;
        event.target.textContent = gameBoard.getBoard()[x][y];
    }
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

const playerX = createPlayer('X');
const playerO = createPlayer('O');