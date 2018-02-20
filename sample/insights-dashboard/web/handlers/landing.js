'use strict';

const express = require('express'),
    router    = express.Router();

router.get('/', (req, res) => {
    const assets = req.app.get('assets');

    const pageData = {
        'title'     : 'Insights',
        'layout'    :'landing',
        'csrfToken' : req.csrfToken(),
        'redirectTo': req.query.r ? '?r=' + req.query.r : '',
        'js'        : [
            assets.vendor.js,
            assets.landing.js,
        ],
        'css': [
            assets.vendor.css,
            assets.landing.css,
        ]
    };

    res.render(`${req.app.get('config').paths.templates}/landing/landing`, pageData);
});

module.exports = router;
