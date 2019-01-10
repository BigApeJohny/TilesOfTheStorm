if (typeof io !== 'undefined') {
    var socket = io();
    socket.on('hi', function (name) {
        $('#player-name-change').text(name);
    });
    socket.on('new game', function (boardSize, board) {
        $('#score-board').css('display','none');
        $('#loading-screen').css('display','none');
        $('#player-left').css('display','none');
        $('#players-list').css('display','block');
        objectsToHide = [];
        objectsToShow = [];
        clearBoard();
        createBoard(boardSize, board);
    });
    socket.on('your move', function () {
        $('#move').text('Your move');
        chosenObjects = [];
        yourMove = true;
    });
    socket.on('enemy move', function () {
        $('#move').text('Enemy move');
        yourMove = false;
    });
    socket.on('rotate objects', function (index, value) {
        rotateObjects(index, value);
    });
    socket.on('remove objects', function (firstIndex, secondIndex) {
        removeObjectsFromScene (firstIndex, secondIndex);
    });
    socket.on('score board', function (HTMLstring) {
        $('#score-board').css('display','block');
        $('#score-players').html(HTMLstring);
        $('#score-board').animate({ "top": "+=75vh" }, "slow" );
    });
    socket.on('game over', function () {
        $('#move').text('GAME OVER');
    });
    socket.on('users count', function (count) {
        //console.log('Users on server: ' + count);
    });
    socket.on('connect_error', function () {       
        console.log('Game Over DIS');
    });
    socket.on('wrong move', function () {
        console.log('Musisz podać dwa różne pola !');
    });
    socket.on('make move', function (firstIndex, secondIndex) {
        console.log('Emit: First: ' + firstIndex + ' Second: ' + secondIndex);
    });
    socket.on('players list', function (playersList) {
        let div ="";
        let index = 1;
        for (let player of playersList) {
            div +="<div>" + (index++) + '. ' + player + "</div>";
        }
        $('#players-list-names').html(div);
    });
    socket.on('player left', function (playerName) {
         clearBoard();
        $('#player-left').html(playerName + ' left the game');
        $('#player-left').css('display','block');
        $('#loading-screen').css('display','block');
        $('#players-list').css('display','none');
        $('#score-board').css('display','none');
    });
    socket.on('not your turn', function () {
        console.log('Nie Twoja kolej !');
    }); 
} else {
    
}