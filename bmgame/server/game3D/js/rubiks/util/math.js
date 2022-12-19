// import {Vector2, Vector3} from "three";

/**
 * get the angle between two Vector2
 * @returns angles in radian
 */
function getAngleBetweenTwoVector2 (vec1, vec2) {
    const dotValue = vec1.clone().dot(vec2);
    const angle = Math.acos(dotValue / (vec1.length() * vec2.length()));
    return angle;
};

function equalDirection (vec1, vec2, precision = 0.1) {
    const angle = vec1.angleTo(vec2);
    return Math.abs(angle) < precision;
};


function setFinish (finish) {
	const finishEle = document.getElementById("finish");
	// if (finishEle) {
	// 		finishEle.innerText = finish ? "👏 恭喜!" : "🤔 加油";
	// }
};