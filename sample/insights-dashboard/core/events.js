'use strict';

module.exports = (cfg) => {
    const qs    = require('qs'),
        request = require('request'),
        Promise = require('bluebird');

    class Events {

        /**
         * Get events reports
         *
         * @static
         * @method getReport
         * @for    Events
         * @param  {String}  jwt
         * @param  {String}  tenantId
         * @param  {String}  storeId
         * @param  {String}  startDate
         * @param  {String}  endDate
         * @param  {Array}   dimension
         * @param  {Array}   segment
         * @param  {Array}   eventTypes
         * @param  {Array}   source
         * @param  {Array}   platforms
         * @param  {Array}   deviceMakes
         * @param  {Array}   deviceModels
         * @param  {Array}   appVersions
         * @param  {Array}   institutionIds
         * @param  {Array}   productIds
         * @return {Promise} Resolves to a list
         */
        static getReport(jwt, tenantId, storeId, startDate, endDate, dimension, segment, eventTypes, source, platforms, deviceMakes, deviceModels, appVersions, institutionIds, productIds) {
            const params = {
                    tenantId,
                    storeId,
                    startDate,
                    endDate,
                    dimension,
                    segment,
                    eventTypes,
                    source,
                    platforms,
                    deviceMakes,
                    deviceModels,
                    appVersions,
                    institutionIds,
                    productIds
                },
                req = {
                    method : 'get',
                    json   : true,
                    url    : `${cfg.web.api.baseurl}${cfg.web.api.version}/reports/events?${qs.stringify(params)}`,
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

        /**
         * Get events filters
         *
         * @static
         * @method getFilters
         * @for    Events
         * @param  {String}  jwt
         * @param  {String}  tenantId
         * @param  {String}  storeId
         * @param  {String}  type
         * @return {Promise} Resolves to a list
         */
        static getFilters(jwt, tenantId, storeId, type) {
            const params = {
                    tenantId,
                    storeId,
                    type
                },
                req = {
                    method : 'get',
                    json   : true,
                    url    : `${cfg.web.api.baseurl}${cfg.web.api.version}/reports/events/filters?${qs.stringify(params)}`,
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

    return Events;
};
