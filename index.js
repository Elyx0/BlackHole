  var express = require('express');
  var app = express();
  // At the top of your web.js
  process.env.PWD = process.cwd()

  app.use(express.static(process.env.PWD +'/public'));
  app.use(express.static(process.env.PWD +'/js'));
  app.use(express.static(process.env.PWD +'/assets'));
  app.listen(process.env.PORT || 4001);
  console.log('Server Started.');