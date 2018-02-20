/**
 * Common mixins
 *
 * @module mixins
 */
'use strict';
module.exports = (cfg) => {
    const _    = require('lodash'),
        bcrypt = require('./bcrypt')(cfg);

    /**
     * A Timestamped entity
     *
     * @constructor
     * @class mixins.Timestamped
     */
    class Timestamped {
        constructor() {
            /**
             * @property createTime
             * @type {Date}
             */
            this._createTime = null;

            /**
             * @property updateTime
             * @type {Date}
             */
            this._updateTime = null;
        }

        get createTime() {
            return new Date(this._createTime);
        }

        get updateTime() {
            return new Date(this._updateTime);
        }

        set createTime(time) {
            this._createTime = time.getTime();
        }

        set updateTime(time) {
            this._updateTime = time.getTime();
        }

        /**
         * Update timestamps
         *
         * @method touch
         * @for mixins.Timestamped
         */
        touch() {
            this._updateTime = _.now();

            if (!this._createTime) {
                this._createTime = _.now();
            }
        }
    }

    /**
     * A storable entity
     *
     * @constructor
     * @class mixins.Storable
     * @uses mixins.Timestamped
     */
    class Storable extends Timestamped {
        constructor() {
            super();

            /**
             * @property id
             * @type {integer}
             */
            this.id = null;

            /**
             * @property id
             * @type {integer}
             * @default true
             */
            this.isActive = true;
        }
    }


    /**
     * Someone with a name
     *
     * @constructor
     * @class mixins.Person
     */
    class Person extends Storable {
        constructor() {

            super();

            /**
             * @property fname
             * @type {String}
             */
            this.fname = null;

            /**
             * @property lname
             * @type {String}
             */
            this.lname = null;
        }
    }


    /**
     * Someone with an email address and / or phone
     *
     * @constructor
     * @class mixins.Contact
     * @uses mixins.Person
     */
    class Contact extends Person {
        constructor() {
            super();

            /**
             * @property email
             * @type {String}
             */
            this.email = null;

            /**
             * @property phone
             * @type {String}
             */
            this.phone = null;

        }
    }

    class Loginable extends Contact {
        constructor() {
            super();

            /**
             * @property password
             * @type {string}
             */
            this._password = null;
        }

        setPassword (password) {
            let that = this;

            return bcrypt.hash(password)
                .then(function (hash) {
                    that._password = hash;
                    return hash;
                });
        }

        checkPassword (password) {
            return bcrypt.compare(password, this._password);
        }
    }

    return {
        Timestamped,
        Storable,
        Person,
        Contact,
        Loginable
    };
};
