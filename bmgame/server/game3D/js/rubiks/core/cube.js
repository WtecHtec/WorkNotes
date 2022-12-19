/**
 * 获取square向里平移0.5的方块大小的位置
 */
const getTemPos = (square, squareSize) => {
	const moveVect = square.element.normal.clone().normalize().multiplyScalar(-0.5 * squareSize);
	const pos = square.element.pos.clone();

	return pos.add(moveVect);
};

/**
 * 魔方实例
 */
class Cube  extends THREE.Group {
	constructor(order) {
		super()
		// 初始化 魔方方块数据
		this.data = new CubeData(order);
		this.squares = this.children
		this.state = null
		// 渲染魔方
		this.createChildrenByData();

		this.rotateX(Math.PI * 0.25);
		this.rotateY(Math.PI * 0.25);

	}
	createChildrenByData() {
		this.remove(...this.children);
		for (let i = 0; i < this.data.elements.length; i++) {
			const square = createSquare(new THREE.Color(this.data.elements[i].color), this.data.elements[i]);
			this.add(square);
		}
		this.state = new CubeState(this.squares);
	}

	 /**
     * 旋转一个面
     * @param mousePrePos 旋转前的鼠标的屏幕坐标 
     * @param mouseCurPos 此时的鼠标屏幕坐标
     * @param controlSquare 控制的方块
     * @param camera 相机
     * @param winSize 窗口大小
     */
	rotateOnePlane(mousePrePos, mouseCurPos, controlSquare, camera, winSize) {
		if (mouseCurPos.distanceTo(mousePrePos) < 5) {
				return;
		}

		if (!this.squares.includes(controlSquare)) {
				return;
		}

		const screenDir = mouseCurPos.clone().sub(mousePrePos);
		if (screenDir.x === 0 && screenDir.y === 0) return;
		if (!this.state.inRotation) {
				const squareScreenPos = this.getSquareScreenPos(controlSquare, camera, winSize);

				const squareNormal = controlSquare.element.normal;
				const squarePos = controlSquare.element.pos;

				// 与 controlSquare 在同一面的其他 Square
				const commonDirSquares = this.squares.filter((square) => square.element.normal.equals(squareNormal) && !square.element.pos.equals(squarePos));

				// square1 和 sqaure2 垂直和竖直方向的同一面的两个 SquareMesh
				let square1;
				let square2;
				for (let i = 0; i < commonDirSquares.length; i++) {
						if (squareNormal.x !== 0) {
								if (commonDirSquares[i].element.pos.y === squarePos.y) {
										square1 = commonDirSquares[i];
								}
								if (commonDirSquares[i].element.pos.z === squarePos.z) {
										square2 = commonDirSquares[i];
								}
						} else if (squareNormal.y !== 0) {
								if (commonDirSquares[i].element.pos.x === squarePos.x) {
										square1 = commonDirSquares[i];
								}
								if (commonDirSquares[i].element.pos.z === squarePos.z) {
										square2 = commonDirSquares[i];
								}
						} else if (squareNormal.z !== 0) {
								if (commonDirSquares[i].element.pos.x === squarePos.x) {
										square1 = commonDirSquares[i];
								}
								if (commonDirSquares[i].element.pos.y === squarePos.y) {
										square2 = commonDirSquares[i];
								}
						}

						if (square1 && square2) {
								break;
						}
				}

				if (!square1 || !square2) {
						return;
				}

				const square1ScreenPos = this.getSquareScreenPos(square1, camera, winSize);
				const square2ScreenPos = this.getSquareScreenPos(square2, camera, winSize);

				// 记录可能旋转的四个方向
				const squareDirs = [];

				const squareDir1 = {
						screenDir: new THREE.Vector2(square1ScreenPos.x - squareScreenPos.x, square1ScreenPos.y - squareScreenPos.y).normalize(),
						startSquare: controlSquare,
						endSquare: square1
				};
				const squareDir2 = {
						screenDir: new THREE.Vector2(square2ScreenPos.x - squareScreenPos.x, square2ScreenPos.y - squareScreenPos.y).normalize(),
						startSquare: controlSquare,
						endSquare: square2
				};
				squareDirs.push(squareDir1);
				squareDirs.push({
						screenDir: squareDir1.screenDir.clone().negate(),
						startSquare: square1,
						endSquare: controlSquare
				});
				squareDirs.push(squareDir2);
				squareDirs.push({
						screenDir: squareDir2.screenDir.clone().negate(),
						startSquare: square2,
						endSquare: controlSquare
				});

				// 根据可能旋转的四个方向向量与鼠标平移方向的夹角确定旋转的方向，夹角最小的方向即为旋转方向
				let minAngle = Math.abs(getAngleBetweenTwoVector2(squareDirs[0].screenDir, screenDir));
				let rotateDir = squareDirs[0];  // 最终确定的旋转方向

				for (let i = 0; i < squareDirs.length; i++) {
						const angle = Math.abs(getAngleBetweenTwoVector2(squareDirs[i].screenDir, screenDir));

						if (minAngle > angle) {
								minAngle = angle;
								rotateDir = squareDirs[i];
						}
				}

				// 旋转轴：用法向量与旋转的方向的叉积计算
				const rotateDirLocal = rotateDir.endSquare.element.pos.clone().sub(rotateDir.startSquare.element.pos).normalize();
				const rotateAxisLocal = squareNormal.clone().cross(rotateDirLocal).normalize(); // 旋转的轴

				// 旋转的方块：由 controlSquare 位置到要旋转的方块的位置的向量，与旋转的轴是垂直的，通过这一特性可以筛选出所有要旋转的方块
				const rotateSquares = [];
				const controlTemPos = getTemPos(controlSquare, this.data.elementSize);

				for (let i = 0; i < this.squares.length; i++) {
						const squareTemPos = getTemPos(this.squares[i], this.data.elementSize);
						const squareVec = controlTemPos.clone().sub(squareTemPos);
						if (squareVec.dot(rotateAxisLocal) === 0) {
								rotateSquares.push(this.squares[i]);
						}
				}

				this.state.setRotating(controlSquare, rotateSquares, rotateDir, rotateAxisLocal);
		}

		const rotateSquares = this.state.activeSquares; // 旋转的方块
		const rotateAxisLocal = this.state.rotateAxisLocal; // 旋转的轴

		// 旋转的角度：使用 screenDir 在旋转方向上的投影长度，投影长度越长，旋转角度越大
		// 投影长度的正负值影响魔方旋转的角度方向
		// 旋转的角度 = 投影的长度 / 魔方的尺寸 * 90度
		const temAngle = getAngleBetweenTwoVector2(this.state.rotateDirection.screenDir, screenDir);
		const screenDirProjectRotateDirLen = Math.cos(temAngle) * screenDir.length();
		const coarseCubeSize = this.getCoarseCubeSize(camera, winSize);
		const rotateAnglePI = screenDirProjectRotateDirLen / coarseCubeSize * Math.PI * 0.5; // 旋转角度
		const newRotateAnglePI = rotateAnglePI - this.state.rotateAnglePI;
		this.state.rotateAnglePI = rotateAnglePI;

		const rotateMat = new THREE.Matrix4();
		rotateMat.makeRotationAxis(rotateAxisLocal, newRotateAnglePI);

		for (let i = 0; i < rotateSquares.length; i++) {
				rotateSquares[i].applyMatrix4(rotateMat);
				rotateSquares[i].updateMatrix();
		}
	}


