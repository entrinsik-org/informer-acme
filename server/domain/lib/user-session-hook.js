'use strict';

const UserUtil = require('./user-util');
const slug = require('slug');

/**
 * This module adds a listener to when a login is performed and a session is created.
 * The listener syncs up the user's organizations with teams in Informer
 * @param server
 */
module.exports = function (server) {
    const userUtil = new UserUtil(server);
    //Sequelize data models https://sequelize.org/v3/
    const { Session, Team, TeamMember, Domain} = server.app.db.models;
    const sequelize = server.app.db.sequelize;
    //Add session hook - a new session is created with most logins, so is a good time to sync up team data
    Session.addHook('afterCreate', async session => {
        const user = await session.getUser();
        // only sync up 'acme' domain users
        const domain = await Domain.findById(user.domain);
        if (domain.type === 'acme') {
            //load orgs and levels from remote system
            const orgs = await userUtil.getUserOrgs(user.username);
            // use a transaction
            await sequelize.requiresTransaction(async t => {
                /*
                    Remove the user from all prior teams. This approach assumes that the user should only
                    belong to teams coming from the remote system. If independent teams may be created in Informer,
                    and remote users assigned to them, then this approach is too blunt
                 */
                await TeamMember.destroy({
                    where: {
                        userId: user.username
                    }, transaction: t
                });
                // retrieve team info for this user from remote system
                const teams = orgs.map(row => ({
                    id: slug(row.orgname.toLowerCase()),
                    name: row.orgname,
                    domain: domain.id,
                    source: 'user login'
                }));
                // Bulk upsert inserts/updates teams but doesn't remove them
                await Team.bulkUpsert(teams);
                /*
                    Retrieve user membership info in those teams. The level in our fake remote database
                    coincidentally maps cleanly to the Access Levels in Informer:
                    MEMBER: 1,
                    DESIGNER: 2,
                    DATA_WIZARD: 3,
                    PUBLISHER: 4,
                    ADMIN: 5
                 */
                const memberships = orgs.map(row => ({
                    teamId: slug(row.orgname.toLowerCase()),
                    userId: user.username,
                    accessLevel: row.level
                }));
                // since we removed user from all teams before, we can simply bulk create now
                await TeamMember.bulkCreate(memberships, { transaction: t });
            });
        }
    });
};