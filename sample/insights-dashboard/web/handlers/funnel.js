'use strict';

const express = require('express'),
    router    = express.Router(),
    moment    = require('moment'),
    wrap      = require('co-express'),
    _         = require('lodash');

router.get('/:name', require('./auth'));
router.get('/:name', (req, res) => {
    const assets = req.app.get('assets');

    const pageData = {
        'title' : 'Funnel Reports',
        'stores': _.map(req.user.stores, (store) => {
            return {
                'id'  : store.id,
                'name': store.name
            };
        }),
        'css'   : [
            assets.vendor.css,
            '../static/thirdparty/chosen/chosen.css',
        ],
        'js'    : [
            assets.funnel.js,
        ],
        'query' : req.params,
        'csrfToken': req.csrfToken()
    };

    res.render(`${req.app.get('config').paths.templates}/funnel/index`, pageData);
});

router.post('/', require('./auth'));
router.post('/', require('./middlewares/getJWT'));
router.post('/', wrap(function*(req, res, next) {
    let report,
        response = {
            'success' : true,
            'errors'  : [],
            'data'    : []
        };

    if (!req.user.jwt) {
        req.app.get('log').warn('funnel', {
            'method' : req.method,
            'url'    : req.originalUrl,
            'query'  : req.query,
            'ip'     : req.ip,
            'message': 'Could not get jwt'
        });

        response.success = false;
        response.errors.push('Something went wrong!');

        return res.json(response);
    }

    try {
        report = yield req.app.get('core').funnel.getReport(
            req.user.jwt,
            req.user.tenant.id,
            req.body.storeId,
            req.body.steps,
            moment(req.body.startDate, 'MMM D, YYYY').format('YYYY-MM-DD'),
            moment(req.body.endDate, 'MMM D, YYYY').format('YYYY-MM-DD'),
            req.body.platform,
            req.body.appVersion,
            req.body.institutionIds
        );
    } catch (e) {
        return next(e);
    }

    if (report.errors.length) {
        response.success = false;
        response.errors = _.map(report.errors, (error) => {
            return error.message;
        });

        req.app.get('log').warn('funnel', {
            'method' : req.method,
            'url'    : req.originalUrl,
            'query'  : req.query,
            'ip'     : req.ip,
            'res'    : JSON.stringify(report),
            'status' : report.status,
            'message': 'Errors were encountered'
        });

        return res.json(response);
    }

    response.data = _.first(report.data);
    res.json(response);
}));

module.exports = router;
