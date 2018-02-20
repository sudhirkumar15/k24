'use strict';

const express = require('express'),
    router    = express.Router();

router.get('/', require('./auth'));
router.get('/', require('./middlewares/getJWT'));
router.get('/', (req, res) => {
    const assets = req.app.get('assets');

    const pageData = {
        'title': 'Dashboard',
        'js'   : [
            assets.dashboard.js,
        ],
        'css'   : [
            assets.vendor.css,
            '../static/thirdparty/chosen/chosen.css', // chosen-npm has a blank css file.
        ],
        'csrfToken': req.csrfToken()
    };

    res.render(`${req.app.get('config').paths.templates}/dashboard/index`, pageData);
});

module.exports = router;
