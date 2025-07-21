/**Creates a signle instance of the gameBoard
 * gameBoard records, validates, updates, and displays the 
 * internal display of the UI game.
 */
const gameBoard = (function (){
    //Create 2D array representing game board
    const EMPTY = null;
    const X = 'X';
    const Y = 'Y';

    // Initialize the gameboard with empty tiles
    const gameboard = [
        [EMPTY,EMPTY,EMPTY],
        [EMPTY,EMPTY,EMPTY],
        [EMPTY,EMPTY,EMPTY]
    ];

    // Determine which player's turn it is
    const player = () => {
        /**Iterates through the gameBoard array and ccounts the number
         * of empty spaces.
         * 
         * If there is an odd number of empty spaces, then it is
         * player X's turn else it is player Y's turn
         */
        let emptySpaces = 0;

        for (const row of gameBoard) {
            for (const ele of row) {
                if (ele === EMPTY) {
                    emptySpaces += 1;
                }
            }
        }

        return (emptySpaces % 2 === 1 ? X : Y);
    }
})();