'use strict';

module.exports = (cfg) => {
    const request = require('request'),
        Promise   = require('bluebird');

    class Token {
        static getJWT(apiKey) {
            let params = {
                'X-API-KEY': apiKey
            },
            payload = {
                method: 'post',
                body  : params,
                json  : true,
                url   : `${cfg.web.api.baseurl}${cfg.web.api.version}/tokens`,
                headers: {
                    'X-API-KEY': apiKey
                }
            };

            return new Promise((resolve, reject) => {
                request(payload, (err, response, body) => {
                    if (err) {
                        return reject(err);
                    }

                    resolve(body);
                });
            });
        }
    }

    return Token;
};
