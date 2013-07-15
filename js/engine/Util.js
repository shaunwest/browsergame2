/**
 * User: shaun
 * Date: 6/24/13 6:56 PM
 */

function Util() {}

Util.call = function(context, func) {
    var args = Array.prototype.slice.call(arguments, 2);
    return function() {
        func.apply(context, (args.length > 0) ? args : arguments);
    };
};

Util.def = function(arg, defaultValue) {
    return typeof arg === 'undefined' ? defaultValue : arg;
};

Util.setRequestAnimationFrame = function(frameLength) {
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = (function () {
            return window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback, fps) {
                    window.setTimeout(callback, frameLength); // frames per second
                };
        })();
    }
}
