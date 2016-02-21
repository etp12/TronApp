var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var UUID = require('node-uuid');
var socket_io = require('socket.io');

var app = express();
var io = socket_io();
app.io = io;
var routes = require('./routes/index')(io);
var lastTime = 0;
var userQ = [];

var point = {
  x : 0,
  y : 0
};

var players = [{
  x : 200,
  y : 300,
  direction : 68,
  path : []
},
{
  x : 600,
  y : 300,
  direction : 65,
  path : []
}];



// view engine setup
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);



io.on( "connection", (socket) =>
{
    socket.userid = UUID();
    socket.emit('onconnected', { id: socket.userid } );
    console.log(socket.userid + ' : connected');

    if(userQ.length === 0) {
      userQ.push(socket);
    }
    else if(userQ.length === 1) {
      userQ.push(socket);
      userQ[0].emit('play', {id: 0, p: players});
      userQ[1].emit('play', {id: 1, p: players});
      startGame();
    }
    else {
      socket.emit('wait', {});
    }
    socket.on('disconnect', (s) => {
      userQ.splice(userQ.indexOf(socket), 1);
      console.log(socket.userid + ' : disconnected');
      userQ[0].emit('restart', {});
    });

    socket.on('input', (keypress, id) => {
      players[id] = keypress;
    });

});



// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

function startGame() {
  //reset player positions
  players[0].x = 200;
  players[0].y = 300;
  players[1].x = 600;
  players[1].y = 300;
  lastTime = Date.now();

  setTimeout(gameLoop, 4000);
}
function gameLoop() {
  



  io.emit('tick', ({players});
  process.nextTick(gameLoop);
}

module.exports = app;
