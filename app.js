"use strict";
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var UUID = require('node-uuid');
var socket_io = require('socket.io');

var gameLoopId;
var speed = 250;

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
  path : [],
  update : function() {
    console.log('hi');
  }
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



io.sockets.on( "connection", (socket) =>
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

    socket.on('input', (data) => {
      players[data.id].direction = data.keyCode;
    });

    socket.on('disconnect', function(s) {
      console.log('disconected');

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

  setTimeout(function() {
    lastTime = Date.now();
    gameLoopId = setTimeout(gameLoop,1000/30);
  }, 4000);
}
function gameLoop() {
  var t = Date.now();
  var dt = (t - lastTime)/1000;

  players.forEach(function(p, index) {
    if(p.direction === 87) {
      p.y -= speed*dt;
    }
    else if (p.direction === 83) {
      p.y += speed*dt;
    }
    else if (p.direction === 65) {
      p.x -= speed*dt;
    }
    else if (p.direction === 68) {
      p.x += speed*dt;
    }
  });


  io.emit('tick', {players : players});
  lastTime = t;
  gameLoopId = setTimeout(gameLoop, 1000/30);
}

module.exports = app;
