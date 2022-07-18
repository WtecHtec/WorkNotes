function randomNum(min, max) {
  return min + Math.random() * (max - min);
}

function randomColor() {
  return `rgba(${randomNum()}, ${randomNum()}, ${randomNum()},0.08)`;
}
