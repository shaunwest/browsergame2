/**
 * User: shaun
 * Date: 7/30/13 5:24 PM
 */


var RETRO = {};

if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}

RETRO.extend = function(base, sub) {
    sub.prototype = Object.create(base.prototype);
    sub.prototype.constructor = sub;
    sub.base = base.prototype;
    return sub;
};

RETRO.call = function(context, func) {
    var args = Array.prototype.slice.call(arguments, 2);
    return function() {
        func.apply(context, (args.length > 0) ? args : arguments);
    };
};

RETRO.def = function(arg, defaultValue) {
    return typeof arg === 'undefined' ? defaultValue : arg;
};

RETRO.required = function(arg, error) {
    error = RETRO.def(error, "A required value was undefined");
    if(typeof arg === 'undefined') {
        throw error;
    }
    return arg;
};
