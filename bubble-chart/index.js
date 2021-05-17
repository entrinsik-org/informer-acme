'use strict'

module.exports = function (server) {
    let bundle = server.bundle('bubble-chart').scan(__dirname, 'public');
    server.injector().inject(bundle);
    server.deployer('viz').route(require('./server/routes'));
};


