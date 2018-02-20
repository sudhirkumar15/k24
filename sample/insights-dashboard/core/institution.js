'use strict';

module.exports = (cfg) => {
    const qs    = require('qs'),
        request = require('request'),
        Promise = require('bluebird');

    class Institution {

        /**
         * Get Institutions
         *
         * @static
         * @method getInstitutions
         * @for    Institution
         * @param  {String}  jwt
         * @param  {String}  tenantId
         * @param  {String}  storeId
         * @return {Promise} Resolves to a list
         */
        static getInstitutions(jwt, tenantId, storeId) {
            const params = {
                    tenantId,
                    storeId
                },
                req = {
                    method : 'get',
                    json   : true,
                    url    : `${cfg.web.api.baseurl}${cfg.web.api.version}/reports/institutions?${qs.stringify(params)}`,
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

    return Institution;
};
