'use strict';

module.exports = (cfg) => {
    const qs    = require('qs'),
        request = require('request'),
        Promise = require('bluebird');

    class Timespent {

        /**
         * Get book read duration and date timestamp
         *
         * @static
         * @method getBookTimeSpentSummary
         * @for    Readings
         * @param  {String}  jwt
         * @param  {String}  tenantId
         * @param  {String}  storeId
         * @param  {String}  startDate
         * @param  {String}  endDate
         * @param  {Array}   institutionIds
         * @param  {Array}   productIds
         * @param  {Array}   platforms
         * @param  {Array}   deviceMakes
         * @param  {Array}   deviceModels
         * @param  {Array}   appVersions
         * @return {Promise} Resolves to a list
         */
        static getBookTimeSpentSummary(jwt, tenantId, storeId, startDate, endDate, institutionIds, productIds, platforms, deviceMakes, deviceModels, appVersions) {
            const params = {
                    tenantId,
                    storeId,
                    startDate,
                    endDate,
                    institutionIds,
                    productIds,
                    platforms,
                    deviceMakes,
                    deviceModels,
                    appVersions
                },
                req = {
                    method : 'get',
                    json   : true,
                    url    : `${cfg.web.api.baseurl}${cfg.web.api.version}/reports/books/timespent/summary?${qs.stringify(params)}`,
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

        /**
         * Get books and read duration
         *
         * @static
         * @method getBooks
         * @for    Readings
         * @param  {String}  jwt
         * @param  {String}  tenantId
         * @param  {String}  storeId
         * @param  {String}  startDate
         * @param  {String}  endDate
         * @param  {Array}   institutionIds
         * @param  {Array}   productIds
         * @param  {Array}   platforms
         * @param  {Array}   deviceMakes
         * @param  {Array}   deviceModels
         * @param  {Array}   appVersions
         * @return {Promise} Resolves to a list
         */
        static getBooksAndDuration(jwt, tenantId, storeId, startDate, endDate, institutionIds, productIds, platforms, deviceMakes, deviceModels, appVersions) {
            const params = {
                    tenantId,
                    storeId,
                    startDate,
                    endDate,
                    institutionIds,
                    productIds,
                    platforms,
                    deviceMakes,
                    deviceModels,
                    appVersions
                },
                req = {
                    method : 'get',
                    json   : true,
                    url    : `${cfg.web.api.baseurl}${cfg.web.api.version}/reports/books/timespent?${qs.stringify(params)}`,
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

    return Timespent;
};
