# i18n-processor

一个用于处理 React 项目国际化的命令行工具，支持 AST 和正则表达式两种处理模式。

## 特性

- 支持 AST 和正则表达式两种处理模式
- 支持处理 .js、.jsx、.ts、.tsx 文件
- 支持批量处理整个目录
- 支持自定义输出目录
- 支持变量插值的国际化处理

## 安装

```bash
npm install -g i18n-processor
```
## 使用
```bash
i18n-processor --help
```
## 选项
- `-f, --file <file>`: 指定要处理的文件或目录
- `-d, --dir <directory>`: '要处理的目录路径
- `-o, --output <output>`: 指定输出目录，默认为当前目录

