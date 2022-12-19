class Control {

	constructor(camera, scene, renderer, cube) {
			this.cube = cube;
			this.renderer = renderer;
			this.scene = scene;
			this.camera = camera;
			this.raycaster = new THREE.Raycaster();
			this.domElement =this.renderer.domElement
			this.startPos = null
			this.lastOperateUnfinish = false;
			this.start = false;
			this._square = null;
	}

	getIntersects(offsetX, offsetY) {
			const x = (offsetX / this.domElement.clientWidth) * 2 - 1;
			const y = -(offsetY / this.domElement.clientHeight) * 2 + 1;

			this.raycaster.setFromCamera({x, y}, this.camera);

			let intersectSquares = [];
			for (let i = 0; i < this.cube.squares.length; i++) {
					const intersects = this.raycaster.intersectObjects([this.cube.squares[i]]);
					if (intersects.length > 0) {
							intersectSquares.push({
									distance: intersects[0].distance,
									square: this.cube.squares[i]
							});
					}
			}

			intersectSquares.sort((item1, item2) => item1.distance - item2.distance);

			if (intersectSquares.length > 0) {
					return intersectSquares[0];
			}

			return null;
	}
  operateStart(offsetX, offsetY) {
			if (this.start) {
					return;
			}
			this.start = true;
			this.startPos = new THREE.Vector2()
			const intersect = this.getIntersects(offsetX, offsetY);

			this._square = null;
			if (intersect) {
					this._square = intersect.square;
					this.startPos = new THREE.Vector2(offsetX, offsetY);

					// testSquareScreenPosition(this.cube, this._square, this.camera);
			}
	}
   operateDrag(offsetX, offsetY, movementX, movementY) {
			if (this.start && this.lastOperateUnfinish === false) {
					if (this._square) {
							const curMousePos = new THREE.Vector2(offsetX, offsetY);
							this.cube.rotateOnePlane(this.startPos, curMousePos, this._square, this.camera, {w: this.domElement.clientWidth, h: this.domElement.clientHeight});
					} else {
							const dx = movementX;
							const dy = -movementY;

							const movementLen = Math.sqrt(dx * dx + dy * dy);
							const cubeSize = this.cube.getCoarseCubeSize(
									this.camera, {
									w: this.domElement.clientWidth,
									h: this.domElement.clientHeight
							});


							const rotateAngle = Math.PI * movementLen / cubeSize;

							const moveVect = new THREE.Vector2(dx, dy);
							const rotateDir = moveVect.rotateAround(new THREE.Vector2(0, 0), Math.PI * 0.5);

							rotateAroundWorldAxis(this.cube, new THREE.Vector3(rotateDir.x, rotateDir.y, 0), rotateAngle);
					}
					this.renderer.render(this.scene, this.camera);
			}
	}

	operateEnd() {
			if (this.lastOperateUnfinish === false) {
					if (this._square) {
							const rotateAnimation = this.cube.getAfterRotateAnimation();
							this.lastOperateUnfinish = true;
							const animation = (time) => {
									const next = rotateAnimation(time);
									this.renderer.render(this.scene, this.camera);
									if (next) {
											requestAnimationFrame(animation);
									} else {
											setFinish(this.cube.finish);
											this.lastOperateUnfinish = false;
									}
							}
							requestAnimationFrame(animation);
					}
					this.start = false;
					this._square = null;
			}
	}
}
