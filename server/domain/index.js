'use strict';

module.exports = server => {
    server.driver('domain', require('./lib/user-auth-domain')(server));
    //if adding to the domains add menu, add this
    server.driver('domain-builder', {
        discover: () => ({
            name: 'Acme Domain',
            group: 'Custom',
            domain: {
                type: 'acme'
            }
        })
    });
    // to have your domain be a toggled system setting (feature), comment out the domain-builder above and
    // uncoment this
    // server.driver('systemFeature', require('./lib/user-auth-feature')(server));
    require('./lib/user-session-hook')(server);
};