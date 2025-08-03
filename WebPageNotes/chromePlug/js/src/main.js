
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

function renderNotes() {
	$('body').addClass('hz-body')
	g_loadingel.show()
	setTimeout(()=> {
		g_noteStatus = true
		if (!g_fabric_canvas) { 
			createCanvas()
		} else {
			$('.hz-tools_content').show()
			$('.herz-m-from').show()
		}
		requestAnimationFrame(()=> {
			$('.hz-opt-img').removeClass('ht-active')
			$('.hz-pen').addClass('ht-active')
			handleOpt('pen')
			g_loadingel.hide()
		})
	}, g_fabric_canvas ? 1000 : 2000)
}

function initEl() {
  g_loadingel = createLoadingEl()
  $('body').append(g_loadingel)
	window.onload =  ()=> {
		// renderHasData()
	}
}

async function renderHasData() {

	// g_login = getLogin('get');
	// const res = await checkHasData()
	// // const reads = handleReadStatus('get')
	// // console.log(res, )
	// if ( res ) {
	// 	const r = window.confirm('Notes Canvas 有一个笔记在召唤！！是否立即查看？')
	// 	if (r) {
	// 		console.log('opening')
	// 		handleReadStatus('set', true)
	// 		renderNotes();
	// 	} else {
	// 		console.log('close')
	// 		// getLogin('set', false);
  //     // renderNotes();
	// 	}
	// } else {
	// 	// getLogin('set', false);
  //   renderNotes();
	// }

  renderNotes();
}


initEl()