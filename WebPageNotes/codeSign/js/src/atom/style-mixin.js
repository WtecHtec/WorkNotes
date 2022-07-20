function retina_one_px_border(direction, color) {
  if (!direction || !color) return '';
  direction = direction.trim();
  color = color.trim();
  let result = `
    position: absolute;
    left: 0;
    top: 0;
    box-sizing: border-box;
  `
  if (direction == 'top' || direction == 'bottom') {
    result = `
      ${result}
      right: 0;
      height: 0;
      transform: scaleY(0.5);
      border-top: 1px solid ${color};
      transform-origin: 100% 0;
      `
  }
  if (direction == 'bottom') {
    result = `
      ${result}
      top: auto;
      bottom: 0;
      transform-origin: 0 100%;
      `
  }
  if (direction == 'right' || direction == 'left') {
    result = `
      ${result}
      width: 0;
      bottom: 0;
      transform: scaleX(0.5);
      border-left: 1px solid ${color};
      transform-origin: 0 0;
      `
  }
  if (direction == 'right') {
    result = `
      ${result}
      left: auto;
      right: 0;
      transform-origin: 100% 0;
    `
  }
  if (direction == 'all') {
    result = `
      ${result}
      width: 200%;
      height: 200%;
      transform-origin: left top;
      transform: scale(0.5);
      border: 1px solid ${color};
      `
  }
  return result;
}
function ellipsis_lines(lines) {
  if (!lines) return '';
  return `
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: ${lines.trim()};
    -webkit-box-orient: vertical;
  `
}

function text_overflow() {
  return `
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    word-break: break-all;
    word-wrap: normal;
  `
}

const STYLE_MIXIN = {
  '@retina_one_px_border': retina_one_px_border,
  '@text_overflow': text_overflow,
  '@ellipsis_lines': ellipsis_lines,
}