'use strict';

const express = require('express'),
    qs        = require('querystring'),
    router    = express.Router();

router.use((req, res, next) => {
    if (!req.user) {
        return res.redirect(`/?${qs.stringify({
            'r': req.originalUrl
        })}`);
    }

    next();
});

module.exports = router;
