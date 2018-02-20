'use strict';

let express       = require('express'),
    passport      = require('passport'),
    _             = require('lodash'),
    LocalStrategy = require('passport-local').Strategy,
    co            = require('co'),
    router        = express.Router();

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            req.flash('error', info.message);
            return res.redirect('/#login');
        }

        req.logIn(user, (error) => {
            if (error) {
                return next(error);
            }

            req.app.get('log').info('login', {
                'message': `${user.email} logged in`
            });

            req.flash('success', info.message);
            res.cookie('theme', user.dashboard.theme);

            if (req.query.r) {
                return res.redirect(req.query.r);
            }

            return res.redirect('/dashboard');
        });
    })(req, res, next);
});

router.post('/logout', (req, res, next) => {
    if (req.user) {
        let user = req.user;
        res.clearCookie('theme');
        req.session.destroy();

        req.app.get('log').info('logout', {
            'message': `${user.email} logged out`
        });

        user = null;

        return res.redirect('/');
    }

    let err = new Error('Already logged out');
    err.status = 400;
    return next(err);
});

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
},
function(req, email, password, done) {
    co(function* () {
        let result = {
            'user'   : null,
            'message': ''
        },
        user;

        function doreturn(err) {
            result.message = err;
            return result;
        }

        user = yield req.app.get('core').tenant.user.Repo.getByEmail(_.trim(email));

        if (!user) {
            req.app.get('log').warn('Login failed', {
                'email' : email,
                'reason': 'No user found'
            });

            return doreturn('Invalid email or password');
        }

        if (!(yield user.checkPassword(password))) {
            return doreturn('Invalid email or password');
        }

        try {
            user.tenant = yield req.app.get('core').tenant.Repo.getById(user.tenantId);
        } catch (e) {
            return done(e);
        }

        user.stores = _.compact(_.map(user.tenant.stores, (store) => {
            if (_.indexOf(user.storeIds, store.id) !== -1) {
                return store;
            }
        }));

        result.user = user;

        return result;
    })
    .then((result) => {
        done(null, result.user, result);
    })
    .catch((err) => {
        done(err);
    });
}));

module.exports = router;
