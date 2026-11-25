import { Router } from "express";
import { SignJWT } from "jose";
import { ACCESS_TOKEN_TTL_SECONDS, AUTH_ISSUER, MCP_URL, JWT_SECRET, REFRESH_TOKEN_TTL_SECONDS } from "../../shared/config.js";
import { randomToken, sha256Base64Url, safeEqual } from "../../shared/crypto.js";
import { readJson, writeJson } from "../../shared/json-store.js";

export const tokenRouter = Router();
const secret = new TextEncoder().encode(JWT_SECRET);

async function issueAccessToken({ user, clientId, scope, resource }) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ scope, client_id: clientId })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(AUTH_ISSUER)
    .setSubject(user.id)
    .setAudience(resource || MCP_URL)
    .setIssuedAt(now)
    .setExpirationTime(now + ACCESS_TOKEN_TTL_SECONDS)
    .setJti(randomToken(16))
    .sign(secret);
}

tokenRouter.post("/oauth/token", async (req, res) => {
  const { grant_type } = req.body || {};

  if (grant_type === "authorization_code") {
    const { code, client_id, redirect_uri, code_verifier, resource } = req.body;
    if (!code || !client_id || !redirect_uri || !code_verifier) {
      return res.status(400).json({ error: "invalid_request", error_description: "Missing code, client_id, redirect_uri or code_verifier." });
    }

    const codes = await readJson("authorization-codes.json");
    const index = codes.findIndex(x => x.code === code);
    if (index < 0) return res.status(400).json({ error: "invalid_grant" });
    const record = codes[index];

    // Consume the code before returning any token to prevent replay.
    codes[index] = { ...record, used: true };
    await writeJson("authorization-codes.json", codes);

    if (record.used || record.expires_at < Date.now() ||
        record.client_id !== client_id || record.redirect_uri !== redirect_uri ||
        !safeEqual(sha256Base64Url(code_verifier), record.code_challenge)) {
      return res.status(400).json({ error: "invalid_grant" });
    }

    const clients = await readJson("clients.json");
    const client = clients.find(x => x.client_id === client_id);
    if (!client) return res.status(400).json({ error: "invalid_client" });

    const users = await readJson("users.json");
    const user = users.find(x => x.id === record.user_id);
    if (!user) return res.status(400).json({ error: "invalid_grant" });

    const tokenResource = resource || record.resource || MCP_URL;
    const accessToken = await issueAccessToken({
      user, clientId: client_id, scope: record.scope, resource: tokenResource
    });
    const refreshToken = randomToken(48);
    const tokens = await readJson("tokens.json");
    tokens.push({
      refresh_token: refreshToken,
      user_id: user.id,
      client_id,
      scope: record.scope,
      resource: tokenResource,
      expires_at: Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000,
      revoked: false
    });
    await writeJson("tokens.json", tokens);

    return res.json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: ACCESS_TOKEN_TTL_SECONDS,
      refresh_token: refreshToken,
      scope: record.scope
    });
  }

  if (grant_type === "refresh_token") {
    const { refresh_token, client_id, resource } = req.body;
    if (!refresh_token || !client_id) return res.status(400).json({ error: "invalid_request" });

    const tokens = await readJson("tokens.json");
    const index = tokens.findIndex(x => x.refresh_token === refresh_token);
    if (index < 0) return res.status(400).json({ error: "invalid_grant" });
    const old = tokens[index];

    if (old.revoked || old.expires_at < Date.now() || old.client_id !== client_id) {
      return res.status(400).json({ error: "invalid_grant" });
    }

    // Rotate refresh token: invalidate the old one and persist the replacement.
    tokens[index] = { ...old, revoked: true };
    const newRefresh = randomToken(48);
    tokens.push({
      ...old,
      refresh_token: newRefresh,
      resource: resource || old.resource,
      expires_at: Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000,
      revoked: false
    });
    await writeJson("tokens.json", tokens);

    const users = await readJson("users.json");
    const user = users.find(x => x.id === old.user_id);
    if (!user) return res.status(400).json({ error: "invalid_grant" });

    const accessToken = await issueAccessToken({
      user, clientId: client_id, scope: old.scope, resource: resource || old.resource
    });
    return res.json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: ACCESS_TOKEN_TTL_SECONDS,
      refresh_token: newRefresh,
      scope: old.scope
    });
  }

  return res.status(400).json({ error: "unsupported_grant_type" });
});
