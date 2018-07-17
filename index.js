'use strict';

const path = require('path');

exports.register = function(server, opts, next) {
  let bundle = server.bundle('acme').scan(__dirname, 'public');

  server.injector().inject(bundle, 1000);

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

  server.route({
    path: '/images/informer.svg',
    method: 'get',
    config: {
      auth: false,
      handler: {
        file: path.resolve(__dirname, 'assets/mysql.svg')
      }
    }
  });
  next();
};

exports.register.attributes = { name: 'informer-acme' };
