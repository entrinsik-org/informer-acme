'use strict';

const factorial = integer => (integer && Math.ceil(integer) === integer) ? integer * factorial(integer - 1) : 1;

module.exports = {
    add: values => [].concat(values).reduce((a, v) => a + v),
    factorial
};