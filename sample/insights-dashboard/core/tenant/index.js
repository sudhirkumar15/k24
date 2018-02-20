'use strict';

module.exports = (cfg, db) => {
    const _     = require('lodash'),
        modules = [
            'user',
            'store',
        ],
        expose  = {};

   _.each(modules, (module) => {
       expose[module] = require('./' + module)(cfg, db);
   });

   _.extend(expose, require('./tenant')(cfg, db));

   return expose;
};
