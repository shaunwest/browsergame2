/**
 * @author shaun
 */

function LevelGenerator() {}

LevelGenerator.createLevel = function(width, height, fillTileId) {
    var level = [];

    for(var i = 0; i < height; i++) {
        level[i] = [];
        for(var j = 0; j < width; j++) {
            level[i][j] = fillTileId;
        }
    }

    return level;
};

LevelGenerator.setFloor = function(grid, topTileId, fillTileId) {
    var height = grid.length;
    var width = grid[0].length;

    for(var j = 0; j < width; j++) {
        grid[height - 1][j] = fillTileId;
        grid[height - 2][j] = fillTileId;
        grid[height - 3][j] = topTileId;
    }
};
