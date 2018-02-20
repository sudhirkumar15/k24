'use strict';

const express  = require('express'), router = express.Router();

router.post('/', (req, res) => {
	req.checkBody("email_id", "Enter a valid email address.").notEmpty().isEmail();
	req.checkBody("password", "Enter a valid password.").notEmpty().len(6, 20);

	const errors = req.validationErrors();

	if (errors) {
		res.api.errors = errors[0].msg;
		res.api.status = 403;
		res.json(res.api);
		return;
	} 

	req.app.get('core').auth.getAuth(req.body.email_id, req.body.password)
		.then(authData => {
			req.app.get('core').auth.updateLastLogin(authData)
			.then(authData => {
				res.api.data = authData;
				res.api.status = 200;
				res.json(res.api);
				return;
			})
		})
		.catch(err => {
			res.api.errors = err;
			res.api.status = 403;
			res.json(res.api);
		});
});

router.post('/signup', (req, res) => {
	req.checkBody("email_id", "Enter a valid email address.").notEmpty().isEmail();
	req.checkBody("password", "Enter a valid password.").notEmpty().len(6, 20);

	const errors = req.validationErrors();

	if (errors) {
		res.api.errors = errors;
		res.api.status = 400;
		res.json(res.api);
		return;
	}

	req.app.get('core').auth.getUserByEmailId(req.body.email_id)
		.then(user => {
			if (user.t > 0) {
				res.api.errors = {'msg' : 'User already existing'};
				res.api.status = 400;
				res.json(res.api);
				return;
			}

			req.app.get('core').auth.signUp(req)
	    	.then(signUpData => {
	    		res.api.data = signUpData;
				res.api.status = 200;
				res.json(res.api);
	    	}).catch(err => {
	    		res.api.errors = err;
				res.api.status = 500;
				res.json(res.api);
	    	})
		});

});

router.post('/password', (req, res) => {
	req.checkBody("email_id", "Email id is empty").notEmpty().isEmail();

	const errors = req.validationErrors();

	if (errors) {
		res.api.errors = errors;
		res.api.status = 400;
		res.json(res.api);
		return;
	}
	req.app.get('core').auth.getUserByEmailId(req.body.email_id)
		.then(user => {
			if (!user.t) {
				res.api.errors = {'msg' : 'User not found'};
				res.api.status = 400;
				res.json(res.api);
				return;
			}

			req.app.get('core').auth.changePasswordConfirmation(req.body.email_id)
	    	.then(pass => {
	    		res.api.data = pass;
				res.api.status = 200;
				res.json(res.api);
	    	})
		});

});

module.exports = router;