	  /**
     * 获取一个粗糙的魔方屏幕尺寸
     */
    getCoarseCubeSize(camera, winSize) {
			const width = this.order * this.squareSize;
			const p1 = new THREE.Vector3(-width / 2, 0, 0);
			const p2 = new THREE.Vector3(width / 2, 0, 0);

			p1.project(camera);
			p2.project(camera);

			const {w, h} = winSize;
			const screenP1 = ndcToScreen(p1, w, h);
			const screenP2 = ndcToScreen(p2, w, h);

			return Math.abs(screenP2.x - screenP1.x);
	}
	   /**
     * 获得 Square 的标准屏幕坐标
     */
		getSquareScreenPos(square, camera, winSize) {
        if (!this.squares.includes(square)) {
            return null;
        }

        const mat = new THREE.Matrix4().multiply(square.matrixWorld).multiply(this.matrix);

        const pos = new THREE.Vector3().applyMatrix4(mat);
        pos.project(camera);

        const {w, h} = winSize;
        return ndcToScreen(pos, w, h);
    }

		  /**
     * 旋转后需要更新 cube 的状态
     */
			getAfterRotateAnimation() {
        const needRotateAnglePI = this.getNeededRotateAngle();
        const rotateSpeed = Math.PI * 0.5 / 500; // 1s 旋转90度
        let rotatedAngle = 0;
        let lastTick;
        let rotateTick = (tick) => {
            if (!lastTick) {
                lastTick = tick;
            }
            const time = tick - lastTick;
            lastTick = tick;
            if (rotatedAngle < Math.abs(needRotateAnglePI)) {
                let curAngle = time * rotateSpeed
                if (rotatedAngle + curAngle > Math.abs(needRotateAnglePI)) {
                    curAngle = Math.abs(needRotateAnglePI) - rotatedAngle;
                }
                rotatedAngle += curAngle;
                curAngle = needRotateAnglePI > 0 ? curAngle : -curAngle;

                const rotateMat = new Matrix4();
                rotateMat.makeRotationAxis(this.state.rotateAxisLocal, curAngle);
                for (let i = 0; i < this.state.activeSquares.length; i++) {
                    this.state.activeSquares[i].applyMatrix4(rotateMat);
                    this.state.activeSquares[i].updateMatrix();
                }
                return true;
            } else {
                this.updateStateAfterRotate();
                this.data.saveDataToLocal();
                return false;
            }
        }

        return rotateTick;
    }

