'use strict';

const UserUtil = require('./user-util');

/**
 * Add a system wide feature to enable a new acme domain
 * @param server
 * @returns {{id: string, name: string, description: string, install: install, uninstall: uninstall}}
 */
module.exports = function(server) {
    const { Domain } = server.app.db.models;
    return {
        id: 'acme-auth',
        name: 'Acme Authentication',
        description: 'Installs Acme user database and authentication domain',
        install: async function () {
            // initialize db if it doesnt exist
            UserUtil.initUserDb(server);
            // register the domain so that it can be used for login
            await Domain.create({ id: 'acme', type: 'acme', name: 'Acme', description: 'Local Acme Users' });
        },
        uninstall: async function () {
            // delete the acme domain
            await Domain.destroy({ where: { id: 'acme' } });
        }
    };
};