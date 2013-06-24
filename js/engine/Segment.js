/**
 * User: shaun
 * Date: 6/21/13 8:36 PM
 */

function Segment(x, y, width, height, level) {
    this.x              = x;
    this.y              = y;
    this.width          = width;
    this.height         = height;
    this.level          = level;
    this.levelData      = level.levelData;
    this.tileSize       = level.tileSize;
    this.tileSet        = level.tileSet;

    this.rendered       = false;

    this.canvas         = document.createElement("canvas");
    this.canvas.width   = width * this.tileSize;
    this.canvas.height  = height * this.tileSize;
    this.canvas.style.position = "absolute";

    this.context2d      = this.canvas.getContext('2d');
}

Segment.prototype.render = function() {
    var context2d = this.context2d,
        startX = this.x * this.width,
        startY = this.y * this.height,
        levelData = this.levelData,
        tileSet = this.tileSet,
        tileSize = this.tileSize,
        endX = startX + this.width,
        endY = startY + this.height,
        tile,
        x = 0, y = 0;

    for(var tileY = startY; tileY < endY; tileY++) {
        for(var tileX = startX; tileX < endX; tileX++) {
            if(levelData[tileY]) {
                tile = tileSet.getTile(levelData[tileY][tileX]);
                if(tile) {
                    context2d.drawImage(tile['image'], (x * tileSize), (y * tileSize));
                }
            }
            x++;
        }
        x = 0;
        y++;
    }
};
