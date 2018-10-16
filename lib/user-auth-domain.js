'use strict';

const _ = require('lodash');
const LocalStrategy = require('passport-local').Strategy;
const { Client } = require('pg');
const P = require('bluebird');

module.exports = function (server) {
    const acmeUsersConn = _.assign({}, server.app.config.db, { database: 'acme_users', idleTimeoutMillis: 1000 });

    /**
     * Returns a pg client connected to the acme users db set up by our system feature
     * @return {*}
     */
    function getClient() {
        return P.resolve(new Client(acmeUsersConn))
            .tap(client => client.connect())
            .disposer(client => client.end());
    }

    /**
     * Finds a user in the acme_users table using an extremely insecure algorithm :)
     * @param username
     * @param password
     * @return {*}
     */
    function findUser(username, password) {
        return P.using(getClient(), client => client.query('SELECT * FROM users where username = $1 and password = $2', [ username, password ]))
            .then(users => {
                if (users.rows.length === 0) return false;
                const [ user ] = users.rows;
                user.displayName = user.name;
                user.data = { department: user.department };
                return user;
            });
    }

    return {
        id: 'acme',
        name: 'Acme',
        group: 'local',
        coerce: u => u,
        image: '/assets/domains/images/active-directory.svg',
        register: function (domain) {
            // creates a new passport strategy
            const auth = new LocalStrategy(function (username, password, done) {
                return findUser(username, password).nodeify(done);
            });
            auth.name = domain.id;

            // registers the strategy with the auth manager
            server.plugins.travelite.passport.use(auth);
        },
        unregister: function (domain) {
            server.plugins.travelite.passport.unuse(domain.id);
        },
        loginComponent: 'acmeLogin'
    }
};