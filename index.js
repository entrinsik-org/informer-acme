'use strict';
const path = require('path');

// All plugins start here, with the register function and setting the name attribute below (required)
exports.register = function (server, opts, next) {
    // each require loads a feature
    require('./bubble-chart')(server);
    require('./domain')(server);
    require('./flow-step')(server);
    require('./function-lib')(server);
    require('./lookandfeel')(server);
    require('./query-filter')(server);
    //serve all the images under one path
    server.select('content').route({
        method: 'GET', path: '/assets/acme/images/{path*}', config: {
            auth: false,
            handler: {
                directory: {
                    path: path.resolve(__dirname, './images'),
                    listing: false,
                    index: false
                }
            }
        }
    });

    next();
};

exports.register.attributes = { name: 'informer-acme' };
