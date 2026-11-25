import { Router } from "express";
import { AUTH_ISSUER, MCP_URL, SCOPES } from "../../shared/config.js";

export const metadataRouter = Router();

// RFC 9728 Protected Resource Metadata is served by the MCP resource server.
// Kept here as an additional convenience route; canonical route is on port 3001.
metadataRouter.get("/.well-known/oauth-authorization-server", (_req, res) => {
  res.json({
    issuer: AUTH_ISSUER,
    authorization_endpoint: `${AUTH_ISSUER}/oauth/authorize`,
    token_endpoint: `${AUTH_ISSUER}/oauth/token`,
    registration_endpoint: `${AUTH_ISSUER}/oauth/register`,
    response_types_supported: ["code"],
    response_modes_supported: ["query"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
    scopes_supported: SCOPES
  });
});
