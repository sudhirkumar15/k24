module.exports = (app, cfg) => {
	app.use('/authenticate', require('./http/auth'));
	app.use('/users', require('./http/users'));
	app.use('/publisher', require('./http/publisher'));
	app.use('/sites', require('./http/sites'));
	app.use('/status', require('./http/status'));
};
