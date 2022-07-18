function randomNum(min, max) {
	return min + Math.random() * (max - min);
}

function randomColor() {
	return `rgba(${randomNum(155, 200)}, ${randomNum(155, 200)}, ${randomNum(155, 200)},0.1)`;
}
