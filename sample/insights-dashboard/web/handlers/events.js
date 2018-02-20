'use strict';

const express = require('express'),
    router    = express.Router(),
    moment    = require('moment'),
    wrap      = require('co-express'),
    _         = require('lodash'),
    json2csv  = require('json2csv');

router.get('/', require('./auth'));
router.get('/', (req, res) => {
    const assets = req.app.get('assets');

    const pageData = {
        'title' : 'Dashboard',
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
            assets.event.js,
        ],
        'csrfToken': req.csrfToken()
    };

    res.render(`${req.app.get('config').paths.templates}/events/index`, pageData);
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
        req.app.get('log').warn('events', {
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
        report = yield req.app.get('core').events.getReport(
            req.user.jwt,
            req.user.tenant.id,
            req.body.storeId,
            moment(req.body.startDate, 'MMM D, YYYY').format('YYYY-MM-DD'),
            moment(req.body.endDate, 'MMM D, YYYY').format('YYYY-MM-DD'),
            req.body.dimension,
            req.body.segment,
            req.body.eventTypes,
            req.body.source,
            req.body.platforms,
            req.body.deviceMakes,
            req.body.deviceModels,
            req.body.appVersions,
            req.body.institutionIds,
            req.body.productIds
        );
    } catch (e) {
        return next(e);
    }

    if (report.errors.length) {
        response.success = false;
        response.errors = _.map(report.errors, (error) => {
            return error.message;
        });

        req.app.get('log').warn('events', {
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

    response.data = report.data;
    res.json(response);
}));

router.post('/filters', require('./auth'));
router.post('/filters', require('./middlewares/getJWT'));
router.post('/filters', wrap(function*(req, res, next) {
    let report,
        response = {
            'success' : true,
            'errors'  : [],
            'data'    : []
        };

    if (!req.user.jwt) {
        req.app.get('log').warn('events', {
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
        report = yield req.app.get('core').events.getFilters(
            req.user.jwt,
            req.user.tenant.id,
            req.body.storeId,
            req.body.type
        );
    } catch (e) {
        return next(e);
    }

    if (report.errors.length) {
        response.success = false;
        response.errors = _.map(report.errors, (error) => {
            return error.message;
        });

        req.app.get('log').warn('events', {
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

router.post('/export', require('./auth'));
router.post('/export', (req, res, next) => {
    const data = JSON.parse(req.body.export);

    const first = _.head(data.report);

    const fields = _.filter(_.keys(first), (key) => {
        if (first[key]) {
            return key;
        }
    });

    const options = {
        data       : data.report,
        fields     : fields,
        fieldNames : data.headings
    };

    json2csv(options, (err, csv) => {
        if (err) {
            return next(err);
        }

        res.attachment('Report.csv');
        res.send(csv);
    });
});

module.exports = router;
