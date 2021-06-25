class DrawUtil{
    constructor(ctx) {
        try {
            if (!(ctx instanceof CanvasRenderingContext2D)) throw '画布实例对象错误！'
            this.ctx = ctx
        } catch (e) {
            console.error(e)
        }
    }
    drawLineX(x1,x2, top=0, left=0) {
        let ctx = this.ctx
        ctx.beginPath();
        ctx.moveTo(x1 + left, top);
        ctx.lineTo(x2 + left, top);
        ctx.closePath();
        ctx.stroke();
    }

    drawLineY(y1,y2, top=0, left=0) {
        let ctx = this.ctx
        ctx.beginPath();
        ctx.moveTo(left, y1 + top);
        ctx.lineTo(left, y2 + top);
        ctx.closePath();
        ctx.stroke();
    }
}