'use strict';

const example = require('./example');
const other = require('./other');
module.exports = function (server) {
    // bind to '$custom' context variable
    /*
           These are only accessible in power-scripts
           used like this
           $record.fieldAlias = $custom.other.factorial($record.{integer field};
     */
    server.driverManager('scriptContext').add({
        id: 'example-script',
        populate: ctx => ctx.$custom = { example, other }
    });
};

