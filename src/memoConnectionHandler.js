const log = require('simple-node-logger').createSimpleLogger();
const Game = require('./Game.js');
const generateName = require('sillyname');
const players = {};
let playersLength = 0;
let currentGame;
let games = [];
module.exports = function (playeyersInGame, boardSize) {
    return function (socket) {
        let player = {
            name: generateName(),
            socket: socket,
            game: null
        };
        players[player.name] = player;
        socket.emit('hi', player.name);
        socket.emit('users count', ++playersLength);
        socket.broadcast.emit('users count', playersLength);
        log.info('Przyszedł gracz: ' + player.name);
        let createGames = () => {
          let _players = [];
          for (let _player in players) {
              if (players[_player].game === null) {
                  _players.push(_player);
                  if (_players.length === playeyersInGame) {
                      let game = new Game(_players, boardSize);
                      _players.forEach((name) => {
                          players[name].game = game;                       
                          players[name].socket.emit('new game', boardSize, players[name].game.board.board);                         
                          players[name].socket.emit('players list', game.players);
                      });
                      players[game.getCurrentPlayer()].socket.emit('your move');
                      _players.forEach((name) => {
                          if(name !== game.getCurrentPlayer()){
                              players[name].socket.emit('enemy move');
                          }
                      });
                      console.log('Nowa gra: ' + _players.join(', '));
                      let a =[]; // wypisz board
                      console.log('-------------------');
                      console.log('-------BOARD-------');
                      console.log('-------------------');
                      for (let item of game.board.board) {
                          a.push(item);
                          if (a.length === boardSize) {
                              console.log(a);
                              a = [];
                          }
                      }                  
                      currentGame = game;
                      _players = [];
                  }
              }
          }
        };
        createGames();
        socket.on('move', function (firstIndex, secondIndex) {
            console.log(firstIndex, secondIndex);
            if (currentGame !== null) {
                if (player.name === currentGame.getCurrentPlayer() ) {
                    players[currentGame.getCurrentPlayer()].socket.emit('enemy move'); 
                    var gameResult = currentGame.move(firstIndex, secondIndex);
                    if (gameResult.match === true) {
                        console.log(player.name + ' scores !');     
                        setTimeout(function(){
                            socket.emit('remove objects', firstIndex, secondIndex);
                            socket.broadcast.emit('remove objects', firstIndex, secondIndex);                            
                        }, 2000);
                    } else {    
                            setTimeout(function(){
                                socket.emit('rotate objects', firstIndex, "hide");
                                socket.broadcast.emit('rotate objects', firstIndex, "hide");
                                
                                socket.emit('rotate objects', secondIndex, "hide");
                                socket.broadcast.emit('rotate objects', secondIndex, "hide");
                           }, 2000);
                    }                    
                    players[currentGame.getCurrentPlayer()].socket.emit('your move');                                        
                    if (currentGame.isGameOver()) {
                        setTimeout(function() {
                            let scoreBoardHTML = '';
                            for(let i = 0; i < currentGame.players.length; i++) {
                                scoreBoardHTML += '<p>'
                                               +(i+1) + '. ' +currentGame.players[Object.keys(currentGame.getScores())[i]] + ': ' + currentGame.getScores()[i]
                                               +'</p>';
                            }
                            socket.emit('score board', scoreBoardHTML);
                            socket.broadcast.emit('score board', scoreBoardHTML);
                            currentGame.endGame();
                            gameOver();
                        },3000);
                    }
                }
                else
                    player.socket.emit('not your turn');                                
            } else {
                console.log('Gra nie istnieje !');
            }
        });
        socket.on('clicked object', function (index, value) {
            console.log(index);
            socket.emit('rotate objects', index, "show");
            socket.broadcast.emit('rotate objects', index, "show");
        });
        socket.on('disconnect', function () {
          if (player.game !== null) {
              gameOver();
          }
          socket.broadcast.emit('player left', player.name);
          delete players[player.name];
          socket.broadcast.emit('users count', --playersLength);
          socket.broadcast.emit('clear board');
          log.info('Odszedł gracz: ' + player.name);
          createGames();
        });
        function gameOver() {
            currentGame = null;
            for (let _player of player.game.players) {
                players[_player].socket.emit('game over');
                players[_player].game = null;
            }
        }
    };
};