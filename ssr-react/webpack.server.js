const path = require('path')
const baseConfig = require('./webpack.base')
const { merge } = require('webpack-merge')
const nodeExternals = require('webpack-node-externals')

const config = {
  // 代码运行环境：node
  target: 'node',
  // 入口文件
  entry: './app.js',
  // 导出
  output: {
    // 打包路径：使用path的API进行路径拼接
    path: path.join(__dirname, 'build'),
    // 打包文件名
    filename: 'bundle.js',
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.css?$/,
        use: [
          'isomorphic-style-loader', 
          'css-loader',
          'postcss-loader',]
      }
    ]
  }
}

module.exports = merge(baseConfig, config)
