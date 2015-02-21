  var express = require('express');
  var app = express();
  app.use(express.static('public'));
  app.use(express.static('js'));
  app.use(express.static('assets'));
  app.listen(process.env.PORT || 4001);