const TYPES = {
	EVENT: 1,
	META: 2,
	DOM: 3,
}

let data = ".hover-text:hover {\n\t\t\tcolor: yellow;\n\t\t}\n\t.hover-text:hover {\n\t\t\tcolor: yellow;\n\t\t}\n\t"

var HOVER_SELECTOR = /:hover/g;
// var HOVER_SELECTOR_GLOBAL = new RegExp(HOVER_SELECTOR.source, "g");
const text = data.replace(HOVER_SELECTOR, '.hover')
console.log(text)