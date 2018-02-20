'use strict';

const express = require('express'),
    router    = express.Router(),
    moment    = require('moment'),
    wrap      = require('co-express'),
    _         = require('lodash');

router.get('/dashboard', require('./auth'));
router.get('/dashboard', (req, res) => {
    const assets = req.app.get('assets');

    const pageData = {
        'title' : 'Users dashboard',
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
            assets.userDashboard.js,
        ],
        'query' : req.query,
        'csrfToken': req.csrfToken()
    };

    res.render(`${req.app.get('config').paths.templates}/users/dashboard`, pageData);
});

router.get('/activity', require('./auth'));
router.get('/activity', (req, res) => {
    const assets = req.app.get('assets');

    const pageData = {
        'title' : 'User Activities',
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
            assets.userActivity.js,
        ],
        'query' : req.query,
        'csrfToken': req.csrfToken()
    };

    res.render(`${req.app.get('config').paths.templates}/users/activity`, pageData);
});

router.get('/daily', require('./auth'));
router.get('/daily', (req, res) => {
    const assets = req.app.get('assets');

    const pageData = {
        'title' : 'Daily User Activities',
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
            assets.userDailyReport.js,
        ],
        'query' : req.query,
        'csrfToken': req.csrfToken()
    };

    res.render(`${req.app.get('config').paths.templates}/users/daily`, pageData);
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
        req.app.get('log').warn('users', {
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
        report = yield req.app.get('core').user.getUsers(
            req.user.jwt,
            req.user.tenant.id,
            req.body.storeId
        );
    } catch (e) {
        return next(e);
    }

    if (report.errors.length) {
        response.success = false;
        response.errors = _.map(report.errors, 'message');

        req.app.get('log').warn('users', {
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

router.post('', require('./auth'));
router.post('/events/summary', require('./middlewares/getJWT'));
router.post('/events/summary', wrap(function*(req, res, next) {
    let report,
        response = {
            'success' : true,
            'errors'  : [],
            'data'    : []
        };

    if (!req.user.jwt) {
        req.app.get('log').warn('users/events/summary', {
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
        report = yield req.app.get('core').user.getUserEventSummary(
            req.user.jwt,
            req.user.tenant.id,
            req.body.storeId,
            req.body.events,
            moment(req.body.startDate, 'MMM D, YYYY').format('YYYY-MM-DD'),
            moment(req.body.endDate, 'MMM D, YYYY').format('YYYY-MM-DD'),
            req.body.institutionIds,
            req.body.userIds,
            req.body.platforms,
            req.body.deviceMakes,
            req.body.deviceModels,
            req.body.appVersions
        );
    } catch (e) {
        return next(e);
    }

    if (report.errors.length) {
        response.success = false;
        response.errors = _.map(report.errors, (error) => {
            return error.message;
        });

        req.app.get('log').warn('users/events/summary', {
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

router.post('/events', require('./auth'));
router.post('/events', require('./middlewares/getJWT'));
router.post('/events', wrap(function*(req, res, next) {
    let report,
        response = {
            'success' : true,
            'errors'  : [],
            'data'    : []
        };

    if (!req.user.jwt) {
        req.app.get('log').warn('users/events', {
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
        report = yield req.app.get('core').user.getUserEvents(
            req.user.jwt,
            req.user.tenant.id,
            req.body.storeId,
            req.body.events,
            moment(req.body.startDate, 'MMM D, YYYY').format('YYYY-MM-DD'),
            moment(req.body.endDate, 'MMM D, YYYY').format('YYYY-MM-DD'),
            req.body.institutionIds,
            req.body.userIds,
            req.body.limit,
            req.body.platforms,
            req.body.deviceMakes,
            req.body.deviceModels,
            req.body.appVersions
        );
    } catch (e) {
        return next(e);
    }

    if (report.errors.length) {
        response.success = false;
        response.errors = _.map(report.errors, 'message');

        req.app.get('log').warn('users/events', {
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

router.post('/active', require('./auth'));
router.post('/active', require('./middlewares/getJWT'));
router.post('/active', wrap(function*(req, res, next) {
    let report,
        response = {
            'success' : true,
            'errors'  : [],
            'data'    : []
        };

    if (!req.user.jwt) {
        req.app.get('log').warn('users/active', {
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
        report = yield req.app.get('core').user.getActiveUsers(
            req.user.jwt,
            req.user.tenant.id,
            req.body.storeId,
            moment(req.body.startDate, 'MMM D, YYYY').format('YYYY-MM-DD'),
            moment(req.body.endDate, 'MMM D, YYYY').format('YYYY-MM-DD'),
            req.body.institutionIds,
            req.body.userIds,
            req.body.limit,
            req.body.platforms,
            req.body.deviceMakes,
            req.body.deviceModels,
            req.body.appVersions
        );
    } catch (e) {
        return next(e);
    }

    if (report.errors.length) {
        response.success = false;
        response.errors = _.map(report.errors, (error) => {
            return error.message;
        });

        req.app.get('log').warn('users/active', {
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

router.post('/new', require('./auth'));
router.post('/new', require('./middlewares/getJWT'));
router.post('/new', wrap(function*(req, res, next) {
    let report,
        response = {
            'success' : true,
            'errors'  : [],
            'data'    : []
        };

    if (!req.user.jwt) {
        req.app.get('log').warn('users/new', {
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
        report = yield req.app.get('core').user.getNewUsers(
            req.user.jwt,
            req.user.tenant.id,
            req.body.storeId,
            moment(req.body.startDate, 'MMM D, YYYY').format('YYYY-MM-DD'),
            moment(req.body.endDate, 'MMM D, YYYY').format('YYYY-MM-DD'),
            req.body.institutionIds,
            req.body.userIds,
            req.body.limit,
            req.body.platforms,
            req.body.deviceMakes,
            req.body.deviceModels,
            req.body.appVersions
        );
    } catch (e) {
        return next(e);
    }

    if (report.errors.length) {
        response.success = false;
        response.errors = _.map(report.errors, (error) => {
            return error.message;
        });

        req.app.get('log').warn('users/new', {
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

router.post('/report/export', require('./auth'));
router.post('/report/export', require('./middlewares/exportCSV'));

module.exports = router;
