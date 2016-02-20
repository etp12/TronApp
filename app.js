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

var player = [{
  id: 1,
  x : 200,
  y : 300,
  inputs : []
},
{
  id : 2,
  x : 600,
  y : 300,
  inputs : []
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



io.on( "connection", function( socket )
{
    socket.userid = UUID();
    socket.emit('onconnected', { id: socket.userid } );
    console.log(socket.userid + ' : connected');

    if(userQ.length === 0) {
      userQ.push(socket);
    }
    else if(userQ.length === 1) {
      userQ.push(socket);
      userQ[0].emit('play', player[0]);
      userQ[1].emit('play', player[1]);
      startGame();
    }
    else {
      socket.emit('wait', {});
    }

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
  player[0].x = 200;
  player[0].y = 300;
  player[1].x = 600;
  player[1].y = 300;
  lastTime = Date.now();

  setTimeout(gameLoop, 4000);
}
function gameLoop() {
  var dt = (Date.now() - lastTime)/1000;
  

}

module.exports = app;
