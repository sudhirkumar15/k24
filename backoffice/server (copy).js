'use strict';

//requiring all modules.
const express    = require('express'),
    config       = require('./app/cfg'),
    app          = express(),
    cookieParser = require('cookie-parser'),
    helmet       = require('helmet'),
    bodyParser   = require('body-parser'),
    core         = require('./app/core'),
    validator    = require('express-validator')
;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  next();
});

// Trust the X-Forwarded-* header
app.enable('trust proxy');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(validator());
//including configuration file
app.set('config', config.cfg);

//adding all api of this application.
app.set('core', core(app, config.cfg));

app.use((req, res, next) => {
    res.api = {
        'data': {},
        'errors': [],
        'status': 200
    };
    next();
});

// Load routes
require('./app/routers')(app, config.cfg);

/*app.use((err, req, res, next) => {
    if (!err) {
        return next();
    }

    // log error

    if (r)

});*/


app.listen(app.get('config').web.port);
console.log('Application running at : ' + app.get('config').web.port);
