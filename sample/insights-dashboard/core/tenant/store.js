'use strict';
/**
 * @module store
 */
module.exports = (cfg) => {
    const mixins    = require('../mixins')(cfg),
        Timestamped = mixins.Timestamped;
    /**
     * @constructor
     * @class store.Store
     * @uses mixins.Timestamped
     */
    class Store extends Timestamped {
        constructor() {

            super();
            /**
             * @property id
             * @type {string}
             */
            this.id = null;

            /**
             * @property name
             * @type {string}
             */
            this.name = null;

            /**
             * @property url
             * @type {string}
             */
            this.url = null;
        }
    }

    return {
        Store
    };
};
