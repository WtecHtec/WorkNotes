import React from 'react'                   //引入React以支持JSX
import { Route } from 'react-router-dom'    //引入路由
import Home from './home'        //引入Home组件
import Text from './text'

export default (
    <div>
        <Route path="/" exact component={Home}></Route>
        <Route path="/Text" exact component={Text}></Route>
    </div>
)
