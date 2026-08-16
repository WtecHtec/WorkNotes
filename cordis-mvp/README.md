# Cordis MVP 插件系统示例

基于原始 Cordis 构建的插件系统最小可运行示例。

## 快速开始

```bash
npm install
npm run dev
```

## 项目结构

```
cordis-mvp/
├── src/
│   ├── core/
│   │   └── app.ts
│   ├── plugins/
│   │   ├── logger/
│   │   ├── greeter/
│   │   └── file-tool/
│   └── main.ts
├── package.json
└── tsconfig.json
```

## 已包含插件

- **logger**: 提供日志服务
- **greeter**: 带配置的问候插件（依赖 logger）
- **file-tool**: 简单的文件读取工具插件

## 注意事项

- 当前使用 `@cordiverse/cordis` 作为原始 Cordis 包
- 如安装失败可尝试 `github:cordiverse/cordis`
