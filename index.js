'use strict';

if (require('node-version').major >= 4) {
    module.exports = require('./lib');
} else {
    global.Promise = require('promise-polyfill');
    module.exports = require('./lib-es5');
}
