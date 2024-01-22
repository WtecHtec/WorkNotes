// import React from 'react' 
// import ReactDom from 'react-dom' 
// import Home from '../src/home' 


// // 使用hydrate在客户端进行二次渲染 
// // hydrate 参数1:目标组件，参数2:找到指定元素 
// ReactDom.hydrate(<div>
//     <Home /> 
// </div>, document.getElementById('root'))


import React from 'react'
import ReactDom from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { renderRoutes } from 'react-router-config'
import Router from '../src/router';
// import Router  from '../src/routers'

// ReactDom.hydrate(<BrowserRouter>{renderRoutes(router)}</BrowserRouter>, document.getElementById('root'))
ReactDom.hydrate(<BrowserRouter>{ Router }</BrowserRouter>, document.getElementById('root'))