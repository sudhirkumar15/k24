'use strict';

module.exports = (cfg) => {
    const qs    = require('qs'),
        request = require('request'),
        Promise = require('bluebird');

    class Retention {
        static getReport(jwt, tenantId, storeId, startDate, endDate, dimension, institutionIds) {
            const params = {
                    tenantId,
                    storeId,
                    startDate,
                    endDate,
                    dimension,
                    institutionIds
                },
                req = {
                    method : 'get',
                    json   : true,
                    url    : `${cfg.web.api.baseurl}${cfg.web.api.version}/reports/retention?${qs.stringify(params)}`,
                    headers: {
                        'X-JWT': jwt
                    }
                };

            return new Promise((resolve, reject) => {
                request(req, (err, response, body) => {
                    if (err) {
                        return reject(err);
                    }

                    if (response.statusCode >= 500) {
                        return resolve({
                            'status'     : response.statusCode,
                            'data'       : [],
                            'errors'     : [{
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

    return Retention;
};
