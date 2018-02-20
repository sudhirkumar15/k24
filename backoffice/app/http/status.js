'use strict';

const 
express  = require('express'), router = express.Router(),
jwt      = require('jsonwebtoken'),
authJWT  = require('../middleware/authmiddleware')(jwt);

router.get('/:id?', authJWT, (req, res, next) => {
	req.app.get('core').status.getStatusList(req.params.id)
		.then(pub => {
			res.api.data = pub;
			res.send(res.api);
		});
});

router.get('/delete/:id', authJWT, (req, res, next) => {
	req.app.get('core').status.deleteStatus(req.params.id)
		.then(data => {
			res.api.data = data;
			res.send(res.api);
		});
});

router.post('/add', authJWT ,(req, res) => {
	req.checkBody("status_description", "Enter status description").notEmpty();

	const errors = req.validationErrors();

	if (errors) {
		res.send(errors);
		return;
	}

	req.app.get('core').status.addStatus(req)
		.then(data => {
			res.api.data = data;
			res.send(res.api);
		});

});

module.exports = router;
