import React from 'react'
import { Route, Redirect, Switch} from 'react-router';
import Home from './home'
import Text from './text'


const routers = [
  {
    type: 'route',
    path: '/',
    component: Home,
    exact: true
  },
  {
    type: 'route',
    path: 'text',
    component: Text,
    exact: true
  }
]

export default (<Switch> {
  routers.map((conf, index) => {
    const { type, ...otherConf } = conf;
    if (type === 'redirect') {
      return <Redirect key={index} {...otherConf} />;
    } else if (type === 'route') {
      return <Route key={index} {...otherConf}></Route>;
    }
  }).filter(item => item)
}</Switch>)
