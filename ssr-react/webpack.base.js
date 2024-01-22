module.exports = {
  // 生产环境：开发环境
  mode: 'development',
  // 配置打包规则
  module: {
    rules: [
      {                  //打包规则 
        test: /\.js?$/,       //对所有js文件进行打包 
        loader: 'babel-loader',  //使用babel-loader进行打包 
        exclude: /node_modules/,//不打包node_modules中的js文件 
        options: {
          presets: ['react', 'stage-0', ['env', {
            //loader时额外的打包规则,对react,JSX，ES6进行转换 
            targets: {
              browsers: ['last 2 versions']   //对主流浏览器最近两个版本进行兼容 
            }
          }]]
        }
      }
    ],
  },
}