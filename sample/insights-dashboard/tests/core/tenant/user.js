'use strict';

let chai   = require('chai'),
    cuid   = require('cuid'),
    expect = chai.expect,
    assert = chai.assert,
    _      = require('lodash'),
    cfg    = require('../../../cfg'),
    core   = require('../../../core')(cfg),
    User   = core.tenant.user.User,
    Repo   = core.tenant.user.Repo,
    user;

describe('user', () => {
    describe('User', () => {
        it('should create a new user', () => {
            user = new User();

            let properties = [
                'id',
                'tenantId',
                'fname',
                'lname',
                'email',
                'phone',
                '_password',
                'apiKey',
                'storeIds',
                'isActive',
                'role'
            ];

            _.each(properties, (property) => {
                expect(user).to.have.property(property);

                if (property !== 'isActive' && property !== 'role' && property !== 'storeIds') {
                    expect(user[property]).to.be.null;
                }
            });

            expect(user.isActive).to.be.equal(true);
            expect(user.role).to.be.equal('user');

            // set properties
            user.id       = cuid();
            user.tenantId = cuid();
            user.fname    = 'Darth';
            user.lname    = 'Vader';
            user.email    = 'killallrebels@darkside.com';
            user.apiKey   = cuid();
            user.storeIds = [cuid(), cuid()];

            user.touch();

            return user.setPassword('killallrebels');
        });
    });

    describe('Repo', () => {
        describe('#save', () => {
            it('should save a user', () => {
                return Repo.save(user)
                    .then(assert.ok);
            });
        });

        describe('#getByEmail', () => {
            it('should get an user by email', () => {
                return Repo.getByEmail(user.email)
                    .then((fetched) => {
                        assert.deepEqual(fetched, user);
                    });
            });
        });

        describe('#getByAPIKey', () => {
            it('should get an user by email', () => {
                return Repo.getByAPIKey(user.apiKey)
                    .then((fetched) => {
                        assert.deepEqual(fetched, user);
                    });
            });
        });

        describe('#getById', () => {
            it('should get an user by id', () => {
                return Repo.getById(user.id)
                    .then((fetched) => {
                        assert.deepEqual(fetched, user);
                    });
            });
        });
    });
});
