'use strict';


/**
 * Function that sets a new value based on the row values for the left and right aliases
 * Your flow step doesn't need to set new fields, this one does.
 * @param left
 * @param right
 * @param alias
 * @param row
 */
function applyFormula( left, right, alias, row ) {
    row[alias] = Math.sqrt((row[left] * row[right]) / Math.max(row[left], row[right]) ^ 2);
}


module.exports = server => {
    server.driver('flow',{
        id: 'example-fs',
        group: 'Add Field', // this can be existing menu group, or a new one
        name: 'Apply the magic formula',
        description: 'Apply the magic formula to the 2 operands',
        materialIcon: 'stars', //https://material.io/resources/icons/?style=baseline
        color: 'red',
        editor:'exampleFlowFieldEdit', // bound to our html in public/config.js
        post: function(queryResult, { alias, label, left, right } ) {
            queryResult.field(alias).label(label);
            queryResult.through(stream => stream.tap(row => applyFormula(left, right, alias, row)));
        }
    })
};