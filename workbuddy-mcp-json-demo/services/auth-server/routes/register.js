import { Router } from "express";
import { randomToken } from "../../shared/crypto.js";
import { readJson, writeJson } from "../../shared/json-store.js";

export const registerRouter = Router();

function isAllowedRedirect(uri) {
  try {
    const url = new URL(uri);
    if (url.protocol === "https:") return true;
    return url.protocol === "http:" && ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}

registerRouter.post("/oauth/register", async (req, res) => {
  const body = req.body || {};
  const redirectUris = body.redirect_uris;
  if (!Array.isArray(redirectUris) || redirectUris.length === 0 || !redirectUris.every(isAllowedRedirect)) {
    return res.status(400).json({
      error: "invalid_redirect_uri",
      error_description: "redirect_uris must contain HTTPS URLs or localhost HTTP URLs for local development."
    });
  }

  const clients = await readJson("clients.json");
  const client = {
    client_id: `wb_${randomToken(18)}`,
    client_name: body.client_name || "WorkBuddy Connector",
    redirect_uris: redirectUris,
    grant_types: body.grant_types || ["authorization_code", "refresh_token"],
    response_types: body.response_types || ["code"],
    token_endpoint_auth_method: body.token_endpoint_auth_method || "none",
    scope: body.scope || "mcp.read mcp.write",
    created_at: new Date().toISOString()
  };
  clients.push(client);
  await writeJson("clients.json", clients);

  res.status(201).json({
    client_id: client.client_id,
    client_name: client.client_name,
    redirect_uris: client.redirect_uris,
    grant_types: client.grant_types,
    response_types: client.response_types,
    token_endpoint_auth_method: client.token_endpoint_auth_method,
    scope: client.scope
  });
});
