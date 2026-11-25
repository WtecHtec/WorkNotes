import { Router } from "express";
import { randomToken, sha256Base64Url } from "../../shared/crypto.js";
import { readJson, writeJson } from "../../shared/json-store.js";
import { SCOPES } from "../../shared/config.js";

export const authorizeRouter = Router();

function html(title, body) {
  return `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
  <style>
    *{box-sizing:border-box}body{margin:0;background:#f4f6fa;color:#172033;font:15px system-ui,-apple-system,sans-serif;display:grid;min-height:100vh;place-items:center}
    .card{width:min(420px,calc(100% - 32px));background:white;border:1px solid #e5e9f0;border-radius:18px;padding:28px;box-shadow:0 12px 40px #17203312}
    h1{font-size:22px;margin:0 0 8px}p{color:#667085;line-height:1.6}.field{margin:18px 0}label{display:block;font-size:13px;margin-bottom:7px;color:#475467}
    input{width:100%;padding:12px;border:1px solid #d0d5dd;border-radius:9px;font-size:15px}button{width:100%;padding:12px;border:0;border-radius:9px;background:#2563eb;color:white;font-weight:600;font-size:15px;cursor:pointer}
    .secondary{background:#eef2f7;color:#344054;margin-top:9px}.scope{padding:10px;background:#f8fafc;border-radius:9px;font-family:monospace;font-size:13px}
    .error{color:#b42318;font-size:13px}
  </style><body><main class="card">${body}</main></body></html>`;
}

authorizeRouter.get("/login", (req, res) => {
  const params = new URLSearchParams(req.query);
  res.type("html").send(html("登录演示账号", `
    <h1>登录演示账号</h1><p>登录后继续授权 WorkBuddy 访问你的 MCP 服务。</p>
    ${req.query.error ? '<p class="error">账号或密码不正确，请重试。</p>' : ""}
    <form method="post" action="/login">
      <input type="hidden" name="state" value="${escapeHtml(params.toString())}">
      <div class="field"><label>用户名</label><input name="username" value="demo" autocomplete="username" required></div>
      <div class="field"><label>密码</label><input name="password" type="password" value="123456" autocomplete="current-password" required></div>
      <button type="submit">登录并继续</button>
    </form>
    <p>本地演示账号：demo / 123456</p>
  `));
});

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

authorizeRouter.post("/login", async (req, res) => {
  const users = await readJson("users.json");
  const user = users.find(x => x.username === req.body.username && x.password === req.body.password);
  if (!user) {
    return res.redirect(`/login?error=1&${req.body.state || ""}`);
  }
  // Demo-only session cookie. Production should use a proper session store and CSRF protection.
  res.cookie("demo_user", user.id, { httpOnly: true, sameSite: "lax" });
  const params = new URLSearchParams(req.body.state || "");
  return res.redirect(`/oauth/authorize?${params.toString()}`);
});

authorizeRouter.get("/oauth/authorize", async (req, res) => {
  const {
    response_type, client_id, redirect_uri, scope = "mcp.read",
    state, code_challenge, code_challenge_method, resource
  } = req.query;

  if (response_type !== "code" || !client_id || !redirect_uri || !state ||
      !code_challenge || code_challenge_method !== "S256") {
    return res.status(400).send("Invalid authorization request: response_type, client_id, redirect_uri, state and PKCE S256 are required.");
  }

  const clients = await readJson("clients.json");
  const client = clients.find(x => x.client_id === client_id);
  if (!client || !client.redirect_uris.includes(redirect_uri)) {
    return res.status(400).send("Unknown client or redirect_uri mismatch.");
  }

  const requestedScopes = String(scope).split(/\s+/).filter(Boolean);
  if (!requestedScopes.every(s => SCOPES.includes(s))) {
    return res.status(400).send("Unsupported scope.");
  }

  const userId = req.cookies.demo_user;
  const users = await readJson("users.json");
  const user = users.find(x => x.id === userId);
  if (!user) {
    const loginParams = new URLSearchParams(req.query);
    return res.redirect(`/login?${loginParams.toString()}`);
  }

  const params = new URLSearchParams({
    client_id, redirect_uri, scope: requestedScopes.join(" "),
    state, code_challenge, code_challenge_method, resource: String(resource || "")
  });

  res.type("html").send(html("确认授权", `
    <h1>授权 MCP 访问</h1>
    <p><strong>${escapeHtml(client.client_name)}</strong> 请求访问你的 MCP 资源。</p>
    <div class="scope">${escapeHtml(requestedScopes.join("  "))}</div>
    <p>当前登录用户：${escapeHtml(user.displayName || user.username)}</p>
    <form method="post" action="/oauth/authorize/decision">
      <input type="hidden" name="params" value="${escapeHtml(params.toString())}">
      <button name="decision" value="approve">同意授权</button>
      <button class="secondary" name="decision" value="deny">拒绝</button>
    </form>
  `));
});

authorizeRouter.post("/oauth/authorize/decision", async (req, res) => {
  const params = new URLSearchParams(req.body.params || "");
  const redirectUri = params.get("redirect_uri");
  const clientId = params.get("client_id");
  const state = params.get("state");
  const clients = await readJson("clients.json");
  const client = clients.find(x => x.client_id === clientId);

  if (!client || !redirectUri || !client.redirect_uris.includes(redirectUri)) {
    return res.status(400).send("Invalid client or redirect_uri.");
  }

  const callback = new URL(redirectUri);
  callback.searchParams.set("state", state || "");

  if (req.body.decision !== "approve") {
    callback.searchParams.set("error", "access_denied");
    return res.redirect(callback.toString());
  }

  const userId = req.cookies.demo_user;
  const users = await readJson("users.json");
  if (!users.some(x => x.id === userId)) return res.status(401).send("Please log in again.");

  const code = randomToken(32);
  const codes = await readJson("authorization-codes.json");
  codes.push({
    code,
    client_id: clientId,
    user_id: userId,
    redirect_uri: redirectUri,
    scope: params.get("scope") || "",
    code_challenge: params.get("code_challenge"),
    code_challenge_method: "S256",
    resource: params.get("resource") || "",
    expires_at: Date.now() + 5 * 60 * 1000,
    used: false
  });
  await writeJson("authorization-codes.json", codes);

  callback.searchParams.set("code", code);
  res.redirect(callback.toString());
});
