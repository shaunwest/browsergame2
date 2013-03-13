/**
 * User: shaun
 * Date: 2/15/13
 * Time: 8:50 PM
 */


function TileSet(tileSetConfig, tileSheet, tileSize) {
    this.tileSetConfig      = tileSetConfig;
    this.tileDefinitions    = tileSetConfig.tileDefinitions;
    this.tileDefMap         = {};
    this.tileSheet          = tileSheet;
    this.tileSize           = tileSize;
    this.tiles              = {};

    this.parseSheet(this.tileDefinitions, this.tileSheet);
}


TileSet.prototype.parseSheet = function(tileDefinitions, tileSheet) {
    for(var i in tileDefinitions) {
        if(tileDefinitions.hasOwnProperty(i)) {
            var tileDef = tileDefinitions[i];
            var tileId = tileDef['id'];

            this.tileDefMap[tileId] = tileDef;

            var x = tileDef.x;
            var y = tileDef.y;

            var tile = document.createElement("canvas");
            tile.width = this.tileSize;
            tile.height = this.tileSize;

            var tileContext = tile.getContext('2d');
            tileContext.drawImage(tileSheet, x, y,
                this.tileSize, this.tileSize,
                0, 0,
                this.tileSize, this.tileSize);

            this.tiles[tileId] = {'image': tile, 'frames': []};

            if(tileDef.hasOwnProperty("frames")) {
                this.tiles[tileId]['frames'] = this.parseTileFrames(tileDef, tileSheet);
            }
        }
    }
};

TileSet.prototype.parseTileFrames = function(parentTileDef, tileSheet) {
    var frameCount = parentTileDef.frames;
    var frameX = parentTileDef.x;
    var frameY = parentTileDef.y;
    var frames = [];

    for(var j = 0; j < frameCount; j++) {
        frameX += this.tileSize;

        if(frameX >= tileSheet.width) {
            frameX = 0;
            frameY += this.tileSize;
        }

        var tile = document.createElement("canvas");
        tile.width = this.tileSize;
        tile.height = this.tileSize;

        var frameContext = tile.getContext('2d');
        frameContext.drawImage(tileSheet, frameX, frameY,
            this.tileSize, this.tileSize,
            0, 0,
            this.tileSize, this.tileSize);

        frames.push(tile);
    }

    return frames;
};

TileSet.prototype.getTile = function(tileId) {
    if(this.tiles.hasOwnProperty(tileId)) {
        return this.tiles[tileId];
    }

    return null;
};

TileSet.prototype.getTileDefinition = function(tileId) {
    if(this.tileDefMap.hasOwnProperty(tileId)) {
        return this.tileDefMap[tileId];
    }

    return null;
};

TileSet.prototype.getTileDefinitions = function() {
    return this.tileDefinitions;
};