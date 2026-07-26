/**
 * 面向 Web 的会话仓库。
 * 将浏览器 sessionId 映射到一条存活的 AgentConnection（每会话一个 Agent 进程）。
 */

import { randomUUID } from 'node:crypto';
import { AgentConnection } from './agentConnection.js';
import { resolveSessionCwd } from '../config/agents.js';

/**
 * @typedef {{
 *   id: string,
 *   agentType: string,
 *   cwd: string,
 *   acpSessionId: string | null,
 *   connection: AgentConnection,
 *   createdAt: number,
 *   busy: boolean,
 * }} WebSession
 */

/** @type {Map<string, WebSession>} */
const sessions = new Map();

/**
 * 创建 Web 会话：spawn Agent、initialize、session/new。
 * @param {{ agentType: string, cwd?: string }} opts
 * @returns {Promise<{ id: string, agentType: string, cwd: string, acpSessionId: string }>}
 */
export async function createSession(opts) {
  const agentType = String(opts.agentType || '').trim();
  const cwd = resolveSessionCwd(opts.cwd);
  const id = randomUUID();

  const connection = new AgentConnection(agentType, cwd);
  /** @type {WebSession} */
  const session = {
    id,
    agentType,
    cwd,
    acpSessionId: null,
    connection,
    createdAt: Date.now(),
    busy: false,
  };

  // 先登记，失败时也能按 id 清理（当前实现直接 dispose connection）。
  sessions.set(id, session);

  try {
    await connection.start();
    const acpSessionId = await connection.createSession();
    session.acpSessionId = acpSessionId;
    return { id, agentType, cwd, acpSessionId };
  } catch (err) {
    sessions.delete(id);
    connection.dispose();
    throw err;
  }
}

/**
 * 查找会话；不存在则抛错。
 * @param {string} sessionId
 * @returns {WebSession}
 */
export function getSession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) throw new Error(`会话不存在：${sessionId}`);
  return session;
}

/**
 * 向指定会话发送一条用户消息并流式回调事件。
 * @param {string} sessionId
 * @param {string} text
 * @param {(ev: import('./agentConnection.js').StreamEvent) => void} onEvent
 * @returns {Promise<{ stopReason: string, fullText: string }>}
 */
export async function sendMessage(sessionId, text, onEvent) {
  const session = getSession(sessionId);
  if (session.busy) throw new Error('会话正忙，请等待当前轮次结束');
  const trimmed = String(text || '').trim();
  if (!trimmed) throw new Error('消息内容不能为空');

  session.busy = true;
  try {
    return await session.connection.prompt(trimmed, onEvent);
  } finally {
    session.busy = false;
  }
}

/**
 * 销毁 Web 会话并结束对应 Agent 进程。
 * @param {string} sessionId
 * @returns {boolean} 是否删除了已有会话
 */
export function destroySession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return false;
  session.connection.dispose();
  sessions.delete(sessionId);
  return true;
}

/**
 * 会话列表快照（调试 / 状态展示）。
 * @returns {{ id: string, agentType: string, cwd: string, busy: boolean, createdAt: number }[]}
 */
export function listSessions() {
  return [...sessions.values()].map((s) => ({
    id: s.id,
    agentType: s.agentType,
    cwd: s.cwd,
    busy: s.busy,
    createdAt: s.createdAt,
  }));
}

/**
 * 进程退出时尽量清理全部会话。
 */
export function disposeAllSessions() {
  for (const id of [...sessions.keys()]) {
    destroySession(id);
  }
}
