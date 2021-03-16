'use strict';


/**
 * Short and trivial function library to demonstrate how to add addition libraries to the scripting context
 * @type {{hello: (function(*): string), goodbye: (function(*): string)}}
 */
module.exports = {
    hello: name => `Hello ${name}!`,
    goodbye: name => `Goodbye ${name}!`
}