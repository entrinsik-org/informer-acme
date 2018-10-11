'use strict';

const _ = require('lodash');
const LocalStrategy = require('passport-local').Strategy;
const { Client } = require('pg');
const P = require('bluebird');

module.exports = function (server) {
    const acmeUsersConn = _.assign({}, server.app.config.db, { database: 'acme_users', idleTimeoutMillis: 1000 });

    return {
        id: 'acme',
        name: 'Acme',
        group: 'local',
        coerce: u => u,
        image: '/assets/domains/images/active-directory.svg',
        register: function (domain) {
            const auth = new LocalStrategy(async function (username, password, done) {
                const getClient = function() {
                    const client = new Client(acmeUsersConn);
                    return P.resolve(client)
                        .tap(client => client.connect())
                        .disposer(client => client.end());
                };

                return P.using(getClient(), function(client) {
                    return P.resolve(client.query('SELECT * FROM users where username = $1 and password = $2', [ username, password ]))
                        .then(users => {
                            if (users.rows.length === 0) return false;
                            const [ user ] = users.rows;
                            user.displayName = user.name;
                            return user;
                        })
                        .nodeify(done);
                });
            });
            auth.name = domain.id;
            server.plugins.travelite.passport.use(auth);
        },

        unregister: function (domain) {
            server.plugins.travelite.passport.unuse(domain.id);
        },
        loginComponent: 'acmeLogin'
    }
};