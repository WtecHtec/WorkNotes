import { jwtVerify } from "jose";
import { AUTH_ISSUER, JWT_SECRET, MCP_URL, MCP_RESOURCE, SCOPES } from "../shared/config.js";

const secret = new TextEncoder().encode(JWT_SECRET);

export async function authenticateBearer(req, res, next) {
  const header = req.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return unauthorized(res);

  try {
    const { payload } = await jwtVerify(match[1], secret, {
      issuer: AUTH_ISSUER,
      audience: MCP_URL,
      algorithms: ["HS256"]
    });
    if (!payload.sub || !payload.scope || typeof payload.scope !== "string") {
      return unauthorized(res);
    }
    req.auth = {
      userId: payload.sub,
      clientId: payload.client_id,
      scopes: payload.scope.split(/\s+/).filter(Boolean)
    };
    next();
  } catch {
    return unauthorized(res);
  }
}

function unauthorized(res) {
  const metadata = `${MCP_RESOURCE}/.well-known/oauth-protected-resource`;
  res.set(
    "WWW-Authenticate",
    `Bearer resource_metadata="${metadata}", scope="${SCOPES.join(" ")}"`
  );
  return res.status(401).json({
    error: "unauthorized",
    error_description: "A valid Bearer access token is required."
  });
}

export function requireScope(scope) {
  return (req, res, next) => {
    if (!req.auth?.scopes?.includes(scope)) {
      return res.status(403).json({ error: "insufficient_scope", required_scope: scope });
    }
    next();
  };
}
