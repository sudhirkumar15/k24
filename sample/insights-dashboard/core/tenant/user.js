'use strict';

module.exports = (cfg, db) => {
    const mixins   = require('../mixins')(cfg),
        Promise    = require('bluebird'),
        _          = require('lodash'),
        Loginable  = mixins.Loginable,
        table      = `analytics_dashboard_${cfg.env}_users`;

    class User extends Loginable {
        constructor() {
            super();

            /**
             * @property tenantId
             * @type {string}
             */
            this.tenantId = null;

            /**
             * @property apiKey
             * @type {string}
             */
            this.apiKey = null;

            /**List of store ids the user has access to
             *
             * @property storeIds
             * @type {string}
             */
            this.storeIds = [];

            /**
             * The user's access level in the system. Options:
             * - admin
             * - tenant
             * - user
             *
             * @property role
             * @type {String}
             * @default 'user'
             */
            this.role = 'user';

            /**dashboard
             *
             * @property dashboard
             * @type {Object}
             */
            this.dashboard = {
                'theme': 'dark'
            };
        }
    }

    class Repo {
        static save(user) {
            return new Promise((resolve, reject) => {
                db.dynamodb.put({'TableName': table, 'Item': user}, (err, data) => {
                    if (err) {
                        return reject(err);
                    }

                    resolve(data);
                });
            });
        }

        // PENDING - CHECK IF ACCOUNT IS ACTIVE
        static getByEmail(email) {
            return new Promise((resolve, reject) => {
                const params = {
                    'TableName': table,
                    KeyConditionExpression: '#key = :keyval',
                    ExpressionAttributeNames: {
                        '#key': 'email'
                    },
                    ExpressionAttributeValues: {
                        ':keyval': email
                    }
                };

                db.dynamodb.query(params, (err, data) => {
                    if (err) {
                        return reject(err);
                    }

                    if (! data.Items.length) {
                        return resolve(null);
                    }

                    resolve(_.create(new User(), _.head(data.Items)));
                });

            });
        }

        static getByAPIKey(apiKey) {
            const params = {
                TableName: table,
                FilterExpression: '#apiKey = :apiKey AND isActive = :true',
                ExpressionAttributeNames: {
                    '#apiKey': 'apiKey',
                },
                ExpressionAttributeValues: {
                    ':apiKey': apiKey,
                    ':true'  : true
                }
            };

            return new Promise((resolve, reject) => {
                db.dynamodb.scan(params, (err, data) => {
                    if (err) {
                        return reject(err);
                    }

                    if (! data.Items.length) {
                        return resolve(null);
                    }

                    resolve(_.create(new User(), _.first(data.Items)));
                });
            });
        }

        static getById(id) {
            const params = {
                TableName: table,
                FilterExpression: '#id = :id AND isActive = :true',
                ExpressionAttributeNames: {
                    '#id': 'id'
                },
                ExpressionAttributeValues: {
                    ':id'  : id,
                    ':true': true // thanks amazon
                }
            };

            return new Promise((resolve, reject) => {
                db.dynamodb.scan(params, (err, data) => {
                    if (err) {
                        return reject(err);
                    }

                    if (! data.Items.length) {
                        return resolve(null);
                    }

                    resolve(_.create(new User(), _.first(data.Items)));
                });
            });
        }
    }

    return {
        User,
        Repo
    };
};
