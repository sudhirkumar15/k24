'use strict';

module.exports = (app, cfg) => {
    
    const connection = require('../cfg/connection')(cfg),
    _                = require('lodash'),

    modules = [
        'auth',
        'users',
        'publisher',
        'sites',
        'status',
    ],

    core = {};

    _.each(modules, module => core[module] = require('./' + module)(app, connection, cfg));

    return core;
};
