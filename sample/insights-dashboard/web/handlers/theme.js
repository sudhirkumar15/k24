'use strict';

const express = require('express'),
    _         = require('lodash'),
    wrap      = require('co-express'),
    router    = express.Router();

router.post('/', wrap(function* (req, res, next) {
    let themes  = ['light', 'dark'],
        payload = {
            'success': false,
            'errors': []
        },
        user = _.omit(req.user, ['tenant', 'jwt', 'stores']),
        selected;

    if (! req.body.theme) {
        payload.errors.push('Please select a theme');
        return res.json(payload);
    }

    selected = _.trim(req.body.theme);

    if (_.indexOf(themes, selected) !== -1) {
        req.user.dashboard.theme = selected;

        user.dashboard.theme = selected;

        try {
            yield req.app.get('core').tenant.user.Repo.save(user);
        } catch (e) {
            return next(e);
        }

        payload.success = true;
        res.cookie('theme', selected);
        return res.json(payload);
    }

    payload.errors.push(`Theme ${req.body.theme} not found`);

    res.json(payload);
}));

module.exports = router;
