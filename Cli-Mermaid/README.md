# mermaid-unicode

一个零运行时依赖的 Mermaid Unicode 渲染器。领域核心使用原生 ESM JavaScript，能够同时运行在 Node.js CLI 和现代浏览器中，不依赖 Mermaid.js、DOM、Canvas 或 SVG。

> 当前实现的是适合字符画的 Mermaid 实用子集，不等价于 Mermaid 官方完整语法。

## 已支持

- `graph` / `flowchart`：TD、TB、BT、LR、RL，矩形、圆角、菱形、链式边、fan-out、边标签、实线、虚线、粗线、回边、自循环、subgraph。
- `stateDiagram` / `stateDiagram-v2`：开始/结束状态、choice、别名、描述、方向和转换。
- `classDiagram`：属性/方法分栏、注解、继承、实现、组合、聚合和依赖关系。
- `erDiagram`：实体属性、实体别名、关系标签、基数和标识/非标识关系。
- `sequenceDiagram`：participant/actor、消息、自调用、Note、autonumber、loop/alt/par/critical 等分隔块。
- 中文、Emoji 和常见全角字符宽度。
- 超宽、超大或不支持输入的源码框降级。
- 纯文本、ANSI 和安全 HTML 三种输出。

## Node API

```js
import { renderAnsi, renderMermaid } from "mermaid-unicode"

const source = `
flowchart TD
  User[用户] -->|提交| API(API 服务)
  API --> Auth{权限验证}
`

const art = renderMermaid(source, { maxWidth: 100 })
console.log(renderAnsi(art))
```

核心结果包含：

```js
{
  plainLines,   // 无样式文本行
  styledLines,  // 由 text + role 组成的语义片段
  width,
  diagramType,
  fallback,
  reason
}
```

## CLI

从文件读取：

```bash
mermaid-unicode diagram.mmd --width 100
```

从 stdin 读取：

```bash
printf 'flowchart TD\nA --> B\n' | mermaid-unicode --no-color
```

参数：

- `--width <列数>`：限制图的显示宽度。
- `--no-color`：关闭 ANSI 色彩。
- `--help`：显示帮助。

非 TTY 输出以及设置了 `NO_COLOR` 环境变量时自动关闭色彩。

## Web

```js
import {
  defaultMermaidUnicodeCss,
  renderHtml,
  renderMermaid,
} from "mermaid-unicode"

const art = renderMermaid("flowchart LR\nA[Start] --> B[End]")

const style = document.createElement("style")
style.textContent = defaultMermaidUnicodeCss
document.head.append(style)

document.querySelector("#diagram").innerHTML = renderHtml(art)
```

`renderHtml()` 会转义全部用户内容；它生成的标签来自适配器自身，而不是 Mermaid 源码。若应用有严格 CSP，也可以直接消费 `styledLines`，使用 `textContent` 构建节点。

## 架构边界

```text
src/
├── domain/                  纯业务规则，不依赖 Node 或 DOM
│   ├── parsers/             每类图一个解析器
│   ├── layout/              分层、排序、坐标与轨道规划
│   ├── rendering/           Unicode Canvas、节点绘制和边路由
│   ├── model.js             图与时序图领域模型
│   └── unicode.js           平台一致的显示列宽规则
├── application/
│   └── render-mermaid.js    编排解析、布局和 fallback 用例
└── adapters/
    ├── node/                ANSI 与 CLI
    └── web/                 HTML/CSS
```

依赖方向始终由外向内：

```text
Adapters → Application → Domain
```

领域层禁止访问 `process`、文件系统、DOM 和 UI 框架。Node 和 Web 的变化不会迫使解析、布局和路由算法改变。

各模块遵循单一职责：

- Parser 只负责源码到领域模型。
- Graph structure 只负责 rank、顺序和轨道算法。
- Layout 只协调测量与坐标。
- Node painter 只绘制节点和分组。
- Edge router 只绘制连线与端点。
- Canvas 只维护字符网格和连接位。
- Application use case 只负责编排和异常降级。
- Adapter 只把语义输出转换为特定平台格式。

## 安全与资源限制

默认限制：

- 128 个节点或 participant
- 512 条边或时序项
- 24 个 subgraph
- 6 层 subgraph 嵌套
- 2,097,152 个画布单元格
- 节点标签最多 24 显示列 × 4 行

达到限制时不会抛出到 CLI/Web，而是返回带 `fallback: true` 的源码框。

## 开发验证

```bash
npm test
npm run example
```

测试基于 Node 内置 `node:test`，不需要安装第三方依赖。

浏览器示例位于 `examples/browser.html`；通过任意静态文件服务器打开即可。

## 来源说明

核心思路移植自 xAI `grok-build` 仓库固定提交中的 `xai-grok-markdown/src/mermaid.rs`，并为 JavaScript、Node CLI、Web 输出和整洁架构重新组织。原项目与本项目均采用 Apache-2.0 许可，详见 [NOTICE](./NOTICE) 与 [LICENSE](./LICENSE)。
