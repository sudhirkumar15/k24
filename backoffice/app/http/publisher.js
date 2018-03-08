'use strict';

const 
express  = require('express'), router = express.Router(),
jwt      = require('jsonwebtoken'),
authJWT  = require('../middleware/authmiddleware')(jwt);

router.get('/:pub_id?', authJWT, (req, res, next) => {
	req.app.get('core').publisher.getPublisherList(req.params.pub_id)
		.then(pub => {
			res.api.data = pub;
			res.send(res.api);
		});
});

router.get('/delete/:pub_id', authJWT, (req, res, next) => {
	req.app.get('core').publisher.deletePublisher(req.params.pub_id)
		.then(data => {
			res.api.data = data;
			res.send(res.api);
		});
});

router.post('/add', authJWT ,(req, res) => {
	req.checkBody("organization_name", "Enter a valid organization_name").notEmpty();

	const errors = req.validationErrors();

	if (errors) {
		res.send(errors);
		return;
	}

	req.app.get('core').publisher.addPublisher(req)
		.then(data => {
			res.api.data = data;
			res.send(res.api);
		});

});

module.exports = router;
