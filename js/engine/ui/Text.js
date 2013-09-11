/**
 * User: shaun
 * Date: 9/3/13 7:46 PM
 */


RETRO.Engine.Text = (function() {

    RETRO.extend(RETRO.Engine.UIObject, Text);

    function Text(font, label, x, y, rowCount) {
        RETRO.Engine.UIObject.call(this, x, y);

        this.font       = RETRO.required(font, "Text: Font is undefined.");
        this.rowCount   = RETRO.def(rowCount, 1);
        this.label      = RETRO.def(label, "");
    }

    Text.prototype.getWidth = function() {
        return this.font.calculateStringWidth(this.label);
    };

    Text.prototype.draw = function(context) {
        Text.base.draw.call(this, context);

        this.font.print(context, this.label, this.finalX, this.finalY, this.rowCount);
    };

    return Text;
})();
