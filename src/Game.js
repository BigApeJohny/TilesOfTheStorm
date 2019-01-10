const shuffle = require('./shuffle.js');
const Board = require('./Board.js');

class Game {
    constructor(players, size) {
        this.players = shuffle(players);
        this.scores = [...Array(players.length)].map(x => 0);
        this.currentPlayer = 0;
        this.board = new Board(size);        
    }
    getCurrentPlayer() {
        return this.players[this.currentPlayer % this.players.length];
    }
    getScores() {
        return this.scores.sort((a, b) => b - a);
    }
    move(i, j) {
        if (i === j) {            
            return false;
        }
        let result = this.board.check(i, j);
        if (result.match) {
            this.scores[this.currentPlayer % this.players.length]++;   
        }     
        this.currentPlayer++;
        return result;
    }
    isGameOver() {
        return this.board.undiscovered === 0;
    }
    endGame() {
        delete this;
    }
};
module.exports = Game;