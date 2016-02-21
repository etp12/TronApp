module.exports = function() {
    var app = require('express');
    var router = app.Router();
    var path = require('path');
    router.get('/', function(req, res, next) {
      res.sendFile(path.join(__dirname + '/index.html'));
    });
    router.get('/style.css', function(req, res, next) {
      res.sendFile(path.join(__dirname + '/style.css'));
    });
    router.get('/tron.js', function(req, res, next) {
      res.sendFile(path.join(__dirname + '/tron.js'));
    });
    return router;
}
