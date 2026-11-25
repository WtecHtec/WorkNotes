import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "./server.js";
import { authenticateBearer } from "./auth.js";
import { MCP_PORT, MCP_RESOURCE, AUTH_ISSUER, SCOPES } from "../shared/config.js";
import { ensureDataFiles } from "../shared/json-store.js";

await ensureDataFiles();

const app = express();
app.disable("x-powered-by");
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true, service: "mcp-server" }));

// OAuth Protected Resource Metadata (RFC 9728).
app.get("/.well-known/oauth-protected-resource", (_req, res) => {
  res.json({
    resource: `${MCP_RESOURCE}/mcp`,
    authorization_servers: [AUTH_ISSUER],
    scopes_supported: SCOPES,
    bearer_methods_supported: ["header"]
  });
});

app.all("/mcp", authenticateBearer, async (req, res) => {
  const server = createMcpServer(req.auth);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  });

  res.on("close", () => {
    transport.close();
    server.close();
  });

  try {
    console.log("req.body:::", req)
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP request failed:", error);
    if (!res.headersSent) res.status(500).json({ error: "internal_error" });
  }
});

app.listen(MCP_PORT, "0.0.0.0", () => {
  console.log(`MCP Server listening on http://localhost:${MCP_PORT}`);
});
