/**
 * User: shaun
 * Date: 7/28/13 4:38 PM
 */


function UserAction(actions) {
    this.actions            = {};
    this._keysAllowed       = {};
    this._targetElements    = {};

    this.setActions(actions);
}

UserAction.prototype.enableAll = function() {
    window.addEventListener('keydown', Util.call(this, this.onKeyDown), true);
    window.addEventListener('keyup', Util.call(this, this.onKeyUp), true);

    window.addEventListener("touchstart", Util.call(this, this.onTouchStart), true);
    window.addEventListener("touchend", Util.call(this, this.onTouchEnd), true);
};

UserAction.prototype.setActions = function(actions) {
    var action;

    for(var actionName in actions) {
        if(actions.hasOwnProperty(actionName)) {
            action = actions[actionName];
            if(action['key']) {
                this._keysAllowed[action['key']] = actionName;
            }

            if(action['el']) {
                this._targetElements[actionName] = action['el'];
            }
        }
    }
};

UserAction.prototype.onKeyDown = function(e){
    var actionName = this._keysAllowed[e.keyCode];
    if(actionName) {
        this.actions[actionName] = true;
    }
};


UserAction.prototype.onKeyUp = function(e) {
    var actionName = this._keysAllowed[e.keyCode];
    if(actionName) {
        this.actions[actionName] = false;
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
