# WorkBuddy MCP + OAuth 本地 JSON Demo

两个独立服务，分别监听：

- MCP Streamable HTTP：`http://localhost:3001/mcp`
- OAuth 授权服务：`http://localhost:3002`

本地演示账号：`demo` / `123456`

## 1. 启动

```bash
cp .env.example .env
npm install
npm run dev
```

需要 Node.js 20 或更高版本。

## 2. 本地页面与健康检查

- 登录页：<http://localhost:3002/login>
- Auth 健康检查：<http://localhost:3002/health>
- MCP 健康检查：<http://localhost:3001/health>
- 资源元数据：<http://localhost:3001/.well-known/oauth-protected-resource>
- 授权服务器元数据：<http://localhost:3002/.well-known/oauth-authorization-server>

## 3. JSON 文件存储

`data/` 目录会在首次启动时自动创建：

- `users.json`：演示账号
- `clients.json`：动态注册的 OAuth Client
- `authorization-codes.json`：短期授权码
- `tokens.json`：Access Token / Refresh Token 记录

写入使用临时文件 + rename，适合单机开发演示。它不是并发高负载或多实例生产级数据库。

## 4. 授权流程

1. WorkBuddy 请求 MCP，MCP 返回 401 + `WWW-Authenticate`。
2. WorkBuddy 读取 MCP Protected Resource Metadata。
3. WorkBuddy 读取 Auth Server Authorization Server Metadata。
4. WorkBuddy 调用 `/oauth/register` 动态注册客户端。
5. WorkBuddy 打开 `/oauth/authorize`。
6. 用户登录 `demo / 123456` 并确认授权。
7. Auth Server 返回一次性 Authorization Code。
8. WorkBuddy 使用 PKCE verifier 调用 `/oauth/token`。
9. WorkBuddy 后续请求 MCP 时携带 `Authorization: Bearer <access_token>`。
10. MCP 使用与 Auth Server 共享的 JWT Secret 验证 Token。

## 5. 本地 curl 检查

检查元数据：

```bash
curl http://localhost:3001/.well-known/oauth-protected-resource
curl http://localhost:3002/.well-known/oauth-authorization-server
```

检查 MCP 未授权响应：

```bash
curl -i http://localhost:3001/mcp
```

应得到 401。MCP Streamable HTTP 的具体请求通常由 MCP 客户端 SDK 发起。

## 6. WorkBuddy Connector 配置提示

本地 `connector-meta.json` 示例中的 `server_url` 指向：

`http://localhost:3001/mcp`

但 WorkBuddy 云端不能访问你电脑上的 localhost。真正从 WorkBuddy 云端连接时，需要给两个服务分别提供公网 HTTPS 地址，并同步修改：

- `MCP_RESOURCE`
- `AUTH_ISSUER`
- Connector `server_url`

还要确认 WorkBuddy 的开发环境是否允许 HTTP localhost；正式发布按其文档的 HTTPS、安全域名及回调白名单要求配置。

## 7. 安全边界

这是本地学习 Demo，不要直接部署生产：

- 用户密码以明文保存在 `users.json`，仅为方便演示；生产必须使用 Argon2id/bcrypt 哈希。
- JWT 使用共享 HS256 密钥；生产建议使用非对称签名 + JWKS。
- JSON 文件不适合多进程并发写入、多实例部署。
- 需要补充客户端吊销、用户登出、Refresh Token 轮换与重放检测、审计日志、速率限制、CSRF 防护和 HTTPS。
- `/oauth/register` 对 redirect_uri 做 HTTPS/localhost 校验；接入 WorkBuddy 时仍需按平台要求限制允许的回调域名。
