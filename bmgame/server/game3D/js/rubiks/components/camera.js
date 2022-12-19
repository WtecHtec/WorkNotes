/**
 * 创建摄像机
 * @returns 摄像机实例
 */
function createCamera() {
	const camera = new THREE.PerspectiveCamera(
			45,
			1,
			0.1,
			100
	);

	camera.position.set(0, 0, 15);

	return camera;
};

