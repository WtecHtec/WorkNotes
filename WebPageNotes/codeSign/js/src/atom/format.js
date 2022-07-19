/**
 * 统一颜色的值
 * @param {*} value
 * @returns
 */
function formatColor(value) {
  if (value && value.indexOf('#') === 0) {
    // 统一转成小写
    value = value.toLocaleLowerCase();
    // #F2F => #FF22FF
    if (value.length === 4) {
      const valueSplits = value.substring(1).split('');
      return `#${valueSplits[0]}${valueSplits[0]}${valueSplits[1]}${valueSplits[1]}${valueSplits[2]}${valueSplits[2]}`;
    }
  }
  return value;
}
/**
 * 统一content的值
 * @param {*} value
 * @returns
 */
function formatContent(value) {
  if (value) {
    return value.replace(/\s+/g, '').replace(/["|']/g, '"');
  }
  return value;
}

/**
 * 统一将0rpx, 0px, 0Px, 0PX 转换 0
 * @param {*} value
 * @returns
 */
function formatZero(value) {
  if (value) {
    value = value.toLocaleLowerCase();
    if (value === '0rpx' || value === '0px') return '0';
    return value;
  }
  return value;
}

const PropFormat = {
  color: formatColor,
  background: formatColor,
  'background-color': formatColor,
  content: formatContent,
  left: formatZero,
  right: formatZero,
  top: formatZero,
  bottom: formatZero,
  padding: formatZero,
  'padding-top': formatZero,
  'padding-bottom': formatZero,
  'padding-left': formatZero,
  'padding-right': formatZero,
  margin: formatZero,
  'margin-left': formatZero,
  'margin-right': formatZero,
  'margin-top': formatZero,
  'margin-bottom': formatZero,
};
