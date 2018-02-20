'use strict';

let chai        = require('chai'),
    _           = require('lodash'),
    assert      = chai.assert,
    expect      = chai.expect,
    cfg         = require('../../cfg'),
    core        = require('../../core')(cfg),
    Timestamped = core.mixins.Timestamped,
    Storable    = core.mixins.Storable,
    Person      = core.mixins.Person,
    Loginable   = core.mixins.Loginable,
    Contact     = core.mixins.Contact;

describe('Mixins', () => {
    describe('Timestamped', () => {
        describe('#touch', () => {
            it('should set create and update time for a new object', () => {
                let ts = new Timestamped(),
                    before = new Date();

                ts.touch();

                assert.ok(ts.createTime >= before && ts.createTime <= new Date());
                assert.ok(ts.updateTime >= before && ts.updateTime <= new Date());
            });

            it('should update the update time for an existing object', (done) => {
                let ts = new Timestamped();

                ts.touch();

                let oldCreateTime = ts.createTime,
                    before = new Date();

                setTimeout(() => {
                    ts.touch();

                    assert.ok(ts.updateTime > before && ts.updateTime <= new Date());
                    assert.deepEqual(ts.createTime, oldCreateTime);
                    done();
                }, 2);
            });
        });
    });

    describe('Storable', () => {
        describe('#touch', () => {
            it('should set create and update time for a new object', () => {
                let storable = new Storable(),
                    before = new Date();

                storable.touch();

                assert.ok(storable.createTime >= before && storable.createTime <= new Date());
                assert.ok(storable.updateTime >= before && storable.updateTime <= new Date());
            });

            it('should update the update time for an existing object', (done) => {
                let storable = new Storable();

                storable.touch();

                let oldCreateTime = storable.createTime,
                    before = new Date();

                setTimeout(() => {
                    storable.touch();
                    assert.ok(storable.updateTime > before && storable.updateTime <= new Date());
                    assert.deepEqual(storable.createTime, oldCreateTime);
                    done();
                }, 5);
            });
        });
    });

    describe('Person', () => {
        it('should create a new person', () => {
            let person = new Person();

            expect(person).to.have.property('fname');
            expect(person).to.have.property('lname');

            expect(person.fname).to.be.null;
            expect(person.lname).to.be.null;

            person.fname = 'john';
            person.lname = 'doe';

            expect(person.fname).to.equal('john');
            expect(person.lname).to.be.equal('doe');
        });
    });

    describe('Contact', () => {
        it('should create a new contact', () => {
            let contact = new Contact();

            expect(contact).to.have.property('fname');
            expect(contact).to.have.property('lname');
            expect(contact).to.have.property('email');
            expect(contact).to.have.property('phone');

            expect(contact.fname).to.be.null;
            expect(contact.lname).to.be.null;
            expect(contact.email).to.be.null;
            expect(contact.phone).to.be.null;

            contact.fname = 'john';
            contact.lname = 'doe';
            contact.email = 'johndoe@gmail.com';
            contact.phone = '123456789';

            expect(contact.fname).to.equal('john');
            expect(contact.lname).to.be.equal('doe');
            expect(contact.email).to.be.equal('johndoe@gmail.com');
            expect(contact.phone).to.be.equal('123456789');
        });
    });

    describe('Loginable', () => {
        it('should create a new loginable entity', () => {
            let loginable = new Loginable(),
                properties = ['id', 'fname', 'lname', 'email', 'phone', '_password'],
                password   = 'letmein';

            _.each(properties, (property) => {
                expect(loginable).to.have.property(property);
                expect(loginable[property]).to.be.null;
            });

            // set properties
            loginable.id = _.random(1000);
            loginable.fname = 'Darth';
            loginable.lname = 'Vader';
            loginable.email = 'killallrebels@darkside.com';
            loginable.phone = '1212121221';

            loginable.touch();

            return loginable.setPassword(password)
                .then(assert.ok);
        });
    });
});

