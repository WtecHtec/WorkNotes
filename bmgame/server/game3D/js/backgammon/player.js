class Player {
	/**
	 * 
	 * @param {*} name 玩家名称
	 * @param {*} pieceType  棋子颜色
	 */
	constructor(name, pieceType) {
		this.name = name
		/**
		 * 棋子颜色
		 * w: 白色
		 * b: 黑色
		 */
		this.pieceType = pieceType
	}
}