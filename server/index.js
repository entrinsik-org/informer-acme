'use strict';

module.exports = server => {
    require('./domain')(server);
    require('./query-filter')(server);
};