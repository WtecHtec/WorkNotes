class Piece {
	constructor() {
		this._max = 20
		this._step = 50
		this._winstep = 5
		this.pieces = new Array(this._max)
		for(let i = 0; i < this._max; i++) {
			this.pieces[i] = new Array(this._max).fill(0)
		}
		this.pieceMap = {}
		let _max = 475
		for(let i = 0; i < this._max; i++ ) {
			this.pieceMap[_max] = i;
			_max -= this._step;
		}
		this.winer = ''
		this.count = 0
	}
	/**
	 * 设置当前棋局
	 * @param {*} x 坐标
	 * @param {*} z  坐标
	 * @param {*} pt 棋子类型 1: red 2: black
	 */
	setPices(x, z, pt) {
		const i = this.pieceMap[x]
		const j = this.pieceMap[z]
		if (this.pieces[i][j] === 0) {
			this.pieces[i][j] = pt
			this.count ++
			return true
		}
		return false
	}
	isWin(x, z, pt) {
		const i = this.pieceMap[x]
		const j = this.pieceMap[z]
	  const win = this.horizontalWin(i, j, pt) 
						|| this.verticalWin(i, j, pt) 
						|| this.forwardSlashWin(i, j, pt)
						|| this.backSlashWin(i, j, pt);
		this.winer = win ? pt : null;
		return win
	}
	isFinsh() {
		return this.count === this._max * this._max;
	}
	/** 
	 * 判断横行是否连线
	 */
	horizontalWin(x, y, pt) {
	 	let  count = 0
		for(let i = -this._winstep; i < this._winstep; i++) {
			if (y + i < 0 || y + i >= this._max) continue
			if (this.pieces[x][ y +  i] === pt) count++
		}
		return count >= 5
	}
	/** 
	 * 判断纵行是否连线
	 */
	verticalWin(x, y, pt) {
		let  count = 0
		for(let i = -this._winstep; i < this._winstep; i++) {
			if (x + i < 0 || x + i >= this._max) continue
			if (this.pieces[x + i][ y] === pt) count++
		}
		return count >= 5
 	}
	/** 
	 * 判断正斜线是否连线
	 */
	forwardSlashWin(x, y, pt) {
		let  count = 0
		for(let i = -this._winstep; i < this._winstep; i++) {
			if (x + i < 0 || x + i >= this._max) continue
			if (y + i < 0 || y + i >= this._max) continue
			if (this.pieces[x + i][ y + i] === pt) count++
		}
		return count >= 5
 	}
  	/** 
	 * 判断反斜线是否连线
	 */
	backSlashWin(x, y, pt) {
		let  count = 0
		for(let i = -this._winstep; i < this._winstep; i++) {
			if (x + i < 0 || x + i >= this._max) continue
			if (y + ( -i ) < 0 || y + (-i) >= this._max) continue
			if (this.pieces[x + i][ y + (-i)] === pt) count++
		}
		return count >= 5
 	}
}