		getNeededRotateAngle() {
			const rightAnglePI = Math.PI * 0.5;
			const exceedAnglePI = Math.abs(this.state.rotateAnglePI) % rightAnglePI;
			let needRotateAnglePI = exceedAnglePI > rightAnglePI * 0.5 ? rightAnglePI - exceedAnglePI : -exceedAnglePI;
			needRotateAnglePI = this.state.rotateAnglePI > 0 ? needRotateAnglePI : -needRotateAnglePI;

			return needRotateAnglePI;
	 }
	

    /**
     * 旋转后更新状态
     */
   updateStateAfterRotate() {
			// 旋转至正位，有时旋转的不是90度的倍数，需要修正到90度的倍数
			const needRotateAnglePI = this.getNeededRotateAngle();
			this.state.rotateAnglePI += needRotateAnglePI;

			// 更新 data：CubeElement 的状态，旋转后法向量、位置等发生了变化
			const angleRelative360PI = this.state.rotateAnglePI % (Math.PI * 2);
			// const timesOfRight = angleRelative360PI / rightAnglePI; // 旋转的角度相当于几个90度

			if (Math.abs(angleRelative360PI) > 0.1) {

					// 更新位置和法向量
					const rotateMat2 = new Matrix4();
					rotateMat2.makeRotationAxis(this.state.rotateAxisLocal, angleRelative360PI);

					const pn = [];

					for (let i = 0; i < this.state.activeSquares.length; i++) {
							const nor = this.state.activeSquares[i].element.normal.clone();
							const pos = this.state.activeSquares[i].element.pos.clone();

							nor.applyMatrix4(rotateMat2); // 旋转后的法向量
							pos.applyMatrix4(rotateMat2); // 旋转后的位置

							// 找到与旋转后对应的方块，更新它的颜色
							for (let j = 0; j < this.state.activeSquares.length; j++) {
									const nor2 = this.state.activeSquares[j].element.normal.clone();
									const pos2 = this.state.activeSquares[j].element.pos.clone();
									if (equalDirection(nor, nor2) && pos.distanceTo(pos2) < 0.1) {
											pn.push({
													nor: nor2,
													pos: pos2
											});
									}
							}
					}

					for (let i = 0; i < this.state.activeSquares.length; i++) {
							this.state.activeSquares[i].element.normal = pn[i].nor;
							this.state.activeSquares[i].element.pos = pn[i].pos;
					}
			}

			this.state.resetState();
	}
}