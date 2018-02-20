'use strict';

let chai    = require('chai'),
    expect  = chai.expect,
    assert  = chai.assert,
    cfg     = require('../../cfg'),
    bcrypt  = require('../../core/bcrypt')(cfg),
    payload = 'password',
    hashed  = null;

describe('bcrypt', () => {
    describe('#hash', () => {
        it('should hash a string', () => {
            return bcrypt.hash(payload)
                .then((hash) => {
                    expect(hash).to.be.a('string');
                    assert.notEqual(payload, hash);
                    hashed = hash;
                });
        });
    });

    describe('#compare', () => {
        it('should return true for correct comparison', () => {
            return bcrypt.compare(payload, hashed)
                .then(assert.ok);
        });

        it('should return false for incorrect comparison', () => {
            return bcrypt.compare(payload + '1', hashed)
                .then( (res) => {
                    assert.ok(!res);
                });
        });
    });
});
