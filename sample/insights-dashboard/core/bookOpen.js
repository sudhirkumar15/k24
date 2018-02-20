'use strict';

module.exports = (cfg) => {
    const qs    = require('qs'),
        request = require('request'),
        Promise = require('bluebird');

    class BookOpen {
        static getReport(jwt, publisherId, siteId, startDate, endDate) {
            let params = {
                'publisherId': publisherId,
                'siteId'     : siteId,
                'startDate'  : startDate,
                'endDate'    : endDate
            },
            req = {
                method  : 'get',
                json   : true,
                url     : `${cfg.web.api.baseurl}${cfg.web.api.version}/reports/bookOpen?${qs.stringify(params)}`,
                headers : {
                    'X-JWT': jwt
                }
            };

            return new Promise(function (resolve, reject) {
                request(req, function (err, response, body) {
                    if (err) {
                        return reject(err);
                    }

                    if (response.statusCode >= 500) {
                        return resolve({
                            'status': response.statusCode,
                            'data'  : [],
                            'errors': [{
                                'field'  : 'API endpoint',
                                'message': 'API not reachable'
                            }]
                        });
                    }

                    resolve(body);
                });
            });
        }
    }

    return BookOpen;
};
