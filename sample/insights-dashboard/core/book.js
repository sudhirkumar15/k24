'use strict';

module.exports = (cfg) => {
    const qs    = require('qs'),
        request = require('request'),
        Promise = require('bluebird');

    class Book {
        /**
         * Get top books
         *
         * @static
         * @method getTopBooks
         * @for    Book
         * @param  {String}  jwt
         * @param  {String}  tenantId
         * @param  {String}  storeId
         * @param  {String}  startDate
         * @param  {String}  endDate
         * @param  {Array}   events
         * @param  {Array}   institutionIds
         * @param  {Array}   productIds
         * @param  {Number}  limit
         * @param  {Array}   platforms
         * @param  {Array}   deviceMakes
         * @param  {Array}   deviceModels
         * @param  {Array}   appVersions
         * @return {Promise} Resolves to a list
         */
        static getTopBooks(jwt, tenantId, storeId, startDate, endDate, events, institutionIds, productIds, limit, platforms, deviceMakes, deviceModels, appVersions) {
            const params = {
                    tenantId,
                    storeId,
                    startDate,
                    endDate,
                    events,
                    institutionIds,
                    productIds,
                    limit,
                    platforms,
                    deviceMakes,
                    deviceModels,
                    appVersions
                },
                req = {
                    method : 'get',
                    json   : true,
                    url    : `${cfg.web.api.baseurl}${cfg.web.api.version}/reports/books/top?${qs.stringify(params)}`,
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
         * Get pdf page activities
         *
         * @static
         * @method getPdfPageActivity
         * @for    Book
         * @param  {String}  jwt
         * @param  {String}  tenantId
         * @param  {String}  storeId
         * @param  {String}  bookId
         * @param  {String}  startDate
         * @param  {String}  endDate
         * @param  {Array}   events
         * @param  {Array}   institutionIds
         * @param  {Array}   platforms
         * @param  {Array}   deviceMakes
         * @param  {Array}   deviceModels
         * @param  {Array}   appVersions
         * @return {Promise} Resolves to a list
         */
        static getPdfPageActivity(jwt, tenantId, storeId, bookId, startDate, endDate, events, institutionIds, platforms, deviceMakes, deviceModels, appVersions) {
            const params = {
                    tenantId,
                    storeId,
                    bookId,
                    startDate,
                    endDate,
                    events,
                    institutionIds,
                    platforms,
                    deviceMakes,
                    deviceModels,
                    appVersions
                },
                req = {
                    method : 'get',
                    json   : true,
                    url    : `${cfg.web.api.baseurl}${cfg.web.api.version}/reports/books/pages?${qs.stringify(params)}`,
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
         * Get epub content activities
         *
         * @static
         * @method getEpubContentActivity
         * @for    Book
         * @param  {String}  jwt
         * @param  {String}  tenantId
         * @param  {String}  storeId
         * @param  {String}  bookId
         * @param  {String}  startDate
         * @param  {String}  endDate
         * @param  {Array}   events
         * @param  {Array}   institutionIds
         * @param  {Array}   platforms
         * @param  {Array}   deviceMakes
         * @param  {Array}   deviceModels
         * @param  {Array}   appVersions
         * @return {Promise} Resolves to a list
         */
        static getEpubContentActivity(jwt, tenantId, storeId, bookId, startDate, endDate, events, institutionIds, platforms, deviceMakes, deviceModels, appVersions) {
            const params = {
                    tenantId,
                    storeId,
                    bookId,
                    startDate,
                    endDate,
                    events,
                    institutionIds,
                    platforms,
                    deviceMakes,
                    deviceModels,
                    appVersions
                },
                req = {
                    method : 'get',
                    json   : true,
                    url    : `${cfg.web.api.baseurl}${cfg.web.api.version}/reports/books/contents?${qs.stringify(params)}`,
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
         * Get books
         *
         * @static
         * @method getBooks
         * @for    book
         * @param  {String}  jwt
         * @param  {String}  tenantId
         * @param  {String}  storeId
         * @return {Promise} Resolves to a list
         */
        static getBooks(jwt, tenantId, storeId) {
            const params = {
                    tenantId,
                    storeId
                },
                req = {
                    method : 'get',
                    json   : true,
                    url    : `${cfg.web.api.baseurl}${cfg.web.api.version}/reports/books?${qs.stringify(params)}`,
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

    return Book;
};
