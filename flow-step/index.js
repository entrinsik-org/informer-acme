'use strict';

module.exports = server => {
    let bundle = server.bundle('acme-flow-example').scan(__dirname, 'public');
    server.injector().inject(bundle);
    require('./server')(server);
};