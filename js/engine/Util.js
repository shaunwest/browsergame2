/**
 * User: shaun
 * Date: 6/24/13 6:56 PM
 */

function Util() {}

Util.call = function(context, func) {
    return function() {
        func.apply(context, arguments);
    };
};
