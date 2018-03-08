'use strict';

const 
express  = require('express'), router = express.Router(),
jwt      = require('jsonwebtoken'),
authJWT  = require('../middleware/authmiddleware')(jwt);

router.get('/:site_id?', authJWT, (req, res, next) => {
	req.app.get('core').sites.getSitesList(req.params.site_id)
		.then(pub => {
			res.api.data = pub;
			res.send(res.api);
		});
});

router.get('/delete/:site_id', authJWT, (req, res, next) => {
	req.app.get('core').sites.deleteSites(req.params.site_id)
		.then(data => {
			res.api.data = data;
			res.send(res.api);
		});
});

router.post('/add', authJWT ,(req, res) => {
	req.checkBody("name", "Enter a valid site name").notEmpty();

	const errors = req.validationErrors();

	if (errors) {
		res.send(errors);
		return;
	}

	req.app.get('core').sites.addSites(req)
		.then(data => {
			res.api.data = data;
			res.send(res.api);
		});

});

module.exports = router;
