'use strict';

const 
express  = require('express'), router = express.Router(),
jwt      = require('jsonwebtoken'),
authJWT  = require('../middleware/authmiddleware')(jwt);

router.get('/:userid?', authJWT, (req, res, next) => {
	req.app.get('core').users.getUserList(req.params.userid)
		.then(users => {
			res.api.data.users = users;
			res.send(res.api);
		});
});

router.get('/delete/:userid', authJWT, (req, res, next) => {
	req.app.get('core').users.deleteUser(req.params.userid)
		.then(data => {
			console.log(data);
			res.api.data = data;
			res.send(res.api);
		});
});

router.post('/edit', authJWT ,(req, res) => {
	req.checkBody("email_id", "Enter a valid email address.").notEmpty().isEmail();

	const errors = req.validationErrors();

	if (errors) {
		res.send(errors);
		return;
	}

	if (req.body.password.length < 6) {
		res.send([
			{
				"param": "password",
				"msg": "Enter a valid password.",
				"value": "sudhir.kumar"
			}
		]);

		return;
	}

	req.app.get('core').users.editUser(req)
		.then(data => {
			res.api.data = data;
			res.send(res.api);
		});

});

module.exports = router;
