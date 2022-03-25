
function createLoadingEl() {
  const loadingEl = $(`<div class="loading"></div>`)
  for(let i = 0; i < 5; i++) {
    loadingEl.append($('<span></span>'))
  }
  const loadingContent = $('<div class="hz-loading_content"></div>')
  loadingContent.append(loadingEl)
  return loadingContent;
}

function createCanvas(){
  const canvasEl = $('<canvas></canvas>')
  const bodyEl = $('body')
  canvasEl.attr( {
    'id': 'hz-note_canvas',
    'width': bodyEl.width() + 'px',
    'height': bodyEl.height() + 'px',
  })
  canvasEl.addClass('hz-tool_canvas')
  $('body').append(canvasEl)
  requestAnimationFrame(()=>{
    initFabricCanvas()
    initToolEL()
  })
}

function initEl() {
  g_loadingel = createLoadingEl()
  $('body').append(g_loadingel)
}
initEl()