import "dotenv/config";

export const AUTH_PORT = Number(process.env.AUTH_PORT || 3002);
export const MCP_PORT = Number(process.env.MCP_PORT || 3001);
export const AUTH_ISSUER = (process.env.AUTH_ISSUER || `http://localhost:${AUTH_PORT}`).replace(/\/$/, "");
export const MCP_RESOURCE = (process.env.MCP_RESOURCE || `http://localhost:${MCP_PORT}`).replace(/\/$/, "");
export const MCP_URL = `${MCP_RESOURCE}/mcp`;
export const JWT_SECRET = process.env.JWT_SECRET || "local-demo-secret-change-me-please-32chars";
export const ACCESS_TOKEN_TTL_SECONDS = Number(process.env.ACCESS_TOKEN_TTL_SECONDS || 3600);
export const REFRESH_TOKEN_TTL_SECONDS = Number(process.env.REFRESH_TOKEN_TTL_SECONDS || 2592000);
export const SCOPES = ["mcp.read", "mcp.write"];
