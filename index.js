const express = require('express');
const { reset } = require('nodemon');
const socket = require('socket.io');

// Setup App
const PORT = process.env.PORT || 3000;
const app = express();
const server = app.listen(PORT,
  console.log("Server running on port " + PORT)
);

// Send static file to client
app.use(express.static('public'));

var arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
var player1turn = true;
var gameover = false;
var count = 0;
var winner;

let connectedPlayer = [];

// Socket setup & pass server
const io = socket(server);
io.on('connection', (socket) => {
  console.log(`${socket.id} is connected`);
  connectedPlayer.push(socket.id);
  socket.emit('players', connectedPlayer);
  socket.broadcast.emit('players', connectedPlayer);
  console.log(connectedPlayer);

  // Handle chat event
  socket.on('player-turn', function (index) {
    userTurn(index);
    socket.emit('state', {
      board: arr,
      player: player1turn,
      moveCount: count,
      isGameOver: gameover,
      gameWinner: winner
    });
    socket.broadcast.emit('state', {
      board: arr,
      player: player1turn,
      moveCount: count,
      isGameOver: gameover,
      gameWinner: winner
    });
  });

  socket.on('reset', (data) => {
    resetGame();
    socket.emit('state', {
      board: arr,
      player: player1turn
    });
    socket.broadcast.emit('state', {
      board: arr,
      player: player1turn
    });
  });
});

function userTurn(index) {
  if (arr[index] > 0) {
    arr[index] = (player1turn) ? -1 : 0;	// Else, put symbol
    player1turn = !player1turn;
    count++;
    checkwon();
  }
}

function resetGame() {
  arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  count = 0;
  player1turn = true;
  gameover = false;
}

function checkwon() {				// Check if in current board state player has won
  if (count === 9) {			// If 9 turns are over, and no one has won, game is draw
    gameover = true;
  }

  for (i = 0; i < 3; i++)			// Check columns
    if (arr[i] == (arr[i + 3]) && arr[i] == (arr[i + 6])) {
      gameover = true;
      winner = [i, i + 6];	// Store first and last coordinate of winning boxes
    }

  for (i = 0; i < 9; i += 3)			// Check rows
    if (arr[i] == (arr[i + 1]) && arr[i] == (arr[i + 2])) {
      gameover = true;
      winner = [i, i + 2];	// Store first and last coordinate of winning boxes
    }

  for (i = 0, b = 4; i < 3; i += 2, b -= 2)	// Check Diagonals
    if (arr[i] === (arr[i + b]) && arr[i] === (arr[i + b + b])) {
      gameover = true;
      winner = [i, i + b + b];	// Store first and last coordinate of winning boxes
    }

  console.log(gameover);
  console.log(winner);
}