'use strict';

const express    = require('express'),
    config       = require('../cfg'),
    app          = express(),
    exphbs       = require('express-handlebars'),
    cookieParser = require('cookie-parser'),
    compress     = require('compression'),
    helmet       = require('helmet'),
    bodyParser   = require('body-parser'),
    passport     = require('passport'),
    flash        = require('connect-flash'),
    log          = require('./logger'),
    core         = require('../core'),
    session      = require('express-session'),
    RedisStore   = require('connect-redis')(session),
    moment       = require('moment'),
    csrf         = require('csurf'),
    minifyHTML   = require('./minifyHTML'),
    responseTime = require('response-time'),
    assets       = require('../assets.json'),
    uuid         = require('uuid/v1');

app.use(responseTime());

// Trust the X-Forwarded-* header
app.enable('trust proxy');

app.set('config', config);
app.set('core', core(config));
app.set('log', log);
app.set('etag', 'strong');
app.set('assets', assets);

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(cookieParser(app.get('config').web.cookieParser.secret));

app.use(csrf({ cookie: true }));

// Add X-XSS-Protection
app.use(helmet.xssFilter());

// Prevent app to be served by an iframe
app.use(helmet.frameguard({ action: 'deny' }));

// Turn of mime sniffing by browsers
app.use(helmet.noSniff());

app.use(helmet.hidePoweredBy({ setTo:
    'People like you. Shoot us an email: careers@impelsys.com'
}));

// Use gzip
app.use(compress());

// Use session
app.use(session({
    secret           : app.get('config').web.session.secret,
    saveUninitialized: true,
    resave           : true,
    store            : new RedisStore({
        host: app.get('config').web.session.host,
        port: app.get('config').web.session.port
    }),
    cookie: {
        secure: true
    }
}));

// Use flash messages
app.use(flash());

// Set req._data
app.use((req, res, next) => {
    req._data = {};
    next();
});

app.use(passport.initialize());
app.use(passport.session());

// store session in locals
app.use((req, res, next) => {
    // Allow service worker to have root scope
    res.set('Service-Worker-Allowed', '/');

    res.locals.user    = req.user;
    res.locals.version = require('../package.json').version;
    res.locals.copyrightRange = `${moment().format('YYYY')} - ${moment().add(1, 'year').format('YYYY')}`;
    res.locals.assets = assets;
    res.locals.nonce = uuid();

    next();
});

// Set context in helpers
app.use(require('./../web/helpers/view').setContext);

// Configure handlebars
const hbs = exphbs.create({
    extname      :'hbs',
    layoutsDir   : app.get('config').paths.templates + '/layouts',
    defaultLayout: 'main',
    helpers      : require('./../web/helpers/view').helpers,
    partialsDir  : [
        app.get('config').paths.templates + '/partials/'
    ]
});

// Initialize engine
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

// minify html. bit of a hackery :P
app.use(minifyHTML);

// Enable view cache
app.enable('view cache');

// Set views dir
app.set('views', app.get('config').paths.templates);

// Serve static files
app.use('/static', express.static(app.get('config').paths.static));
app.use('/favicon.ico', express.static(config.paths.static + '/images/favicon.ico'));

// Add CSP
/*eslint-disable */
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [
            "'self'",
            "data:",
        ],
        scriptSrc : [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            '*.google-analytics.com',
            "data:",
            function (req, res) {
                return `'nonce-${res.locals.nonce}'`;
            }
        ],
        styleSrc  : [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            'https://fonts.googleapis.com',
            "data:",
        ],
        imgSrc    : [
            "'self'",
            "*.google-analytics.com",
            "data:",
        ],
        connectSrc: [
            "'self'",
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
        ],
        fontSrc   : [
            "'self'",
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
        ],
        objectSrc : [
            "'none'",
        ],
        mediaSrc  : [
            "'none'",
        ],
        frameSrc  : [
            "'none'",
        ]
    },
    disableAndroid: true
}));
/*eslint-enable */

// Load routes
require('../web/routes')(app);

// login
app.use(require('../web/handlers/login'));

// Handle 404
app.use((req, res) => {
    const pageData = {
        'title' : 'Not found',
        'layout' :false
    };

    log.warn('404', {
        'method': req.method,
        'url'   : req.url,
        'query' : req.query,
        'ip'    : req.ip
    });

    res.status(404);
    res.render(`${req.app.get('config').paths.templates}/404`, pageData);
});

// Handle errors
app.use((err, req, res, next) => {
    if (! err) {
        return next();
    }

    if (err.code === 'EBADCSRFTOKEN'){
        // handle CSRF token errors
        res.status(403);
        return res.send('Please don\'t tamper my forms!');
    }

    log.error('500', {
        'method': req.method,
        'url'   : req.url,
        'query' : req.query,
        'ip'    : req.ip,
        'error' : err,
        'stack' : err.stack
    });


    const pageData = {
        'title' : 'Oops, something broke',
        'layout' :false
    };

    res.status(500);
    res.render(`${req.app.get('config').paths.templates}/500`, pageData);
});

app.listen(app.get('config').web.port);
log.info('Listening on port %s', app.get('config').web.port);
