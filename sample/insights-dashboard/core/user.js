'use strict';

module.exports = (cfg) => {
    const qs    = require('qs'),
        request = require('request'),
        Promise = require('bluebird');

    class User {

        /**
         * Get users
         *
         * @static
         * @method getUsers
         * @for    book
         * @param  {String}  jwt
         * @param  {String}  tenantId
         * @param  {String}  storeId
         * @return {Promise} Resolves to a list
         */
        static getUsers(jwt, tenantId, storeId) {
            const params = {
                    tenantId,
                    storeId
                },
                req = {
                    method : 'get',
                    json   : true,
                    url    : `${cfg.web.api.baseurl}${cfg.web.api.version}/reports/users?${qs.stringify(params)}`,
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
         * Get a summary of user count and timestamp
         *
         * @static
         * @method getUserEventSummary
         * @for    Book
         * @param  {String}  jwt
         * @param  {String}  tenantId
         * @param  {String}  storeId
         * @param  {Array}   events
         * @param  {String}  startDate
         * @param  {String}  endDate
         * @param  {Array}   institutionIds
         * @param  {Array}   userIds
         * @param  {Array}   platforms
         * @param  {Array}   deviceMakes
         * @param  {Array}   deviceModels
         * @param  {Array}   appVersions
         * @return {Promise} Resolves to a list
         */
        static getUserEventSummary(jwt, tenantId, storeId, events, startDate, endDate, institutionIds, userIds, platforms, deviceMakes, deviceModels, appVersions) {
            const params = {
                    tenantId,
                    storeId,
                    startDate,
                    endDate,
                    events,
                    institutionIds,
                    userIds,
                    platforms,
                    deviceMakes,
                    deviceModels,
                    appVersions
                },
                req = {
                    method : 'get',
                    json   : true,
                    url    : `${cfg.web.api.baseurl}${cfg.web.api.version}/reports/users/events/summary?${qs.stringify(params)}`,
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
         * Get a list of user and event count
         *
         * @static
         * @method getUserEvents
         * @for    Book
         * @param  {String}  jwt
         * @param  {String}  tenantId
         * @param  {String}  storeId
         * @param  {Array}   events
         * @param  {String}  startDate
         * @param  {String}  endDate
         * @param  {Array}   institutionIds
         * @param  {Array}   userIds
         * @param  {Number}  limit
         * @param  {Array}   platforms
         * @param  {Array}   deviceMakes
         * @param  {Array}   deviceModels
         * @param  {Array}   appVersions
         * @return {Promise} Resolves to a list
         */
        static getUserEvents(jwt, tenantId, storeId, events, startDate, endDate, institutionIds, userIds, limit, platforms, deviceMakes, deviceModels, appVersions) {
            const params = {
                    tenantId,
                    storeId,
                    events,
                    startDate,
                    endDate,
                    institutionIds,
                    userIds,
                    limit,
                    platforms,
                    deviceMakes,
                    deviceModels,
                    appVersions
                },
                req = {
                    method : 'get',
                    json   : true,
                    url    : `${cfg.web.api.baseurl}${cfg.web.api.version}/reports/users/events?${qs.stringify(params)}`,
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
         * Get a list of active users and session count
         *
         * @static
         * @method getActiveUsers
         * @for    Book
         * @param  {String}  jwt
         * @param  {String}  tenantId
         * @param  {String}  storeId
         * @param  {String}  startDate
         * @param  {String}  endDate
         * @param  {Array}   institutionIds
         * @param  {Array}   userIds
         * @param  {Number}  limit
         * @param  {Array}   platforms
         * @param  {Array}   deviceMakes
         * @param  {Array}   deviceModels
         * @param  {Array}   appVersions
         * @return {Promise} Resolves to a list
         */
        static getActiveUsers(jwt, tenantId, storeId, startDate, endDate, institutionIds, userIds, limit, platforms, deviceMakes, deviceModels, appVersions) {
            const params = {
                    tenantId,
                    storeId,
                    startDate,
                    endDate,
                    institutionIds,
                    userIds,
                    limit,
                    platforms,
                    deviceMakes,
                    deviceModels,
                    appVersions
                },
                req = {
                    method : 'get',
                    json   : true,
                    url    : `${cfg.web.api.baseurl}${cfg.web.api.version}/reports/users/active?${qs.stringify(params)}`,
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
         * Get a list of new users and session count
         *
         * @static
         * @method getTopBooks
         * @for    Book
         * @param  {String}  jwt
         * @param  {String}  tenantId
         * @param  {String}  storeId
         * @param  {String}  startDate
         * @param  {String}  endDate
         * @param  {Array}   institutionIds
         * @param  {Array}   userIds
         * @param  {Number}  limit
         * @param  {Array}   platforms
         * @param  {Array}   deviceMakes
         * @param  {Array}   deviceModels
         * @param  {Array}   appVersions
         * @return {Promise} Resolves to a list
         */
        static getNewUsers(jwt, tenantId, storeId, startDate, endDate, institutionIds, userIds, limit, platforms, deviceMakes, deviceModels, appVersions) {
            const params = {
                    tenantId,
                    storeId,
                    startDate,
                    endDate,
                    institutionIds,
                    userIds,
                    limit,
                    platforms,
                    deviceMakes,
                    deviceModels,
                    appVersions
                },
                req = {
                    method : 'get',
                    json   : true,
                    url    : `${cfg.web.api.baseurl}${cfg.web.api.version}/reports/users/new?${qs.stringify(params)}`,
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

    return User;
};
