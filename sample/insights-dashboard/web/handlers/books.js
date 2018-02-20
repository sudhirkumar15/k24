'use strict';

const express = require('express'),
    router    = express.Router(),
    moment    = require('moment'),
    wrap      = require('co-express'),
    _         = require('lodash'),
    json2csv  = require('json2csv');

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
        req.app.get('log').warn('books', {
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
        report = yield req.app.get('core').book.getBooks(
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

        req.app.get('log').warn('books', {
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

router.get('/activity', require('./auth'));
router.get('/activity', (req, res) => {
    const assets = req.app.get('assets');

    const pageData = {
        'title' : 'Book Activities',
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
            assets.bookActivity.js,
        ],
        'query' : req.query,
        'csrfToken': req.csrfToken()
    };

    res.render(`${req.app.get('config').paths.templates}/books/activity`, pageData);
});

router.get('/daily', require('./auth'));
router.get('/daily', (req, res) => {
    const assets = req.app.get('assets');

    const pageData = {
        'title' : 'Daily Book Reports',
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
            assets.bookDailyReport.js,
        ],
        'query' : req.query,
        'csrfToken': req.csrfToken()
    };

    res.render(`${req.app.get('config').paths.templates}/books/daily`, pageData);
});

router.get('/dashboard', require('./auth'));
router.get('/dashboard', (req, res) => {
    const assets = req.app.get('assets');

    const pageData = {
        'title' : 'Books dashboard',
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
            assets.bookDashboard.js,
        ],
        'query' : req.query,
        'csrfToken': req.csrfToken()
    };

    res.render(`${req.app.get('config').paths.templates}/books/dashboard`, pageData);
});

router.post('/top', require('./auth'));
router.post('/top', require('./middlewares/getJWT'));
router.post('/top', wrap(function*(req, res, next) {
    let report,
        response = {
            'success' : true,
            'errors'  : [],
            'data'    : []
        };

    if (!req.user.jwt) {
        req.app.get('log').warn('books', {
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
        report = yield req.app.get('core').book.getTopBooks(
            req.user.jwt,
            req.user.tenant.id,
            req.body.storeId,
            moment(req.body.startDate, 'MMM D, YYYY').format('YYYY-MM-DD'),
            moment(req.body.endDate, 'MMM D, YYYY').format('YYYY-MM-DD'),
            req.body.events,
            req.body.institutionIds,
            req.body.productIds,
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

        req.app.get('log').warn('topBooks', {
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

router.get('/heatmap/pdf', require('./auth'));
router.get('/heatmap/pdf', (req, res) => {
    const assets = req.app.get('assets');

    const pageData = {
        'title' : 'PdfHeatmaps',
        'stores': _.map(req.user.stores, (store) => {
            return {
                'id'  : store.id,
                'name': store.name
            };
        }),
        'css'   : [
            assets.vendor.css,
            '../../static/thirdparty/chosen/chosen.css',
        ],
        'js'    : [
            assets.pdfHeatmap.js,
        ],
        'product' : req.query,
        'csrfToken': req.csrfToken()
    };

    res.render(`${req.app.get('config').paths.templates}/books/pdfHeatmap`, pageData);
});

router.get('/heatmap/epub(3)?', require('./auth'));
router.get('/heatmap/epub(3)?', (req, res) => {
    const assets = req.app.get('assets');

    const pageData = {
        'title' : 'ePubHeatmap',
        'stores': _.map(req.user.stores, (store) => {
            return {
                'id'  : store.id,
                'name': store.name
            };
        }),
        'css'   : [
            assets.vendor.css,
            '/../static/thirdparty/chosen/chosen.css',
        ],
        'js'    : [
            assets.epubHeatmap.js,
        ],
        'product' : req.query,
        'csrfToken': req.csrfToken()
    };

    res.render(`${req.app.get('config').paths.templates}/books/epubHeatmap`, pageData);
});

router.post('/pdf/pages', require('./auth'));
router.post('/pdf/pages', require('./middlewares/getJWT'));
router.post('/pdf/pages', wrap(function*(req, res, next) {
    let report,
        response = {
            'success' : true,
            'errors'  : [],
            'data'    : []
        };

    if (!req.user.jwt) {
        req.app.get('log').warn('pages', {
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
        report = yield req.app.get('core').book.getPdfPageActivity(
            req.user.jwt,
            req.user.tenant.id,
            req.body.storeId,
            req.body.bookId,
            moment(req.body.startDate, 'MMM D, YYYY').format('YYYY-MM-DD'),
            moment(req.body.endDate, 'MMM D, YYYY').format('YYYY-MM-DD'),
            req.body.events,
            req.body.institutionIds,
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

        req.app.get('log').warn('pages', {
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

router.post('/epub/contents', require('./auth'));
router.post('/epub/contents', require('./middlewares/getJWT'));
router.post('/epub/contents', wrap(function*(req, res, next) {
    let report,
        response = {
            'success' : true,
            'errors'  : [],
            'data'    : []
        };

    if (!req.user.jwt) {
        req.app.get('log').warn('contents', {
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
        report = yield req.app.get('core').book.getEpubContentActivity(
            req.user.jwt,
            req.user.tenant.id,
            req.body.storeId,
            req.body.bookId,
            moment(req.body.startDate, 'MMM D, YYYY').format('YYYY-MM-DD'),
            moment(req.body.endDate, 'MMM D, YYYY').format('YYYY-MM-DD'),
            req.body.events,
            req.body.institutionIds,
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

        req.app.get('log').warn('contents', {
            'method' : req.method,
            'url'    : req.originalUrl,
            'query'  : req.query,
            'ip'     : req.ip,
            'res'    : JSON.stringify(report),
            'status' : report.status
        });

        return res.json(response);
    }

    response.data = report.data;

    req.app.get('log').info('contents', {
        'method' : req.method,
        'url'    : req.originalUrl,
        'query'  : req.query,
        'ip'     : req.ip,
        'res'    : JSON.stringify(response),
        'status' : report.status
    });

    res.json(response);
}));

router.post('/timespent/summary', require('./auth'));
router.post('/timespent/summary', require('./middlewares/getJWT'));
router.post('/timespent/summary', wrap(function*(req, res, next) {
    let report,
        response = {
            'success' : true,
            'errors'  : [],
            'data'    : []
        };

    if (!req.user.jwt) {
        req.app.get('log').warn('books/timespent/summary', {
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
        report = yield req.app.get('core').timespent.getBookTimeSpentSummary(
            req.user.jwt,
            req.user.tenant.id,
            req.body.storeId,
            moment(req.body.startDate, 'MMM D, YYYY').format('YYYY-MM-DD'),
            moment(req.body.endDate, 'MMM D, YYYY').format('YYYY-MM-DD'),
            req.body.institutionIds,
            req.body.productIds,
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

        req.app.get('log').warn('books/timespent/summary', {
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

router.post('/timespent', require('./auth'));
router.post('/timespent', require('./middlewares/getJWT'));
router.post('/timespent', wrap(function*(req, res, next) {
    let report,
        response = {
            'success' : true,
            'errors'  : [],
            'data'    : []
        };

    if (!req.user.jwt) {
        req.app.get('log').warn('books/timespent', {
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
        report = yield req.app.get('core').timespent.getBooksAndDuration(
            req.user.jwt,
            req.user.tenant.id,
            req.body.storeId,
            moment(req.body.startDate, 'MMM D, YYYY').format('YYYY-MM-DD'),
            moment(req.body.endDate, 'MMM D, YYYY').format('YYYY-MM-DD'),
            req.body.institutionIds,
            req.body.productIds,
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

        req.app.get('log').warn('books/timespent', {
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

router.post('/activity/export', require('./auth'));
router.post('/activity/export', require('./middlewares/exportCSV'));

router.post('/timespent/export', require('./auth'));
router.post('/timespent/export', (req, res, next) => {
    let data = JSON.parse(req.body.export);

    data.report = _.map(data.report, (report) => {
        return _.omit(report, ['duration']);
    });

    const first = _.head(data.report);

    const fields = _.keys(first);

    const options = {
        data       : data.report,
        fields     : fields,
        fieldNames : _.map(fields, _.startCase)
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
