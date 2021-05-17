'use strict';
const path = require('path');
module.exports = server => {
    // inject custom client code into framework
    // referenced as '/assets/acme/*'
    let bundle = server.bundle('acme').scan(__dirname, 'public');
    server.injector().inject(bundle);

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
                file: path.resolve(__dirname, '../images/acme.svg')
            }
        }
    });

};