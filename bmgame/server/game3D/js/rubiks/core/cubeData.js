/**
 * 魔方每个面的数据
 */
class CubeData {
	constructor(cubeOrder = 3, colors = ["#fb3636", "#ff9351", "#fade70", "#9de16f", "#51acfa", "#da6dfa"] ) {
		this.cubeOrder = cubeOrder;
    this.colors = colors;
		this._size = 1;
		this.elements = [];
		this.initElements();
	}

	initElements(localDataFirst = true) {
		if (localDataFirst && localStorage) {
			this.elements = this.getLocalData();
	}

	if (this.elements.length === this.cubeOrder * this.cubeOrder * 6) {
			return;
	}
		this.initialFinishData();
	}
	/**
	 * 创建复原的数据
	 */
	initialFinishData() {
		this.elements = [];
		const border = (this.cubeOrder * this._size) / 2 - 0.5;

		for (let x = -border; x <= border; x++) {
			for (let z = -border; z <= border; z++) {
					// 顶部
					this.elements.push({
							color: this.colors[0],
							pos: new THREE.Vector3(x, border + this._size * 0.5, z),
							normal: new THREE.Vector3(0, 1, 0)
					});
					// 底部
					this.elements.push({
							color: this.colors[1],
							pos: new THREE.Vector3(x, -border - this._size * 0.5, z),
							normal: new THREE.Vector3(0, -1, 0)
					});
			}
		}


		for (let y = -border; y <= border; y++) {
			for (let z = -border; z <= border; z++) {
				// 左边
					this.elements.push({
							color: this.colors[2],
							pos: new THREE.Vector3(-border - this._size * 0.5, y, z),
							normal: new THREE.Vector3(-1, 0, 0),
					});
					// 右边
					this.elements.push({
							color: this.colors[3],
							pos: new THREE.Vector3(border + this._size * 0.5, y, z),
							normal: new THREE.Vector3(1, 0, 0)
					});
			}
		}

		for (let x = -border; x <= border; x++) {
			for (let y = -border; y <= border; y++) {
				 // 前面
					this.elements.push({
							color: this.colors[4],
							pos: new THREE.Vector3(x, y, border + this._size * 0.5),
							normal: new THREE.Vector3(0, 0, 1),
					});
					// 后面
					this.elements.push({
							color: this.colors[5],
							pos: new THREE.Vector3(x, y, -border - this._size * 0.5),
							normal: new THREE.Vector3(0, 0, -1)
					});
			}
		}

	}

	   /**
     * 保存数据至 localStorage
     */
	 saveDataToLocal() {
			const data = JSON.stringify(this.elements);

			if (localStorage) {
					localStorage.setItem(`${this.cubeOrder}-Rubik`, data);
			}
	}

	getLocalData() {
		if (localStorage) {
				const data = localStorage.getItem(`${this.cubeOrder}-Rubik`);

				if (data) {
						const parseData = JSON.parse(data);

						parseData.forEach((item) => {
								item.normal = new THREE.Vector3(item.normal.x, item.normal.y, item.normal.z);
								item.pos = new THREE.Vector3(item.pos.x, item.pos.y, item.pos.z);
						});

						return parseData;
				}
		}

		return [];
}
	
}