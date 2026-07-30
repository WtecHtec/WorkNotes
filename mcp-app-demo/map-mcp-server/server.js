// map-mcp-server/server.js
//
// 一个最小的 MCP Server(走 stdio 传输),演示 MCP Apps 扩展的核心套路:
//   1. 声明一个 ui:// 资源(HTML,mimeType = text/html;profile=mcp-app)
//   2. 工具通过 _meta["io.modelcontextprotocol/ui"] 关联到这个 UI 资源
//   3. 工具被调用时,除了返回文本结果,还把结构化数据一起返回,
//      供宿主(orchestrator)转发给 UI iframe 做渲染
//
// 这里没有接真实地图 API(没有 key),用一个纯前端画的假地图(SVG 网格 + 标记点)
// 来演示交互:UI 里的按钮会通过 postMessage 反向请求宿主调用另一个工具(get_directions),
// 体现"双向通信"这一条。

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAP_APP_HTML = readFileSync(path.join(__dirname, "ui", "map-app.html"), "utf-8");

// 一个假的地点数据库,真实项目里换成高德/Google Maps 之类的 API 调用即可
const FAKE_PLACES = {
  "东京塔": { lat: 35.6586, lng: 139.7454, label: "东京塔" },
  "浅草寺": { lat: 35.7148, lng: 139.7967, label: "浅草寺" },
  "涩谷十字路口": { lat: 35.6595, lng: 139.7005, label: "涩谷十字路口" },
  "tokyo tower": { lat: 35.6586, lng: 139.7454, label: "Tokyo Tower" },
};

const server = new McpServer({
  name: "map-mcp-server",
  version: "0.1.0",
});

// ---- 1. 注册 UI 资源:ui://map/view ----
// mimeType 用 MCP Apps 约定的 text/html;profile=mcp-app
server.registerResource(
  "map-view",
  "ui://map/view",
  {
    title: "地图视图",
    description: "一个渲染地点标记 + 支持双向交互的 MCP App UI",
    mimeType: "text/html;profile=mcp-app",
  },
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/html;profile=mcp-app",
        text: MAP_APP_HTML,
      },
    ],
  })
);

// ---- 2. 工具:show_map ----
// 这是"入口工具" —— LLM 认为用户想看地图时调用它。
// 关键点:_meta["io.modelcontextprotocol/ui"].uri 把这个工具和上面的 UI 资源关联起来,
// 宿主看到这个 _meta 就知道:调用完这个工具后,应该把结果喂给 ui://map/view 渲染,而不是纯文本展示。
server.registerTool(
  "show_map",
  {
    title: "显示地图",
    description: "根据地点名称,在交互式地图上标出位置",
    inputSchema: {
      query: z.string().describe("要查找的地点名称,例如 '东京塔'"),
    },
    _meta: {
      "io.modelcontextprotocol/ui": {
        uri: "ui://map/view",
      },
    },
  },
  async ({ query }) => {
    const key = Object.keys(FAKE_PLACES).find(
      (k) => k.toLowerCase() === query.trim().toLowerCase()
    );
    const place = key ? FAKE_PLACES[key] : {
      lat: 35.681236,
      lng: 139.767125,
      label: `未找到"${query}",默认显示东京站附近`,
    };

    return {
      // 文本内容:给不支持 MCP Apps 的宿主兜底展示
      content: [
        {
          type: "text",
          text: `已在地图上标出:${place.label}(${place.lat}, ${place.lng})`,
        },
      ],
      // 结构化输出:宿主会把这个对象通过 postMessage 转发给 UI iframe
      structuredContent: {
        center: { lat: place.lat, lng: place.lng },
        markers: [place],
      },
    };
  }
);

// ---- 3. 工具:get_directions ----
// 这是"从 UI 反向发起"的工具:用户在地图 iframe 里点了"导航到这里",
// UI 通过 postMessage 请求宿主调用它,宿主再走一次正常的 tools/call。
// 这就是 MCP Apps 规范里"UI 也能调用其他工具"这条能力的最小实现。
server.registerTool(
  "get_directions",
  {
    title: "获取路线",
    description: "获取到指定地点的简单路线说明(mock 数据)",
    inputSchema: {
      destination: z.string(),
    },
  },
  async ({ destination }) => ({
    content: [
      {
        type: "text",
        text: `从当前位置到"${destination}":步行约 12 分钟,地铁约 4 分钟(mock 数据)。`,
      },
    ],
    structuredContent: {
      destination,
      steps: [
        "从当前位置出发,沿主干道向东走 200 米",
        "在第一个路口右转,直行 400 米",
        `到达 ${destination}`,
      ],
    },
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[map-mcp-server] 已通过 stdio 启动,等待 orchestrator 连接…");
