const elDatas = [
  {
    node: 'div',
    params: { id: 'note-btn', class: 'herz-m-from'},
    childrens: [
      {
        node: 'div',
        params: { title: "颜色修改",'data-type': 'other', class: 'hz-opt-img'},
        childrens: [
          {
            node: 'input',
            params: { type: 'color', id: 'hz-brush-color' , 'data-type': 'other',}
          }
        ]
      },
      {
        node: 'div',
        params: { title: "选择工具",'data-type': 'select', class: 'hz-opt-img hz-select'},
        childrens: [
          {
            node: 'img',
            params: { url: '/img/popup/select.png', class: 'wrap-image' , 
            'data-type': 'select',}
          }
        ]
      },
      {
        node: 'div',
        params: { title: "画笔",'data-type': 'pen', class: 'hz-opt-img hz-pen'},
        childrens: [
          {
            node: 'img',
            params: { url: '/img/popup/pen.png', class: 'wrap-image' , 
            'data-type': 'pen',}
          }
        ]
      },
      {
        node: 'div',
        params: { title: "箭头",'data-type': 'arrow', class: 'hz-opt-img hz-arrow'},
        childrens: [
          {
            node: 'img',
            params: { url: '/img/popup/arrow.png', class: 'wrap-image' , 
            'data-type': 'arrow',}
          }
        ]
      },
      {
        node: 'div',
        params: { title: "文字",'data-type': 'text', class: 'hz-opt-img hz-text'},
        childrens: [
          {
            node: 'img',
            params: { url: '/img/popup/text.png', class: 'wrap-image' , 
            'data-type': 'text',}
          }
        ]
      },
      {
        node: 'div',
        params: { title: "序号笔",'data-type': 'serial', class: 'hz-opt-img hz-serial'},
        childrens: [
          {
            node: 'img',
            params: { url: '/img/popup/serial.png', class: 'wrap-image' , 
            'data-type': 'serial',}
          }
        ]
      },
      
      {
        node: 'div',
        params: { title: "橡皮擦",'data-type': 'remove', class: 'hz-opt-img hz-remove'},
        childrens: [
          {
            node: 'img',
            params: { url: '/img/popup/remove.png', class: 'wrap-image' , 
            'data-type': 'remove',}
          }
        ]
      },
      {
        node: 'div',
        params: { title: "关闭，将不保存",'data-type': 'close', class: 'hz-opt-img hz-close'},
        childrens: [
          {
            node: 'img',
            params: { url: '/img/popup/del.png', class: 'wrap-image' , 
            'data-type': 'close',}
          }
        ]
      },
      {
        node: 'div',
        params: { title: "保存",'data-type': 'save', class: 'hz-opt-img hz-save'},
        childrens: [
          {
            node: 'img',
            params: { url: '/img/popup/sure.png', class: 'wrap-image' , 
            'data-type': 'save',}
          }
        ]
      },

    ]
  }
]

const EL_API = {
  div: createDiv,
  img: createImg,
  input: createInput,
}
function createEl(nodes, fnode) {
  let el =  null
  if (Array.isArray(nodes) && nodes.length) {
    for (let i = 0; i < nodes.length; i++ ) {
      el = EL_API[nodes[i].node](nodes[i].params)
      if (fnode) {
        fnode.append(el)
      }
      if (Array.isArray(nodes[i].childrens) && nodes[i].childrens.length) {
        createEl(nodes[i].childrens, el)
      }
    }
  }
  return el
}

function initToolEL() {
  const el = createEl(elDatas,)
  $('body').append(el)
  requestAnimationFrame(()=>{
    initEvent()
  })
}