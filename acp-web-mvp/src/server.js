/**
 * HTTP 服务入口：静态资源 + API。
 * 只做启动与分流，路由与 ACP 逻辑在其它模块。
 */

import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApi } from './routes/api.js';
import { disposeAllSessions } from './acp/sessionManager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const PORT = Number(process.env.PORT || 3920);
const HOST = process.env.HOST || '127.0.0.1';

/** @type {Record<string, string>} */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
};

/**
 * 安全解析 public 下的文件路径，阻止目录穿越。
 * @param {string} urlPath
 * @returns {string | null}
 */
function resolvePublicFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0] || '/');
  const relative = decoded === '/' ? '/index.html' : decoded;
  const full = path.normalize(path.join(PUBLIC_DIR, relative));
  if (!full.startsWith(PUBLIC_DIR)) return null;
  return full;
}

/**
 * 若文件存在则作为静态资源返回。
 * @param {import('node:http').ServerResponse} res
 * @param {string} filePath
 * @returns {Promise<boolean>}
 */
async function tryServeStatic(res, filePath) {
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
    return true;
  } catch {
    return false;
  }
}

const server = http.createServer(async (req, res) => {
  const host = req.headers.host || `${HOST}:${PORT}`;
  const url = new URL(req.url || '/', `http://${host}`);

  // 优先 API
  if (url.pathname.startsWith('/api/')) {
    const handled = await handleApi(req, res, url);
    if (handled) return;
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'not_found' }));
    return;
  }

  // 静态资源
  const filePath = resolvePublicFile(url.pathname);
  if (!filePath || !(await tryServeStatic(res, filePath))) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`acp-web-mvp 已监听 http://${HOST}:${PORT}`);
  console.log('打开页面，选择 Claude 或 Codex，创建会话后即可对话。');
});

/**
 * 优雅退出：结束全部 Agent 子进程。
 * @param {string} signal
 */
function shutdown(signal) {
  console.log(`\n收到 ${signal}，正在清理会话…`);
  disposeAllSessions();
  server.close(() => process.exit(0));
  // 卡住则强制退出
  setTimeout(() => process.exit(1), 3000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
