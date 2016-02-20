module.exports = function() {
    var app = require('express');
    var router = app.Router();
    var path = require('path');
    router.get('/', function(req, res, next) {
      res.sendFile(path.join(__dirname + '/test.html'));
    });
    return router;
}
