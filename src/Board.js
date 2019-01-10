const shuffle = require('./shuffle.js');

class Board {
    constructor(size) {
        this.board = [...Array((size * size)/ 2).keys()];
        this.board = shuffle(this.board.concat(this.board));
        this.undiscovered = (size * size)/ 2;
    }
    check (i, j) {
        if (this.board[i] === this.board[j])
            this.undiscovered--;
        return {
            match: this.board[i] === this.board[j],
            i: this.board[i],
            j: this.board[j],
            undiscovered: this.undiscovered
        };
    }
};
module.exports = Board;