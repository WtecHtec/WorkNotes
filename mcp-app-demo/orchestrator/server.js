// orchestrator/server.js
//
// 这是整个 demo 的"大脑",身兼两职:
//   1. MCP Client —— 通过 stdio 连接 map-mcp-server,调用它的工具、读取它的 ui:// 资源
//   2. Web 后端   —— 给浏览器里的 web-client 提供流式聊天接口 + 转发 UI 的工具调用请求
//
// 数据流大致是:
//
//   浏览器 --(POST /api/chat, NDJSON 流)--> orchestrator
//                                             |
//                                             |-- 转发给 mock-llm-server,拿到流式 token
//                                             |-- 若 LLM 决定调用工具:
//                                             |     -> 用 MCP client 调用 map-mcp-server 的工具
//                                             |     -> 读取该工具关联的 ui:// 资源(HTML)
//                                             |     -> 把 { html, structuredContent } 一起发回浏览器
//                                             v
//   浏览器渲染 sandboxed iframe,加载这段 HTML,并把 structuredContent 通过 postMessage 喂给它
//
//   浏览器 iframe 内用户点了"获取路线" --(POST /api/ui-event)--> orchestrator
//                                             -> 用 MCP client 再调用一次 get_directions 工具
//                                             -> 结果通过 HTTP 响应直接返回给浏览器
//                                             -> 浏览器再把结果 postMessage 回 iframe

import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MOCK_LLM_URL = process.env.MOCK_LLM_URL || "http://localhost:4001/generate";
const PORT = process.env.PORT || 4000;

// ---------- 1. 启动并连接 map-mcp-server(作为子进程,通过 stdio 通信) ----------
const mcpClient = new Client({ name: "orchestrator", version: "0.1.0" });
const transport = new StdioClientTransport({
  command: "node",
  args: [path.join(__dirname, "..", "map-mcp-server", "server.js")],
});
await mcpClient.connect(transport);

const { tools } = await mcpClient.listTools();
console.log(
  "[orchestrator] 已连接 map-mcp-server, 可用工具:",
  tools.map((t) => t.name).join(", ")
);

// 建一个 name -> tool 定义 的索引,方便后面查 _meta 里的 ui 关联
const toolIndex = Object.fromEntries(tools.map((t) => [t.name, t]));

// 读取某个工具关联的 UI 资源(如果有的话)
async function loadUiResourceForTool(toolName) {
  const tool = toolIndex[toolName];
  const uiMeta = tool?._meta?.["io.modelcontextprotocol/ui"];
  if (!uiMeta?.uri) return null;
  const result = await mcpClient.readResource({ uri: uiMeta.uri });
  const content = result.contents?.[0];
  return content ? { uri: uiMeta.uri, html: content.text, mimeType: content.mimeType } : null;
}

// ---------- 2. 调 mock-llm-server,把它的 NDJSON 流原样解析出来 ----------
async function* callMockLlm(body) {
  const resp = await fetch(MOCK_LLM_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      if (line) yield JSON.parse(line);
    }
  }
}

// ---------- 3. HTTP 层 ----------
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "web-client")));

// 主聊天接口:浏览器发一句话,拿回一条 NDJSON 流
app.post("/api/chat", async (req, res) => {
  const { message } = req.body || {};
  res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");
  const send = (obj) => res.write(JSON.stringify(obj) + "\n");

  try {
    // --- 第一轮:把用户消息交给 mock LLM,直播它的输出 ---
    let calledTool = null;
    for await (const chunk of callMockLlm({ message })) {
      if (chunk.type === "delta") {
        send({ type: "text", text: chunk.text });
      } else if (chunk.type === "tool_call") {
        calledTool = chunk;
        send({ type: "tool_call", name: chunk.name, arguments: chunk.arguments });

        // --- 真正调用 MCP 工具 ---
        const toolResult = await mcpClient.callTool({
          name: chunk.name,
          arguments: chunk.arguments,
        });
        send({ type: "tool_result", name: chunk.name, result: toolResult.structuredContent });

        // --- 如果这个工具挂了 UI 资源,把 HTML 一起发给前端渲染 ---
        const ui = await loadUiResourceForTool(chunk.name);
        if (ui) {
          send({
            type: "ui_resource",
            uri: ui.uri,
            html: ui.html,
            initialData: toolResult.structuredContent,
          });
        }
      }
      // chunk.type === "done" 这里忽略,循环结束自然代表这一轮完了
    }

    // --- 第二轮:如果调用过工具,再问一次 LLM,让它看着工具结果说句收尾的话 ---
    if (calledTool) {
      const toolCallInfo = { name: calledTool.name, arguments: calledTool.arguments };
      for await (const chunk of callMockLlm({ message, toolResult: toolCallInfo })) {
        if (chunk.type === "delta") send({ type: "text", text: chunk.text });
      }
    }

    send({ type: "done" });
  } catch (err) {
    console.error(err);
    send({ type: "error", message: String(err?.message || err) });
  } finally {
    res.end();
  }
});

// UI iframe 里发起的"反向工具调用"落在这里
// (对应 map-app.html 里 window.parent.postMessage({type:"mcp-app:call-tool", ...}))
app.post("/api/ui-event", async (req, res) => {
  const { tool, arguments: args } = req.body || {};
  try {
    const result = await mcpClient.callTool({ name: tool, arguments: args });
    res.json({ ok: true, result: result.structuredContent });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "..", "web-client", "index.html"));
});
app.listen(PORT, () => {
  console.log(`[orchestrator] listening on http://localhost:${PORT}`);
});
