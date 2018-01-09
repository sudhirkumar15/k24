'use strict';

//requiring all modules.
const express    = require('express'),
    config       = require('./app/cfg'),
    app          = express(),
    bodyParser   = require('body-parser'),
    validator    = require('express-validator'),
    core 		 = require('./app/model')
;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  next();
});

// Trust the X-Forwarded-* header
app.enable('trust proxy');
app.use(validator());
app.set('core', core(app, config));


