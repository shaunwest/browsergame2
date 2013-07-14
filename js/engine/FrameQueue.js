/**
 * User: shaun
 * Date: 7/3/13 6:37 PM
 */


function FrameQueue(context) {
    this.context    = context;
    this.queue      = [];
}

FrameQueue.prototype.enqueue = function(func) {
    this.queue.push(func);
};

FrameQueue.prototype.dequeue = function() {
    var func = this.queue.shift();

    if(this.context) {
        func.call(this.context);
    } else {
        func();
    }
};

FrameQueue.prototype.update = function() {
    if(!this.isEmpty()) {
        this.dequeue();
    }
};

FrameQueue.prototype.isEmpty = function() {
    return (this.queue.length == 0);
};


