var _ = require('lodash');

var cfg = {
    'appname'     : 'dashboard',
    'baseurl'     : process.env.BASEURL || 'http://localhost:8080',
    'env'         : process.env.NODE_ENV || 'development',
    'paths': {
        'tmp'      : __dirname + '/../web/_tmp',
        'static'   : __dirname + '/../web/static',
        'templates': __dirname + '/../web/static/views'
    },
    'web': {
        'port': process.env.PORT || 8080,
        'api': {
            'baseurl': 'http://localhost:3000/api',
            'version': '/v1'
        },
        'cookieParser': {
            'secret': 'changeThisBeforeDeployment'
        },
        'session':{
            'secret': 'changeThisBeforeDeploymentToo'
        },
        'bcrypt': {
            'rounds': 8
        }
    },
    'db': {
        'dynamodb': {
            'accessKeyId'    : '******************',
            'secretAccessKey': '******',
            'region'         : 'us-east-1',
            'endpoint'       : 'dynamodb.us-east-1.amazonaws.com'
        },
        'redis': {
            'host': '127.0.0.1',
            'port': 6379
        }
    }
};

module.exports = _.extend(cfg, require('./' + cfg.env));
