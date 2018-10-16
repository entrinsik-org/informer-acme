'use strict';

const _ = require('lodash');

module.exports = function (server) {
    const { User } = server.app.db.models;

    function replace(value, creds) {
        if (_.isArray(value)) return value.map(v => replace(v, creds));

        if (_.isPlainObject(value)) return _.mapValues(value, v => replace(v, creds));

        if (_.isString(value)) return template(value, creds);

        return value;
    }

    /**
     * Extract the 'user.property' expression, if it exists in the value
     * @param string
     * @returns {null}
     */
    const template = (str, user) => {
        return _.template(str)(user);
    };

    /**
     * Returns an ES filter event handler
     */
    return async function ({ body }) {
        const req = server.activeRequest();

        if (!req || !body) return;

        const user = await User.findById(req.auth.credentials.username);

        body.query = replace(body.query, user);
    };
};