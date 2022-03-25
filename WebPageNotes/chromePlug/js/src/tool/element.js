// 创建一个img
function createImg(params = {}){
  const imgURL = chrome.runtime.getURL(params.url);
  const image = $('<img />')
  image.attr('src', imgURL)
  image.attr(params)
  return image
}
function createDiv(params = {}){
  const divEl = $('<div></div>')
  divEl.attr(params)
  return divEl;
}
function createInput(params = {}){
  const inputEl = $('<input />')
  inputEl.attr(params)
  return inputEl
}