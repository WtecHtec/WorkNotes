const path = require('path');
const baseConfig = require('./webpack.base')
const { merge } = require('webpack-merge')

const config = {
  // 入口文件
  entry: './client/index.js',
  // 导出
  output: {
    // 打包路径：使用path的API进行路径拼接
    path: path.join(__dirname, 'public'),
    // 打包文件名
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.css?$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      }
    ]
  }
}

module.exports = merge(baseConfig, config)