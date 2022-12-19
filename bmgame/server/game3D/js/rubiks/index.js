//页面加载完成
window.onload = function(){
	createWorld();
}
var camera ;
var scene;
var renderer;
var cube;
function createWorld() {
	const container = document.getElementById('game')
	camera = createCamera();
	scene = createScene('#478967');
	renderer = createRenderer()
	container.appendChild(renderer.domElement);//把渲染器放置到页面中
	setSize(container, camera, renderer)
	setOrder()
	// new MouseControl(camera, scene, renderer, cube)
	// new THREE.OrbitControls(camera, renderer.domElement )
	startAnimation()
}
/**
 * 渲染器渲染场景
 */
function render() {
	renderer.render(scene, camera);
}
/**
 * 设置场景大小
 * @param {*} container 元素
 * @param {*} camera 摄像机
 * @param {*} renderer 渲染器
 */
function setSize(container, camera, renderer) {
	// 设置相机的纵横比
	camera.aspect = container.clientWidth / container.clientHeight;
	camera.updateProjectionMatrix();

	// 设置渲染器宽度和高度
	renderer.setSize(container.clientWidth, container.clientHeight);

	// 设置设备像素比
	renderer.setPixelRatio(window.devicePixelRatio);
};

/**
 * 启动帧刷新
 */
function startAnimation() {
	const animation = (time) => {
			// time /= 1000; // convert to seconds
			// if (this.cube) {
			// 		if (time < 2) {
			// 				this.cube.position.z = (-1 + time / 2) * 100;
			// 		} else {
			// 				this.cube.position.z = 0;
			// 		}
			// 		const dis = time;
			// 		this.cube.position.y = Math.sin(dis) * 0.3;
			// }
			render();
			requestAnimationFrame(animation);
	};

	requestAnimationFrame(animation);
}

/**
 * 设置几阶魔方
 */
function setOrder() {
	cube = new Cube(3);
	scene.add(cube);
	render();
}