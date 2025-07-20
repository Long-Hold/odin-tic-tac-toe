/**Creates a signle instance of the gameBoard
 * gameBoard records, validates, updates, and displays the 
 * internal display of the UI game.
 */
const gameBoard = (function (){
    //Create 2D array representing game board
    const game = [
        [null,null,null],
        [null,null,null],
        [null,null,null]
    ];

    //Converts the board's data to human-readable symbols,
    //Or vice-versa
    const symbolMap = {0: 'X', 1:'O', null: ' '};

    function playerIsValid(player) {
        return (player === 0 || player === 1);
    }

    playerIsValid = (player) => {
        return player === 0 || player === 1;
    }

    return {placeTile, getBoard};
})();