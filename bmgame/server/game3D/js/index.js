//页面加载完成
window.onload = function(){
	createWorld();
}

function createWorld() {
	initRender("game");//创建渲染器
	initCamera();//创建相机
	initLight();//创建光源
	initObject();//创建物体
	initScene();//创建场景
	render();//渲染
}

var renderer;//渲染器
var width;
var height;
/**
 * 创建渲染器
 * @param {*} selector 元素id
 */
function initRender(selector){
	width = window.innerWidth;
	height = window.innerHeight;
	renderer = new THREE.WebGLRenderer({
			antialias : true//抗锯齿开启
	});
	renderer.setSize(width, height);//设置渲染器宽度和高度
	renderer.setClearColor('#ffffff', 1.0);//设置背景颜色
	renderer.setPixelRatio(window.devicePixelRatio);//设置设备像素比
	document.getElementById(selector).appendChild(renderer.domElement);//把渲染器放置到页面中
}

var camera;
var origPoint = new THREE.Vector3(0, 0, 0);//原点
/**
 * 创建摄像机
 */
function initCamera(){
		camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
		camera.position.set(200, 400, 600);//设置相机位置
		camera.up.set(0, 1, 0);//设置相机正方向
		camera.lookAt(origPoint);//设置相机视点
}

var pointLight;
var ambientLight;
function initLight() {
		//点光源
		pointLight = new THREE.PointLight( 0xffffff, 1, 2000 );
		pointLight.position.set(70, 112, 98);
		//环境光
		ambientLight = new THREE.AmbientLight( 0x333333 );
}

var cube;
function initObject(){
		var geometry = new THREE.BoxGeometry( 100, 100, 100);
		var material = new THREE.MeshLambertMaterial( {color: 0xff0000} );
		cube = new THREE.Mesh( geometry, material );
		cube.position.set(0,0,0);
}

var scene;
function initScene(){
		scene = new THREE.Scene();
		// scene.add(pointLight);
		// scene.add(ambientLight);
		// scene.add(cube)
		scene.background = new THREE.Color('#478967')
		return scene
}

function render(){
	renderer.clear();
	renderer.render(scene, camera);
	requestAnimationFrame(render);
}