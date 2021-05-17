'use strict';

module.exports = server => {
    //add public resources to app bundle
    let bundle = server.bundle('acme-domain').scan(__dirname, 'public');
    server.injector().inject(bundle);
    //add driver to domain drivers
    server.driver('domain', require('./server/lib/user-auth-domain')(server));
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
    // server.driver('systemFeature', require('./server/lib/user-auth-feature')(server));
    require('./server/lib/user-session-hook')(server);
};