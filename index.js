'use strict';

const path = require('path');

/**
 * All plugins start here, with the register function and setting the name attribute below (required)
 * @param server
 * @param opts
 * @param next
 */
exports.register = function (server, opts, next) {

    // drivers, hooks and handlers
    require('./server')(server);

    // inject custom client code into framework
    // referenced as '/assets/acme/*'
    let bundle = server.bundle('acme').scan(__dirname, 'public');
    server.injector().inject(bundle);

    // create route to access custom images
    server.select('content').route({
        method: 'GET',
        path: '/assets/acme/images/{path*}',
        config: {
            auth: false,
            handler: {
                directory: {
                    path: path.resolve(__dirname, './public/images'),
                    listing: false,
                    index: false
                }
            }
        }
    });

    // replace login form with ours (may change in future localization release)
    server.route({
        path: '/login.html',
        method: 'get',
        config: {
            auth: false,
            handler: {
                file: path.resolve(__dirname, 'assets/login.html')
            }
        }
    });

    // replace informer logo with our acme svg
    server.route({
        path: '/images/informer.svg',
        method: 'get',
        config: {
            auth: false,
            handler: {
                file: path.resolve(__dirname, 'assets/acme.svg')
            }
        }
    });


    next();
};

exports.register.attributes = { name: 'informer-acme' };
