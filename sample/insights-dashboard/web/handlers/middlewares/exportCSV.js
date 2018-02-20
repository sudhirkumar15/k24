'use strict';

const express = require('express'),
    router    = express.Router(),
    _         = require('lodash'),
    json2csv  = require('json2csv');

router.use((req, res, next) => {
    const data = JSON.parse(req.body.export);

    const first = _.head(data.report);

    const fields = _.keys(first);

    const options = {
        data       : data.report,
        fields     : fields,
        fieldNames : _.map(fields, _.startCase)
    };

    json2csv(options, (err, csv) => {
        if (err) {
            return next(err);
        }

        res.attachment('Report.csv');
        res.send(csv);
    });
});

module.exports = router;