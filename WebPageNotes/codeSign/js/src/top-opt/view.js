
const be_config = { indent_size: 2, space_in_empty_paren: true }
function createView() {
	if (g_form_data_map && Object.values(g_form_data_map).length) {
    $('#hz_loading').show();
		const formDatas = Object.values(g_form_data_map).sort((a, b) => a.rankNum - b.rankNum);
		const tree = formatArrayToTree(formDatas);
		const parentDom = createWxView();
    const cssData = {};
		createDom(tree, parentDom, cssData);
		$('.wtc_diaglog').show();
		setTimeout(() => {
			const html = parentDom.html();
			$('#html_code').text(html_beautify(html, be_config));
      if (Object.keys(cssData).length) {
        const css = Object.values(cssData);
        css.length && $('#css_code').text(css_beautify(css.join(''), be_config));
      }
      hljs.highlightAll()
      setTimeout(()=> {
        $('#hz_loading').hide();
      }, 200);
			
		}, 0)
	}
}

function createDom(data, parentDom, cssData) {
	if (Array.isArray(data) && data.length) {
		data.forEach(item => {
			const dom = createWxView();
      let atomCss = [];
      let otherNodes = [];
      if (item.style) {
        const styleDatas = getCssNodesByStyle(item.style.replace(/\r|\n|\\s/g, ''));
        const nodes = formatStyles(styleDatas);
        // 先转原子类
        [ atomCss = [], otherNodes = []]=  getGatherAtomCss(g_atom_gather, nodes);
        const remainNodes  = [];
        otherNodes.forEach(item => {
          const { prop, value } = item;
          const atom = getAtomCss(g_atom_base, prop, value);
          if (atom) {
            atomCss.push(atom);
            return
          }
          remainNodes.push(`${prop}:${value};`);
        })
        if (item.className && remainNodes && remainNodes.length ) {
          atomCss.push(item.className);
          cssData[`.${item.className}`] = `.${item.className}{${remainNodes.join(' ')}}`;
        } else if (remainNodes && remainNodes.length) {
          dom.attr('style', remainNodes.join());
        }
      }
      // 伪类
      if (item.afterContent && item.className) {
        const styleDatas = getCssNodesByStyle(item.afterContent.replace(/\r|\n|\\s/g, ''));
        const nodes = formatStyles(styleDatas);
        const [ gatherAtomCss = [], gatherOtherNodes = []]=  getGatherAtomCss(g_atom_gather, nodes, 1, 'after');
        if (gatherAtomCss.length) {
          atomCss = atomCss.concat(gatherAtomCss);
        }
        if (gatherOtherNodes.length) {
          let afterStr = '';
          gatherOtherNodes.forEach(gItem => {
            afterStr = `${afterStr}${gItem.prop}:${gItem.value};`
          })
          cssData[`.${item.className}::after`] = `.${item.className}::after{${afterStr}}`;
        }
        if (!atomCss.includes(item.className)) {
          atomCss.push(item.className);
        }
      }
      if (atomCss.length) {
        dom.attr('class', atomCss.join(' '));
      }
			parentDom.append(dom);
			if (item.children && item.children.length) {
				createDom(item.children, dom, cssData)
			}
		})
	}
}