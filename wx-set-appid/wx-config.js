#!/usr/bin/env node
console.log('修改小程序开发环境')
const fs = require("fs");
const setting = {
  a: {
    dev: {
      mode: 'dev',
      appid: '******',
    },
    pro: {
      mode: 'pro',
      appid: '******',
    },
  },
  b: {
    dev: {
      mode: 'dev',
      appid: '******',
    },
    pro: {
      mode: 'pro',
      appid: '******',
    }
  }
}
let pjName = 'project.config.json'
let projectPath = ''
let cfName = 'config.js'
let configPath = ''

let settingData = {}
try {
  let setArgv = process.argv.slice(2)
  if (setArgv.length !== 2) {
    console.log('缺少参数',setting)
    return
  }
  if (!setting[setArgv[0]]) {
    console.log('参数错误',setting)
    return
  }
  if (!setting[setArgv[0]][setArgv[1]]) {
    console.log('参数错误',setting)
    return
  }
  settingData = setting[setArgv[0]][setArgv[1]]
  console.log('process.argv', setArgv)
  projectPath = process.cwd() + '\\' + pjName
  let isFile = fs.statSync(projectPath).isFile()
  if (isFile) {
    console.log(projectPath)
    try {
      let data = fs.readFileSync(projectPath, 'utf8');
      let jsonData = JSON.parse(data)
      jsonData.setting.appid = settingData.appid
      fs.writeFileSync(projectPath, JSON.stringify(jsonData, '', 2)  );
    } catch (e) {
      console.error('json error', e);
    }
  }
  // 修改config
  configPath = process.cwd() + '\\' + cfName
  isFile = fs.statSync(configPath).isFile()
  if (isFile) {
    // console.log(configPath)
    try {
      let data = fs.readFileSync(configPath, 'utf8');
      let modeStr = setArgv[0] === 'kf' ? ` mode = "${settingData.mode}";` : ` mode = '${settingData.mode}';`
      data = data.replace(/ mode = ["|\'][a-z]+["|\'];/, modeStr)
      fs.writeFileSync(configPath, data );
    } catch (e) {
      console.error('config error', e);
    }
  }
} catch(e){}
console.log('修改小程序开发环境 成功:' + settingData.mode)

