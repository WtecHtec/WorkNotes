function createView() {
  if (g_form_data_map && Object.values(g_form_data_map).length) {
    const formDatas = Object.values(g_form_data_map).sort((a, b) => a.domId - b.domId);
    const tree = formatArrayToTree(formDatas);
    const parentDom = createFragment();
    createDom(tree, parentDom);
    console.log('parentDom===', parentDom);
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