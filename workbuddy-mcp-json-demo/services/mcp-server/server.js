import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readJson, writeJson } from "../shared/json-store.js";

export function createMcpServer(auth) {
  const server = new McpServer({
    name: "local-mcp-json-demo",
    version: "1.0.0"
  });

  server.registerTool(
    "get_user_info",
    {
      title: "获取当前用户信息",
      description: "返回当前已通过 OAuth 授权的用户信息。",
      inputSchema: {}
    },
    async () => {
      if (!auth.scopes.includes("mcp.read")) {
        return { isError: true, content: [{ type: "text", text: "Missing required scope: mcp.read" }] };
      }
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            user_id: auth.userId,
            client_id: auth.clientId,
            scopes: auth.scopes
          }, null, 2)
        }]
      };
    }
  );

  server.registerTool(
    "query_demo_data",
    {
      title: "查询演示数据",
      description: "返回一组本地演示数据，需要 mcp.read 权限。",
      inputSchema: {
        keyword: z.string().optional().describe("可选的筛选关键词")
      }
    },
    async ({ keyword }) => {
      if (!auth.scopes.includes("mcp.read")) {
        return { isError: true, content: [{ type: "text", text: "Missing required scope: mcp.read" }] };
      }
      const rows = [
        { id: 1, name: "Alpha", category: "document" },
        { id: 2, name: "Beta", category: "project" },
        { id: 3, name: "Gamma", category: "document" }
      ];
      const filtered = keyword
        ? rows.filter(x => `${x.name} ${x.category}`.toLowerCase().includes(keyword.toLowerCase()))
        : rows;
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ user_id: auth.userId, items: filtered }, null, 2)
        }]
      };
    }
  );

  server.registerTool(
    "create_demo_item",
    {
      title: "创建演示数据",
      description: "向本地 JSON 文件写入一条演示数据，需要 mcp.write 权限。",
      inputSchema: {
        name: z.string().min(1).describe("新数据名称")
      }
    },
    async ({ name }) => {
      if (!auth.scopes.includes("mcp.write")) {
        return { isError: true, content: [{ type: "text", text: "Missing required scope: mcp.write" }] };
      }
      let rows;
      try {
        rows = await readJson("demo-items.json");
      } catch {
        rows = [];
      }
      const item = { id: `item_${Date.now()}`, name, created_by: auth.userId, created_at: new Date().toISOString() };
      rows.push(item);
      await writeJson("demo-items.json", rows);
      return { content: [{ type: "text", text: JSON.stringify(item, null, 2) }] };
    }
  );

  return server;
}
