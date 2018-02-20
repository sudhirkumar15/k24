'use strict';

let _       = require('lodash'),
    url     = require('url'),
    _req, _res;

function renderCSSTags (csstags) {
    let out = '';

    if (typeof csstags === 'string') {
        out = out + renderTag({
            'name': 'link',
            'opts': objToKeyval({
                'rel': 'stylesheet',
                'href': csstags
            }),
            'selfclose': true
        });
    } else {
        _.each(csstags, function (css) {
            if (typeof css === 'string') {
                out = out + renderTag({
                    'name': 'link',
                    'opts': objToKeyval({
                        'rel': 'stylesheet',
                        'href': css
                    }),
                    'selfclose': true
                });
            } else {
                out = out + renderTag({
                    'name': 'link',
                    'opts': objToKeyval(css),
                    'selfclose': true
                });
            }
        });
    }

    return out;
}

function renderJSTags(jstags) {
    let out = '';

    if (typeof jstags === 'string') {
        out = out + renderTag({
            'name': 'script',
            'opts': objToKeyval({
                'src': jstags,
                'nonce': `${_res.locals.nonce}`
            })
        });
    } else {
        _.each(jstags, function (js) {
            if (typeof js === 'string') {
                out = out + renderTag({
                    'name': 'script',
                    'opts': objToKeyval({
                        'src': js,
                        'nonce': `${_res.locals.nonce}`
                    })
                });
            } else {
                out = out + renderTag({
                    'name': 'script',
                    'opts': objToKeyval(js)
                });
            }
        });
    }

    return out;
}

function renderFlashMsg() {
    let flash = _req.flash(),
        out   = '',
        types = ['success', 'error', 'info'];

    _.each(types, function (type) {
        if (flash[type]) {
            out += '<div class="flash-msgs '+ type +'">';
            out += '<h2><span>' + type + '</span></h2>';
            out += '<ul>';

            _.each(flash[type], function (msg) {
                out += '<li>'+msg+'</li>';
            }) ;

            out += '</ul>';
            out += '<button type="button" class="close" data-dismiss="alert">&times;</button>';
            out += '</div>';
        }
    });

    return out;
}

function objToKeyval(obj) {
    return _.map(obj, function (val, key) {
        return {'key': key, 'val': val};
    });
}

function renderTag(obj) {
    let tag = '<' + obj.name + ' ';

    _.each(obj.opts, function (opt) {
        if ((obj.name === 'link' || obj.name === 'script') &&
            (opt.key === 'href' || opt.key === 'src') &&
            !url.parse(opt.val, false, true).host) {
            opt.val = opt.val;
        }

        tag += opt.key + '="' + opt.val + '" ';
    });

    if (obj.selfclose) {
        tag += '/>';
        return tag;
    }

    tag += '></' + obj.name + '>';

    return tag;
}

function selectOption(option, value) {
    return option === value ? `value ="${value}" selected="selected"` : `value ="${value}"`;
}

module.exports = {
    'setContext': function (req, res, next) {
        _req = req;
        _res = res;
        next();
    },
    'helpers': {
        'renderCSSTags'  : renderCSSTags,
        'renderJSTags'   : renderJSTags,
        'renderFlashMsg' : renderFlashMsg,
        'selectOption'   : selectOption
    }
};
