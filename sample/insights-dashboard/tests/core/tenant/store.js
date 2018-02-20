'use strict';

let chai   = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    _      = require('lodash'),
    cfg    = require('../../../cfg'),
    core   = require('../../../core')(cfg),
    Store  = core.tenant.store.Store,
    store;

describe('store', () => {
    describe('store', () => {
        it('should create a new store', () => {
            store = new Store();

            let properties = [
                'id',
                'name',
                'url',
            ];

            _.each(properties, function (property) {
                expect(store).to.have.property(property);
                expect(store[property]).to.be.null;
            });

            // set properties
            store.id   = _.random(_.now());
            store.name = 'Store 1';
            store.url  = `store1${_.now()}.com`;

            store.touch();

            _.each(_.keys(store), (key) => {
                assert.ok(store[key]);
            });
        });
    });
});
