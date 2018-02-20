'use strict';

const minify = require('html-minifier').minify;

module.exports = function(req, res, next) {
    res.oldRender = res.render;

    res.render = function(view, options) {
        this.oldRender(view, options, function(err, html) {
            if (err) {
                return next(err);
            }

            html = minify(html, {
                removeComments           : true,
                collapseWhitespace       : true,
                collapseBooleanAttributes: true,
                removeAttributeQuotes    : true,
                removeEmptyAttributes    : true
            });

            res.send(html);
        });
    };

    next();
};
