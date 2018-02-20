'use strict';

const bcrypt = require('bcrypt'),
    Promise  = require('bluebird');

module.exports = (cfg) => {
    class Bcrypt {
        hash(payload) {
            return new Promise((resolve, reject) => {
                bcrypt.hash(payload, cfg.web.bcrypt.rounds, (err, hash) => {
                    if (err) {
                        reject(err);
                    }

                    resolve(hash);
                });
            });
        }

        compare(unencrypted, hash) {
            return new Promise((resolve, reject) => {
                bcrypt.compare(unencrypted, hash, (err, result) => {
                    if (err) {
                        reject(err);
                    }

                    resolve(result);
                });
            });
        }
    }

    return new Bcrypt();
};
