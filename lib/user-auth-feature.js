'use strict';

const _ = require('lodash');

const { Client } = require('pg');

module.exports = function(server) {
    const acmeUsersConn = _.assign({}, server.app.config.db, { database: 'acme_users', idleTimeoutMillis: 7 });
    const dbConn = _.assign({}, server.app.config.db, { idleTimeoutMillis: 7 });
    const { Domain } = server.app.db.models;

    /**
     * Lazily creates a database to store our sample users
     * @return {Promise<boolean>}
     */
    async function createUserDb() {
        const client = new Client(dbConn);
        await client.connect();

        try {
            await client.query('CREATE DATABASE acme_users');
            return true;
        } catch (err) {
            if (err.code === '42P04') return false;
            throw err;
        }
        finally {
            client.end();
        }
    }

    /**
     * Lazily initializes a user database with sample users
     * @return {Promise<void>}
     */
    async function initAcmeUserDb() {
        const client = new Client(acmeUsersConn);
        await client.connect();

        await client.query('CREATE TABLE users ( username text primary key, name text, email text, password text, department text )');
        await client.query(`INSERT INTO users ( username, name, email, password, department ) values ( 'john', 'John Smith', 'john@acme.com', '123', 'IT' ), ( 'jane', 'Jane Doe', 'jane@acme.com', '123', 'Sales')`);
    }

    return {
        id: 'acme-auth',
        name: 'Acme Authentication',
        description: 'Installs Acme user database and authentication domain',
        install: async function () {
            // initialize db if it doesnt exist
            if (await createUserDb()) await initAcmeUserDb();

            // register the domain so that it can be used for login
            await Domain.create({ id: 'acme', type: 'acme', name: 'Acme', description: 'Local Acme Users' });
        },
        uninstall: async function () {
            // delete the acme domain
            await Domain.destroy({ where: { id: 'acme' } });
        }
    };
};