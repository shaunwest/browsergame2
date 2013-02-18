/**
 * Created with JetBrains WebStorm.
 * User: shaun
 * Date: 2/15/13
 * Time: 8:50 PM
 * To change this template use File | Settings | File Templates.
 */


function TileSet(tileDefinitions, tileSheet, tileSize) {
    this.tileDefinitions    = tileDefinitions;
    this.tileSheet          = tileSheet;
    this.tileSize           = tileSize;
    this.tiles              = {};

    this.parseSheet(this.tileDefinitions, this.tileSheet);
}


TileSet.prototype.parseSheet = function(tileDefinitions, tileSheet) {
    for(var tileId in tileDefinitions) {
        if(tileDefinitions.hasOwnProperty(tileId)) {
            var tileDef = tileDefinitions[tileId];
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

            this.tiles[tileId] = tile;
        }
    }
};

TileSet.prototype.getTile = function(tileId) {
    if(this.tiles.hasOwnProperty(tileId)) {
        return this.tiles[tileId];
    }

    return null;
};