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
    router.get('/tron.TTF', function(req, res, next) {
      res.sendFile(path.join(__dirname + '/tron.TTF'));
    });
    router.get('/cover.png', function(req, res, next) {
      res.sendFile(path.join(__dirname + '/cover.png'));
    });
    router.get('/thumb.png', function(req, res, next) {
      res.sendFile(path.join(__dirname + '/thumb.png'));
    });
    return router;
}
