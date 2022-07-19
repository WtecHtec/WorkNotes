
const be_config = { indent_size: 2, space_in_empty_paren: true }
function createView() {
	if (g_form_data_map && Object.values(g_form_data_map).length) {
		const formDatas = Object.values(g_form_data_map).sort((a, b) => a.domId - b.domId);
		const tree = formatArrayToTree(formDatas);
		const parentDom = createWxView();
		createDom(tree, parentDom);
		console.log('parentDom===',);
		$('.wtc_diaglog').show();
		$('code.hljs').each(function (i, block) {
			hljs.addCopyButton(block);
		});
		setTimeout(() => {
			const html = parentDom.html();
			$('#html_code').text(html_beautify(html, be_config));
			// $('#css_code').text(css_beautify(css, be_config));
			hljs.highlightAll()
		}, 0)
	}
}

function createDom(data, parentDom) {
	if (Array.isArray(data) && data.length) {
		data.forEach(item => {
			const dom = createWxView();
			if (item.className) {
				dom.attr('class', item.className);
			}
			parentDom.append(dom);
			if (item.children && item.children.length) {
				createDom(item.children, dom)
			}
		})
	}
}