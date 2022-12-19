/**
 * 创建场景
 * @param {*} bgColor 场景背景颜色
 * @returns 场景实例
 */
const createScene = (bgColor) => {
	const scene = new THREE.Scene();

	scene.background = new THREE.Color(bgColor);

	return scene;
};
