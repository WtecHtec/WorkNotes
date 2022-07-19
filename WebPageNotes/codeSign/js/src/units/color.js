function randomNum(min, max) {
	return min + Math.random() * (max - min);
}

function randomColor() {
	return `rgba(${randomNum(38, 80)}, ${randomNum(92, 125)}, ${randomNum(200, 255)},0.5)`;
}
