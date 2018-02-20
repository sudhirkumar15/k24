'use strict';

const express = require('express'),
    router    = express.Router(),
    _         = require('lodash'),
    jwt       = require('jsonwebtoken'),
    wrap      = require('co-express');

router.use(wrap(function* (req, res, next) {
    if (req.user.jwt) {
        // check if jwt in session is still valid
        const decoded = jwt.decode(req.user.jwt);

        //jwt is still valid
        if (_.now() < decoded.exp) {
            req.app.get('log').info('getJWT', {
                'method' : req.method,
                'url'    : req.originalUrl,
                'query'  : req.query,
                'ip'     : req.ip,
                'message': 'Get jwt from session'
            });

            return next();
        }
    }

    let response;

    try {
        response = yield req.app.get('core').token.getJWT(req.user.apiKey);

        if (! response.status) {
            return next();
        }

        req.app.get('log').info('getJWT', {
            'method' : req.method,
            'url'    : req.originalUrl,
            'query'  : req.query,
            'ip'     : req.ip,
            'message': 'Get jwt from api'
        });

        req.user.jwt = _.first(response.data).token;
    } catch (e) {
        return next(e);
    }

    next();
}));

module.exports = router;
