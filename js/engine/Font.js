/**
 * User: shaun
 * Date: 4/22/13
 * Time: 3:27 PM
 *
 * A class for managing a monospaced bitmap font.
 * See constructor for the proper character order for the font bitmap
 */

RETRO.Font = (function(){

    Font.DEFAULT_SIZE       = 24;
    Font.DEFAULT_LINEHEIGHT = 24;
    Font.DEFAULT_TRACKING   = 0;

    Font.SYM_SMALL_ARROW    = "\x01";
    Font.SYM_LARGE_ARROW    = "\x02";
    Font.SYM_COPY           = "\x03";


    function Font(fontSheet, numeric, tileSize, lineHeight, tracking) {
        this.fontSheet          = fontSheet;
        this.tileSize           = RETRO.def(tileSize, Font.DEFAULT_SIZE);
        this.fontMap            = {};
        this.cachedTextCanvas   = null;
        this.lastString         = "";
        this.lineHeight         = RETRO.def(lineHeight, Font.DEFAULT_LINEHEIGHT);
        this.tracking           = RETRO.def(tracking, Font.DEFAULT_TRACKING);

        if(numeric) {
            this.chars = "0123456789";
        } else {
            this.chars = "!\"'(),-./" + Font.SYM_SMALL_ARROW + Font.SYM_LARGE_ARROW + "0123456789" + Font.SYM_COPY + "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        }

        if(fontSheet) {
            this.parseSheet(fontSheet);
        }
    }

    Font.prototype.parseSheet = function(fontSheet) {
        var chars = this.chars,
            charIndex = 0,
            fontSheet = this.fontSheet,
            tileSize = this.tileSize,
            sheetWidth = fontSheet.width / tileSize,
            sheetHeight = fontSheet.height / tileSize,
            col = 0, row = 0,
            fontMap = {};

        while(row < sheetHeight) {
            if(col < sheetWidth) {
                var tile = document.createElement("canvas");
                tile.width = tileSize;
                tile.height = tileSize;

                var context = tile.getContext('2d');
                context.drawImage(fontSheet, col * tileSize, row * tileSize,
                    tileSize, tileSize,
                    0, 0,
                    tileSize, tileSize);

                if(this.isBlank(context)) {
                    col = 0;
                    row++;

                } else {
                    var chr = chars.substr(charIndex++, 1);
                    fontMap[chr] = tile;

                    col++;
                }

            } else {
                col = 0;
                row++;
            }
        }

        this.fontMap = fontMap;
    };

    Font.prototype.isBlank = function(context) {
        var imageData = context.getImageData(0, 0, this.tileSize, this.tileSize);

        for(var i = 0; i < imageData.height; i++) {
            for(var j = 0; j < imageData.width; j++) {
                var index=(j*4)*imageData.width+(i*4);
                var alpha = imageData.data[index + 3];
                if(alpha != 0) {
                    return false;
                }
            }
        }

        return true;
    };

    Font.prototype.calculateStringWidth = function(str) {
        return str.length * (this.tileSize + this.tracking);
    };

    Font.prototype.calculateStringHeight = function(rowCount) {
        return rowCount * this.lineHeight;
    };

    Font.prototype.print = function(context, str, col, row, rowCount) {
        if(!context || !str)
            return;

        col = col || 0;
        row = row || 0;
        rowCount = rowCount || 1;

        var fontMap = this.fontMap,
            tileSize = this.tileSize,
            lineHeight = this.lineHeight,
            tracking = this.tracking,
            strLen = str.length,
            textCanvas;

        if(this.lastString == str) {
            textCanvas = this.cachedTextCanvas;

        } else {
            textCanvas = document.createElement("canvas");
            textCanvas.width = strLen * (tileSize + tracking);
            textCanvas.height = rowCount * lineHeight;

            var textCanvasContext = textCanvas.getContext('2d'),
                x = 0, y = 0;

            for(var i = 0; i < strLen; i++) {
                var chr = str.substr(i, 1).toUpperCase();
                if(chr == "\n") {
                    y += lineHeight;
                    x = 0;

                } else if(chr == " ") {
                    x += (tileSize + tracking);

                } else {
                    var imgChr = fontMap[chr];
                    if(imgChr) {
                        textCanvasContext.drawImage(imgChr, x, y);
                        x += (tileSize + tracking);
                    }
                }
            }

            this.cachedTextCanvas = textCanvas;
            this.lastString = str;
        }

        context.drawImage(textCanvas, col, row);
    };

    return Font;
})();