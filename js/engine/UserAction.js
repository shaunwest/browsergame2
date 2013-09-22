/**
 * User: shaun
 * Date: 7/28/13 4:38 PM
 */

RETRO.UserAction = (function(){
    function UserAction(actions) {
        this.actions            = {};
        this._actionDefs        = actions;
        this._keysAllowed       = {};
        this._targetElements    = {};

        this.setActions(actions);
    }

    UserAction.prototype.enableAll = function() {
        window.addEventListener('keydown', RETRO.call(this, this.onKeyDown), true);
        window.addEventListener('keyup', RETRO.call(this, this.onKeyUp), true);

        window.addEventListener("touchstart", RETRO.call(this, this.onTouchStart), true);
        window.addEventListener("touchend", RETRO.call(this, this.onTouchEnd), true);
    };

    UserAction.prototype.enable = function(actionName) {
        var action = this._actionDefs[actionName],
            keyAllowed = this._keysAllowed[action['key']];

        keyAllowed['enabled'] = true;
    };

    UserAction.prototype.disable = function(actionName) {
        var action = this._actionDefs[actionName],
            keyAllowed = this._keysAllowed[action['key']];

        keyAllowed['enabled'] = false;
        this.actions[keyAllowed['name']] = false;
    };

    UserAction.prototype.setActions = function(actions) {
        var action;

        for(var actionName in actions) {
            if(actions.hasOwnProperty(actionName)) {
                action = actions[actionName];
                if(action['key']) {
                    this._keysAllowed[action['key']] = {name: actionName, enabled: true};
                }

                if(action['el']) {
                    this._targetElements[actionName] = action['el'];
                }
            }
        }
    };

    UserAction.prototype.onKeyDown = function(e){
        var keyAllowed = this._keysAllowed[e.keyCode];
        if(keyAllowed && keyAllowed['enabled'] == true) {
            this.actions[keyAllowed['name']] = true;
        }
    };


    UserAction.prototype.onKeyUp = function(e) {
        var keyAllowed = this._keysAllowed[e.keyCode];
        if(keyAllowed) {
            this.actions[keyAllowed['name']] = false;
        }
    };

    UserAction.prototype.onTouchStart = function(e) {
        var touch = e.touches[0];

        e.preventDefault();

        for(var actionName in this._targetElements) {
            if(this._targetElements.hasOwnProperty(actionName)) {
                if(touch.target === this._targetElements[actionName]) {
                    this.actions[actionName] = true;
                }
            }
        }
    };

    UserAction.prototype.onTouchEnd = function(e) {
        e.preventDefault();

        // FIXME: this cancels ALL touches
        for(var actionName in this._targetElements) {
            if(this._targetElements.hasOwnProperty(actionName)) {
                this.actions[actionName] = false;
            }
        }
    };

    return UserAction;
})();