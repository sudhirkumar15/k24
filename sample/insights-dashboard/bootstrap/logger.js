'use strict';

const bunyan = require('bunyan'),
    cfg      = require('../cfg');

module.exports = bunyan.createLogger({
    name: cfg.appname,
    streams: [
        {
            stream: process.stdout,
            level: 'debug'
        },
        {
            path :  cfg.appname + '.log',
            level: 'trace'
        }
    ],
    serializers: {
      req: bunyan.stdSerializers.req,
      res: bunyan.stdSerializers.res
    }
});