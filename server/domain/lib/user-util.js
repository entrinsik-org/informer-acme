'use strict';

const _ = require('lodash');
const { Client } = require('pg');
const P = require('bluebird');

/**
 * Utility module to handle all the querying of the remote user source
 *
 * @param server
 * @returns {{findUser: (function(*, *): *), getUserOrgs: (function(*): *)}}
 */
class UserUtil {
    constructor(server) {
        this.server = server;
    }

    /**
     * Returns a pg client connected to the local db
     * @param conn optional, will be connection to acme users db if not passed in
     * @returns {*}
     */
    getClient(conn) {
        conn = conn ||  _.assign({}, this.server.app.config.db, { database: 'acme_users', idleTimeoutMillis: 1000 });
        /*
            returns a bluebird Promise http://bluebirdjs.com/docs/getting-started.html
            adds a disposer function, which will be called when this client is used in a P.using
            guaranteed to be called as the last promise. Used to clean up open connections
        */
        return P.resolve(new Client(conn))
            .tap(client => client.connect())
            .disposer(client => client.end());
    }
    /**
     * Finds a user in the acme_users table using an extremely insecure algorithm :)
     * @param username
     * @param password
     * @return {*}
     */
    async authenticateUser(username, password) {
        const user = await this.findUser(username);
        return user && user.password === password ? user : false;
    }

    validateToken(token) {
        // for this example, token is username
        return this.findUser(token);
    }

    findUser(username) {
        return P.using(this.getClient(), async client => {
            const result = await client.query('SELECT * FROM users where lower(username) = $1', [username.toLowerCase()]);
            if (result.rows.length === 0) return null;
            const [user] = result.rows;
            user.displayName = user.name;
            user.data = { department: user.department };
            user.username = user.username.toLowerCase();
            return user;
        });
    }
    /**
     * Finds the org memberships for the user
     * @param username
     * @returns {*}
     */
    getUserOrgs(username) {
        return P.using(this.getClient(), async client => {
            const { rows } = await client.query('SELECT orgname, level FROM user_orgs WHERE username = $1', [username]);
            return rows;
        });
    }

    /**
     * Initializes our fake user database
     * @param server
     * @returns {Promise<void>}
     */
    static async initUserDb(server) {
        const dbConn = _.assign({}, server.app.config.db, { idleTimeoutMillis: 7 });
        const userUtil = new UserUtil(server);
        const created = await P.using(userUtil.getClient(dbConn), async client => {
            try {
                await client.query('CREATE DATABASE acme_users');
                return true;
            } catch (err) {
                if (err.code === '42P04') return false;
                throw err;
            }
        });
        if(created) {
            await P.using(userUtil.getClient(), async client => {
                await client.query(`CREATE TABLE users ( username text primary key,
                                                     name text, 
                                                    email text, 
                                                 password text, 
                                                 division text )`);

                await client.query(`INSERT INTO users ( username, name, email, password, division ) 
                                 VALUES ( 'john', 'John Smith', 'john@acme.com', '123', 'North America' ), 
                                        ( 'jane', 'Jane Doe', 'jane@acme.com', '123', 'Scandanavia')`);

                await client.query(`CREATE TABLE user_orgs ( username text,
                                                      orgname text, 
                                                        level int )`);

                await client.query(`INSERT INTO user_orgs  (username, orgname, level) 
                                 VALUES ('john', 'IT', 3),
                                        ('john', 'Company', 1),
                                        ('jane', 'Sales', 3),
                                        ('jane', 'Company', 1)`);
            });
        }
    }
}
module.exports = UserUtil;