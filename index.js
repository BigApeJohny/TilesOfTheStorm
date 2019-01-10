const express = require('express');
const http = require('http');
const log = require('simple-node-logger').createSimpleLogger();
const app = express();
const PLAYERS_IN_GAME = 2;
const BOARD_SIZE = 4;
const PORT = 3002;
const httpServer = http.createServer(app);
const io = require('socket.io')(httpServer);

app.set('view engine', 'hbs');
app.use(express.static('public'));
app.get('/', function (req, res) {
  res.render('index.hbs', { title: 'Hey' });
});

io.on('connection', require('./src/memoConnectionHandler')(PLAYERS_IN_GAME, BOARD_SIZE));

httpServer.listen(PORT, () => {
   log.info('Serwer został uruchomiony na porcie: ' + PORT); 
});