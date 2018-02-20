'use strict';

module.exports = (cfg, db) => {
    const mixins = require('../mixins')(cfg),
        Promise  = require('bluebird'),
        _        = require('lodash'),
        Storable = mixins.Storable,
        Store    = require('./store')(cfg).Store,
        table    = `analytics_dashboard_${cfg.env}_tenants`;

    class Tenant extends Storable {
        constructor() {
            super();

            /**
             * @property name
             * @type {string}
             */
            this.name = null;

            /**
             * @property email
             * @type {string}
             */
            this.email = null;

            /**
             * @property legacyId
             * @type {string}
             */
            this.legacyId = null;

            /**
             * @property apiKey
             * @type {string}
             */
            this.apiKey = null;

            /**
             * Stores belonging to the tenant
             *
             * @property stores
             * @type {string}
             */
            this.stores = [];

            /**
             * The user's access level in the system. Options:
             * - admin
             * - tenant
             * - user
             *
             * @property role
             * @type {String}
             * @default 'tenant'
             */
            this.role = 'tenant';
        }
    }

    class Repo {
        /**
         * Get a tenant by id
         *
         * @static
         * @method getById
         * @for    tenant.Repo
         * @param  {Object}  tenant
         * @return {Promise} Resolves to a tenant/null
         */
        static getById(id) {
            const params = {
                TableName: table,
                KeyConditionExpression: '#id = :id',
                ExpressionAttributeNames: {
                    '#id': 'id'
                },
                ExpressionAttributeValues: {
                    ':id'  : id
                }
            };

            return new Promise((resolve, reject) => {
                db.dynamodb.query(params, (err, data) => {
                    if (err) {
                        return reject(err);
                    }

                    resolve(_.create(new Tenant(), _.head(data.Items)));
                });
            });
        }
    }

    return {
        Tenant,
        Repo
    };
};
