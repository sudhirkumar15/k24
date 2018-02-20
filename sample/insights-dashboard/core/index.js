'use strict';

const _     = require('lodash'),
    modules = [
        'mixins',
        'tenant',
        'token',
        'bookOpen',
        'events',
        'sessions',
        'retention',
        'funnel',
        'book',
        'institution',
        'timespent',
        'user'
    ];

function init(cfg) {
    const core = {},
    aws        = require('aws-sdk'),
    redis      = require('redis'),
    db         = {
        'redis': redis.createClient({
            'host'  : cfg.db.redis.host,
            'port'  : cfg.db.redis.port
        })
    };

    aws.config.update({
        accessKeyId    : cfg.db.dynamodb.accessKeyId,
        secretAccessKey: cfg.db.dynamodb.secretAccessKey,
        region         : cfg.db.dynamodb.region,
        endpoint       : cfg.db.dynamodb.endpoint
    });

    db.dynamodb = new aws.DynamoDB.DocumentClient();

    _.each(modules, (module) => {
        core[module] = require('./' + module)(cfg, db);
    });

    return core;
}

module.exports = init;
