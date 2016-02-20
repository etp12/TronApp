module.exports = function(io) {
    var app = require('express');
    var router = app.Router();
    var path = require('path');
    router.get('/', function(req, res, next) {
      res.sendFile(path.join(__dirname + '/test.html'));
    });

    io.on('connection', function(socket) {
      console.log('connected!');
    });

    return router;
}
