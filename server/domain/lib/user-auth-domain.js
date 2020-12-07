'use strict';

const { Strategy } = require('passport-strategy'); // http://www.passportjs.org/docs/
const UserUtil = require('./user-util');

/**
 * Register a new domain driver
 * @param server
 * @returns {{id: string, name: string, group: string, image: string, strategy: (function(*): *), loginComponent: string}}
 */
module.exports = function (server) {
    const userUtil = new UserUtil(server);
    return {
        id: 'acme',
        name: 'Acme',
        group: 'local',
        image: '/assets/acme/images/logo.svg',
        strategy: function (domain) {
            const auth = new Strategy();
            auth.authenticate =  async function(req) {
                //this looks for a token in the request url (/api/login/{domain.id}?token={token})
                const token = new URL(req.url.href, 'file:').searchParams.get('token');
                if (token) {
                    const credential = await userUtil.validateToken(token);
                    this.success(credential);
                    return;
                }
                // check if there is a username and password
                // these are what we named the fields in the body in our
                // login form. (see 'acmeLogin' component in 'public/js/config.js')
                const { username, password } = req.body;
                if (username && password) {
                    const credential = await userUtil.authenticateUser(req.body.username, req.body.password);
                    this.success(credential);
                    return;
                }
                this.fail();
            };
            auth.name = domain.id;
            return auth;
        },
        loginComponent: 'acmeLogin',
        editComponent: 'acmeDomainEdit',
        // validates creation of the domain and potentially mutate it before saving.
        validate: async domain => {
            // encrypt our "password" here
            // it can be decrypted using server.app.decrypt
            domain.config.password = server.app.encrypt(domain.config.password);
            //ensure we are setup for our domain
            await UserUtil.initUserDb(server);
        }
    };
};