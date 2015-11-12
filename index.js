  var express = require('express');
  var app = express();
  // At the top of your web.js
  process.env.PWD = process.cwd()

  app.use(express.static(__dirname +'/public'));
  app.use(express.static(__dirname +'/js'));
  app.use(express.static(__dirname +'/assets'));
  app.listen(process.env.PORT || 4001);
  console.log('Server Started.');