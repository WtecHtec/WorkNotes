import express from 'express'
import React from 'react'//引入React以支持JSX的语法
import { renderToString } from 'react-dom/server'//引入renderToString方法
import { StaticRouter } from 'react-router-dom'
import Home from'./src/home'
// 将路由配置对象转换为组件
import { renderRoutes } from 'react-router-config'
// import Router from './src/router';
import Router  from './src/routers'
console.log('router====', Router)
const app = express()

// 使用express提供的static中间件,中间件会将所有静态文件的路由指向public文件夹
app.use(express.static('public'));


// const content = renderToString(<Home/>)
app.get('/', (req, res) => {
  const content = renderToString(
    // <StaticRouter location={req.path}>{renderRoutes(router)}</StaticRouter>
    <StaticRouter location={req.path}>{Router}</StaticRouter>
  );
  res.send(`
  <html>
    <head>
        <title>SSR Demo</title>
    </head>
    <body>
        <div id="root">
          ${content}
        </div>
    </body>
    <script src="/bundle.js"></script>
  </html>
  `);
})

app.listen(3000, () => console.log('Exampleapp listening on port 3000!'))