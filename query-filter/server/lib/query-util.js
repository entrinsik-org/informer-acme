'use strict';

const _ = require('lodash');
const Logger = require('glib').Logger;
const log = new Logger('query-filter');

/**
 * Utility class for mutating queries
 */
class QueryUtil {
    /**
     * Adds a 'field = values' expression
     * HINT: You can get the exact criterion structure by inspecting a query run in the browser, this is just one type
     * @param query
     * @param field
     * @param values
     */
    static addCriterion(query, field, values) {
        const lhsExpression = {
            type: 'field',
            id: field.id,
            schemaId: _.get(query, 'payload.source.schemaId'),
            mappingPath: _.get(query, 'payload.source.id'),
            mappingId: _.get(query, 'payload.source.mappingId'),
            fieldId: field.fieldId,
            linkRef: '',
            dataType: field.dataType,
            rawType: field.rawType,
            data: field.data
        };
        const divisionLeaf = {
            type: 'leaf',
            expression: {
                comparisonPredicate: {
                    lhsExpression: lhsExpression,
                    operator: {
                        id: 'EXACTLY_MATCHES',
                        comparison: '='
                    },
                    rhsExpression: {
                        dataType: 'keyword_text',
                        rawType: 'CHAR',
                        type: 'valueList',
                        value: values
                    },
                    limiter: 'any',
                    ignoreCase: false
                }
            }
        };
        const notEmptyLeaf = {
            type: 'leaf',
            expression: {
                emptyPredicate: {
                    lhsExpression: lhsExpression,
                    limiter: 'any',
                    operator: {
                        id: 'IS_NOT_EMPTY',
                        comparison: '=',
                        negated: true
                    }
                }
            }
        };

        const newConjunction = {
            type: 'group',
            junction: 'and',
            children: [divisionLeaf, notEmptyLeaf]
        };
        const existingCriteria = _.get(query, ['payload', 'criteria'], null);
        _.set(query, ['payload', 'criteria'], newConjunction);
        if (existingCriteria) {
            query.payload.criteria.children.push(existingCriteria);
        }
        log.debug('Query payload: %s', JSON.stringify(query.payload));
    }

}

module.exports = QueryUtil;
