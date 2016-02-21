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

var point = function(x, y) {
  this.x = x;
  this.y = y;
}

var players = [{
  x : 200,
  y : 300,
  direction : 68,
  path : [],
  addCurrPath : function() {
    this.path.push(new point(this.x, this.y));
  },
  updatePath : function() {
    this.path[this.path.length-1].x = this.x;
    this.path[this.path.length-1].y = this.y;
  }
},
{
  x : 600,
  y : 300,
  direction : 65,
  path : [],
  addCurrPath : function() {
    this.path.push(new point(this.x, this.y));
  },
  updatePath : function() {
    this.path[this.path.length-1].x = this.x;
    this.path[this.path.length-1].y = this.y;
  }
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
      var p1 = players[data.id].path[players[data.id].path.length-2];
      var p2 = players[data.id].path[players[data.id].path.length-1];
      var d = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      if(d >= 20) {
        players[data.id].direction = data.keyCode;
        players[0].addCurrPath();
        players[1].addCurrPath();
    }
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

  players[0].addCurrPath();
  players[1].addCurrPath();

  players[0].addCurrPath();
  players[1].addCurrPath();

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
    if(p.x < 0 || (p.x+20) > 800 || p.y < 0 || (p.y+20) > 600) {
      io.emit('gameover', index);
      return;
    }
    p.updatePath();
  });

  for(var i = 0; i < 2; i++) {
    var player = players[i];
    var opponent = players[1-i];
    console.log(opponent);
    for(var j = 0; j < player.path.length-4; j++) {
      var p1 = player.path[j];
      var p2 = player.path[j+1];
      if(p1.x==p2.x) {
        if(p1.y>p2.y) {
          var temp = p1;
          p1 = p2;
          p2 = temp;
        }
      } else {
        if(p1.x>p2.x) {
          var temp = p1;
          p1 = p2;
          p2 = temp;
        }
      }
      if(checkCollisions({x : player.x, y : player.y, width : 20, height : 20}, {x: p1.x, y: p1.y, width: p2.x-p1.x+20, height: p2.y-p1.y+20})) {
        io.emit('gameover', i);
        return;
      }
    }
    for(var j = 0; j < opponent.path.length-1; j++) {
      var p1 = opponent.path[j];
      var p2 = opponent.path[j+1];
      if(p1.x==p2.x) {
        if(p1.y>p2.y) {
          var temp = p1;
          p1 = p2;
          p2 = temp;
        }
      } else {
        if(p1.x>p2.x) {
          var temp = p1;
          p1 = p2;
          p2 = temp;
        }
      }
      if(checkCollisions({x : player.x, y : player.y, width : 20, height : 20}, {x: p1.x, y: p1.y, width: p2.x-p1.x+20, height: p2.y-p1.y+20})) {
        io.emit('gameover', i);
        return;
      }
    }
  }
  io.emit('tick', players);
  lastTime = t;
  gameLoopId = setTimeout(gameLoop, 1000/30);
}

function checkCollisions(player, pathRect) {

  return player.y + player.height > pathRect.y && player.y < pathRect.y && player.x + player.width > pathRect.x && player.x < pathRect.x + pathRect.width ||
    player.x < pathRect.x + pathRect.width && player.x + player.width > pathRect.x + pathRect.width && player.y + player.height > pathRect.y && player.y < pathRect.y + pathRect.height ||
    player.y < pathRect.y + pathRect.height & player.y + player.height > pathRect.y + pathRect.height && player.x + player.width > pathRect.x && player.x < pathRect.x + pathRect.width ||
    player.x + player.width > pathRect.x && player.x < pathRect.x && player.y + player.height > pathRect.y && player.y < pathRect.y + pathRect.height;

}

module.exports = app;
