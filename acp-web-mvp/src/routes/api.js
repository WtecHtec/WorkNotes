/**
 * MVP API 的 HTTP 路由处理。
 * 只做请求/响应映射，不包含 Agent 协议细节。
 */

import {
  createSession,
  destroySession,
  getSession,
  listSessions,
  sendMessage,
} from '../acp/sessionManager.js';
import { listAgentOptions } from '../config/agents.js';

/**
 * 读取完整请求体（UTF-8 字符串）。
 * @param {import('node:http').IncomingMessage} req
 * @returns {Promise<string>}
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

/**
 * 解析 JSON 请求体；失败抛出带 statusCode=400 的错误。
 * @param {import('node:http').IncomingMessage} req
 * @returns {Promise<any>}
 */
async function readJson(req) {
  const raw = await readBody(req);
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    const err = new Error('JSON 请求体无效');
    // @ts-ignore
    err.statusCode = 400;
    throw err;
  }
}

/**
 * 写出 JSON 响应。
 * @param {import('node:http').ServerResponse} res
 * @param {number} status
 * @param {unknown} payload
 */
function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

/**
 * 写出一条 SSE 事件。
 * @param {import('node:http').ServerResponse} res
 * @param {string} event 事件名
 * @param {unknown} data 数据对象（会 JSON 序列化）
 */
function writeSse(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

/**
 * 处理 API 请求。已处理返回 true。
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {URL} url
 * @returns {Promise<boolean>}
 */
export async function handleApi(req, res, url) {
  const { pathname } = url;
  const method = req.method || 'GET';

  try {
    // GET /api/agents — 可选 Agent 列表
    if (method === 'GET' && pathname === '/api/agents') {
      sendJson(res, 200, { ok: true, agents: listAgentOptions() });
      return true;
    }

    // GET /api/sessions — 当前存活会话
    if (method === 'GET' && pathname === '/api/sessions') {
      sendJson(res, 200, { ok: true, sessions: listSessions() });
      return true;
    }

    // POST /api/sessions  { agentType, cwd? } — 新建会话
    if (method === 'POST' && pathname === '/api/sessions') {
      const body = await readJson(req);
      const session = await createSession({
        agentType: body.agentType || body.agent,
        cwd: body.cwd,
      });
      sendJson(res, 201, { ok: true, session });
      return true;
    }

    // DELETE /api/sessions/:id — 结束会话
    const deleteMatch = pathname.match(/^\/api\/sessions\/([^/]+)$/);
    if (method === 'DELETE' && deleteMatch) {
      const id = decodeURIComponent(deleteMatch[1]);
      const removed = destroySession(id);
      sendJson(res, removed ? 200 : 404, {
        ok: removed,
        error: removed ? undefined : 'session_not_found',
      });
      return true;
    }

    // GET /api/sessions/:id — 会话详情
    const getMatch = pathname.match(/^\/api\/sessions\/([^/]+)$/);
    if (method === 'GET' && getMatch) {
      const id = decodeURIComponent(getMatch[1]);
      const s = getSession(id);
      sendJson(res, 200, {
        ok: true,
        session: {
          id: s.id,
          agentType: s.agentType,
          cwd: s.cwd,
          acpSessionId: s.acpSessionId,
          busy: s.busy,
          createdAt: s.createdAt,
        },
      });
      return true;
    }

    // POST /api/sessions/:id/messages  { text } → SSE 流
    const msgMatch = pathname.match(/^\/api\/sessions\/([^/]+)\/messages$/);
    if (method === 'POST' && msgMatch) {
      const id = decodeURIComponent(msgMatch[1]);
      const body = await readJson(req);
      const text = body.text ?? body.message ?? '';

      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      });
      // 尽量让代理立刻刷出响应头。
      if (typeof res.flushHeaders === 'function') res.flushHeaders();

      try {
        await sendMessage(id, text, (ev) => {
          writeSse(res, ev.type, ev);
        });
      } catch (err) {
        writeSse(res, 'error', {
          type: 'error',
          text: err instanceof Error ? err.message : String(err),
        });
      }
      res.end();
      return true;
    }

    return false;
  } catch (err) {
    const status = /** @type {any} */ (err).statusCode || 500;
    const message = err instanceof Error ? err.message : String(err);
    // 若已进入 SSE，只能再写一条 error 事件。
    if (res.headersSent) {
      try {
        writeSse(res, 'error', { type: 'error', text: message });
        res.end();
      } catch {
        /* 忽略 */
      }
      return true;
    }
    sendJson(res, status, { ok: false, error: message });
    return true;
  }
}
