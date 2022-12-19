
// export interface RotateDirection {
//     screenDir: Vector2; // 屏幕方向向量
//     startSquare: SquareMesh; // 代表方向的起始square，用于记录旋转的local方向
//     endSquare: SquareMesh; // 代表方向的终止square，用于记录旋转的local方向
// }

class CubeState {
    constructor(squares) {
				 /** 所有方块 */
				 this._squares = squares;
				 /** 是否正处于旋转状态 */
				 this.inRotation = false;
				 /**
					* 已经旋转的角度（弧度）
					*/
				 this.rotateAnglePI = 0;
				 /** 正在旋转的方块 */
				 this.activeSquares  = [];
				 /** 控制的方块 */
				 this.controlSquare = null;
				 /** 旋转方向 */
				 this.rotateDirection = null;
				 /** 旋转轴 */
				 this.rotateAxisLocal = null;
    }

   setRotating(control, actives, direction, rotateAxisLocal) {
        this.inRotation = true;
        this.controlSquare = control;
        this.activeSquares = actives;
        this.rotateDirection = direction;
        this.rotateAxisLocal = rotateAxisLocal;
    }

    resetState() {
        this.inRotation = false;
        this.activeSquares = [];
        this.controlSquare = undefined;
        this.rotateDirection = undefined;
        this.rotateAxisLocal = undefined;
        this.rotateAnglePI = 0;
    }

    /**
     * 是否是六面对齐
     */
    validateFinish() {
        let finish = true;

        const sixPlane = [
            {
                nor: new Vector3(0, 1, 0),
                squares: []
            },
            {
                nor: new Vector3(0, -1, 0),
                squares: []
            },
            {
                nor: new Vector3(-1, 0, 0),
                squares: []
            },
            {
                nor: new Vector3(1, 0, 0),
                squares: []
            },
            {
                nor: new Vector3(0, 0, 1),
                squares: []
            },
            {
                nor: new Vector3(0, 0, -1),
                squares: []
            },
        ];

        for (let i = 0; i < this._squares.length; i++) {
            const plane = sixPlane.find((item) => this._squares[i].element.normal.equals(item.nor));
            plane  && (plane.squares.push(this._squares[i]));
        }

        for (let i = 0; i < sixPlane.length; i++) {
            const plane = sixPlane[i];
            if (!plane.squares.every((square) => square.element.color === plane.squares[0].element.color)) {
                finish = false;
                break;
            }
        }

        return finish;
    }
}
