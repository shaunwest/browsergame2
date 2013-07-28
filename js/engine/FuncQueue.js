/**
 * User: shaun
 * Date: 7/27/13 4:25 PM
 */


function FuncQueue(context) {
    this._context    = context;
    this._queue      = [];
}

FuncQueue.prototype.queue = function(qItem) {
    this._queue.push(qItem);
};

FuncQueue.prototype.queueAll = function(list) {
    if(list instanceof Array) {
        for(var i = 0; i < list.length; i++) {
            this.queue(list[i]);
        }
    }
};

FuncQueue.prototype.dequeue = function() {
    var qItem = this._queue.shift(),
        func;

    if(qItem) {
        func = qItem[0];
        if(typeof func == "function") {
            func.apply(this._context, Array.prototype.slice.call(qItem, 1));
        } else {
            console.log("FuncQueue: Queue item does not include a function.");
            this.dequeue();
        }

        return true;

    } else {
        return false;
    }
};

FuncQueue.prototype.go = function(list) {
    if(list) {
        this.queueAll(list);
    }
    this.dequeue();
};



