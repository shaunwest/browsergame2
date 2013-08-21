/**
 * User: shaun
 * Date: 7/30/13 8:53 PM
 */

module("Initialize", {
    setup: function() {
        this.frameQueue = new RETRO.FrameQueue();
    }
});

test("Queue should be empty", function() {
    expect(1);
    ok(this.frameQueue.isEmpty(), "Queue is empty");
});


module("Enqueue and dequeue", {
   setup: function() {
       this.frameQueue = new RETRO.FrameQueue();
   }
});

test("Add item and update", function() {
    expect(3);
    var funcExecuted = false;
    var testFunc = function() {
        funcExecuted = true;
    };
    this.frameQueue.enqueue(testFunc);

    ok(!this.frameQueue.isEmpty(), "Queue is not empty");

    this.frameQueue.update();
    ok(funcExecuted, "funExecuted is true");
    ok(this.frameQueue.isEmpty(), "Queue is empty");
});