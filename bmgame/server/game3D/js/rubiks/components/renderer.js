/**
 * 创建一个three渲染器
 * @returns 渲染器实例
 */
const createRenderer = () => {
	const renderer = new THREE.WebGLRenderer({antialias: true}); //抗锯齿开启
	return renderer;
};