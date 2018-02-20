'use strict';

let chai   = require('chai'),
    cuid   = require('cuid'),
    expect = chai.expect,
    assert = chai.assert,
    _      = require('lodash'),
    cfg    = require('../../../cfg'),
    core   = require('../../../core')(cfg),
    Tenant = core.tenant.Tenant,
    Repo   = core.tenant.Repo,
    tenant;

describe('tenant', () => {
    describe('Tenant', () => {
        it('should create a new tenant', () => {
            tenant = new Tenant();

            let properties = [
                'id',
                'name',
                'email',
                'legacyId',
                'isActive',
                'role'
            ];

            _.each(properties, function (property) {
                expect(tenant).to.have.property(property);

                if (property !== 'isActive' && property !== 'role') {
                    expect(tenant[property]).to.be.null;
                }
            });

            expect(tenant.isActive).to.be.equal(true);
            expect(tenant.role).to.be.equal('tenant');

            // set properties
            tenant.id       = cuid();
            tenant.tenantId = cuid();
            tenant.name     = 'Darth Vader';
            tenant.email    = 'killallrebels@darkside.com';
            tenant.legacyId = _.random(100);

            tenant.touch();
        });
    });

    describe('Repo', () => {
    });
});
