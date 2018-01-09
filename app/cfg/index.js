// var _ = require('lodash');
var path = require('path');

module.exports = {
    'appname'     : 'IPC-POC',
    'baseurl'     : process.env.BASEURL || 'http://localhost:1355',
    'env'         : process.env.NODE_ENV || 'development',
    'appsecrect'  : 'e56e5yhe6y45645w',
    'paths': {
        'tmp'      : path.resolve(path.join(path.dirname('cfg'), '.', '')) + "/tmp",
    },
    'web': {
        'port': process.env.PORT || 1355,
        'api': {
            'baseurl': 'http://localhost:1355',
            'version': '/v1'
        },
        'bcrypt': {
            'rounds': 8
        },
        'jwt': {
            'secrect':'p4WhWOa5'
        }
    },
    'validation' : {
        
    },
    'db': {
        'mysql': {
            'host'     : '127.0.0.1',
            'user'     : 'root',
            'password' : 'pass',
            'database' : 'ipc'
        }
    }
};


