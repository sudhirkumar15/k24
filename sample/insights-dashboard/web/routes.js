'use strict';

module.exports = (app) => {
    app.use('/',                require('./handlers/landing'));
    app.use('/dashboard',       require('./handlers/dashboard'));
    app.use('/events',          require('./handlers/events'));
    app.use('/sessions',        require('./handlers/sessions'));
    app.use('/retention',       require('./handlers/retention'));
    app.use('/funnel',          require('./handlers/funnel'));
    app.use('/theme',           require('./handlers/theme'));
    app.use('/books',           require('./handlers/books'));
    app.use('/institutions',    require('./handlers/institutions'));
    app.use('/users',           require('./handlers/users'));
};
