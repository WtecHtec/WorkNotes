# MCP Apps 本地最小 Demo

演示 MCP Apps 扩展(`io.modelcontextprotocol/ui`)的核心工作原理,四个角色都在本地跑:

```
web-client (浏览器)  <-- NDJSON 流 -->  orchestrator (Node)
                                          |        \
                                  MCP client(stdio)  \  HTTP
                                          |            \
                                  map-mcp-server   mock-llm-server
                                  (真正的 MCP 服务)  (假 LLM,流式)
```

- **map-mcp-server**:一个真正的 MCP Server(stdio 传输),暴露两个工具
  (`show_map`、`get_directions`)和一个 UI 资源(`ui://map/view`,一段 HTML)。
- **mock-llm-server**:假的 LLM,没有接任何真实模型,靠关键词匹配决定要不要"调用工具",
  用 NDJSON 流式吐 token,模拟真实 LLM function-calling 时的流式行为。
- **orchestrator**:两头连。一头用 MCP Client SDK 连 map-mcp-server(真协议通信);
  另一头是 Express server,给浏览器提供 `/api/chat`(流式聊天)和 `/api/ui-event`
  (UI 反向调用工具)两个接口。
- **web-client**:纯静态页面,读 `/api/chat` 的流式响应实时渲染文字,遇到
  `ui_resource` 事件就建一个 `sandbox="allow-scripts"` 的 iframe 把 HTML 塞进去,
  并通过 `postMessage` 和这个 iframe 双向通信。

## 怎么跑

```bash
# 三个服务,建议开三个终端各跑一个

cd mock-llm-server && npm install && node server.js      # :4001
cd map-mcp-server   && npm install                        # 不需要单独跑,orchestrator 会 spawn 它
cd orchestrator      && npm install && node server.js     # :4000,同时把 web-client 静态托管在这

```

然后浏览器打开 **http://localhost:4000/index.html**,输入:

- "带我看看东京塔"
- "浅草寺怎么走"
- "涩谷十字路口"

会看到:文字逐字流出 → 出现"🔧 调用工具"标签 → 一个可交互的地图卡片渲染出来 →
点地图里的"获取路线"按钮 → 卡片内展示步骤(这一步是 UI 反向请求 orchestrator 调用
`get_directions` 工具,不经过 LLM)→ LLM 再补一句收尾的话。

## 核心原理(接入自己项目时对应改哪里)

| 环节 | 本 demo 怎么做的 | 接入真实项目时怎么换 |
|---|---|---|
| **工具关联 UI** | `registerTool` 的 `config._meta["io.modelcontextprotocol/ui"].uri` 指向一个 `ui://` 资源 | 不变,这是 MCP Apps 规范的标准做法 |
| **UI 资源本体** | `registerResource("ui://map/view", { mimeType: "text/html;profile=mcp-app" }, ...)` 返回一段 HTML 字符串 | 换成你真正想要的界面(React/Vue 打包成单文件 HTML 也行,官方 SDK `examples/` 目录有各框架模板) |
| **LLM 决定调用工具** | mock-llm-server 靠关键词匹配 | 换成真的模型流式 API(Anthropic/OpenAI 的 streaming + tool_use/function_call 事件),orchestrator 消费逻辑基本不用改,只是把 `chunk.type === "tool_call"` 的判断换成读模型返回的 tool_use 块 |
| **调用 MCP 工具** | `mcpClient.callTool({ name, arguments })`,走真正的 stdio JSON-RPC | 不变;如果是远程 MCP 服务器,把 `StdioClientTransport` 换成 `StreamableHTTPClientTransport` 即可,上层逻辑不变 |
| **UI ↔ 宿主 双向通信** | 手写了一个简化版 `postMessage` 协议(`mcp-app:ready` / `mcp-app:render` / `mcp-app:call-tool` / `mcp-app:tool-result`) | 生产环境建议直接用官方 `@modelcontextprotocol/ext-apps` 的 `App` 类(iframe 侧)和 `app-bridge`(宿主侧),协议更完整、也处理了请求 ID 匹配、错误处理等细节,本 demo 是为了让你看清楚"到底传了什么"才手写的 |
| **iframe 沙箱** | `sandbox="allow-scripts"`,不开 `allow-same-origin`,所有通信只能走 `postMessage` | 不变,这是规范要求的安全模型,千万别加 `allow-same-origin` |
| **传输层的无状态化**(2026-07-28 新规范提到的部分) | 本 demo 用 stdio,天然无会话问题;HTTP 部分(orchestrator ↔ 浏览器,orchestrator ↔ mock-llm)也没有用任何 session id,每个请求自包含 | 如果你的 map-mcp-server 要换成 HTTP 部署给多个用户用,记得工具/资源的调用不要依赖"连接"或"会话",该带的身份信息放在请求参数或者你自己应用层的 token 里 |

## 已知的简化(MVP,不是 100% 规范实现)

- `postMessage` 协议是手写简化版,没有实现官方 SDK 里的请求签名 / 超时 / 多路复用。
- 没有做 `server/discover`、`Mcp-Method` / `Mcp-Name` 头这些无状态核心协议的机制,
  因为本 demo 走 stdio,不涉及跨机器路由的问题。
- mock LLM 只做关键词匹配,不是真的模型;换真模型时把 `mock-llm-server/server.js`
  整个换掉,orchestrator 消费 NDJSON 的逻辑不用动。
- 没有做鉴权、没有做 `requestState` 签名(MRTR 相关),生产环境如果要用到多轮确认场景,
  这块需要单独补上。

## 目录结构

```
mcp-app-demo/
├── map-mcp-server/       # 真正的 MCP Server(stdio)
│   ├── server.js
│   └── ui/map-app.html   # MCP App 的 UI 资源本体
├── mock-llm-server/      # 假 LLM,流式输出 + 关键词触发 tool_call
│   └── server.js
├── orchestrator/         # MCP Client + web 后端(核心枢纽)
│   └── server.js
└── web-client/           # 纯静态聊天页面
    └── index.html
```
