'use strict';

const _ = require('lodash');
const Logger = require('glib').Logger;
const log = new Logger('query-filter');
const QueryUtil = require('./server/lib/query-util');
const filterFields = require('./server/lib/filter-fields');

module.exports = server => {
    // add a checkbox to the features menu of all datasources to tag the ones that should be filtered
    server.driver('datasourceFeature', {
        id: 'apply-rls',
        name: 'Apply Row Level Filtering',
        description: 'Adds criteria to queries to limit what data they see based on a pre-defined rules.'
    });

    server.app.ext('datasource.beforeQuery', async function (datasource, query) {
        if(_.find(datasource.features, v => v.featureId === 'apply-rls')) {
            const table = _.get(query, 'payload.source.mappingId');
            if(table) {
                const fieldName = filterFields[table.toLowerCase()];
                if (fieldName) {
                    const mappingPath = _.get(query, 'payload.source.id');
                    const field = await server.app.db.model('Field').find({
                        where: {
                            mappingPath: mappingPath,
                            fieldId: fieldName
                        }
                    });
                    if(!field) {
                        throw new Error(`Field ${fieldName} is not present in mapping ${mappingPath}`);
                    }
                    //add a criterion with the user field expression
                    QueryUtil.addCriterion(query, field, '${user.northwindCountries}');
                }
            } else {
                //this is native sql, no filtering
                log.info('Native SQL reports cannot be filtered');
            }

        }
    });

};