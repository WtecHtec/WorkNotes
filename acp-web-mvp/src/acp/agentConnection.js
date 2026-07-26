/**
 * 一条存活的 ACP Agent 连接（子进程 + 已 initialize 的 RPC）。
 * 负责针对单个 Agent 二进制的 boot、session/new、session/prompt。
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createNdjsonRpc } from './rpc.js';
import { handleHostRequest } from './hostHandlers.js';
import { buildAgentEnv, getAgentProfile } from '../config/agents.js';

/**
 * @typedef {{
 *   type: 'text' | 'thinking' | 'tool_start' | 'tool_complete' | 'status' | 'error' | 'done',
 *   text?: string,
 *   toolName?: string,
 *   toolCallId?: string,
 *   stopReason?: string,
 * }} StreamEvent
 */

/**
 * 把 ACP 的 session/update 规范化成前端好用的事件。
 * @param {any} update
 * @returns {StreamEvent | null}
 */
function mapSessionUpdate(update) {
  const kind = update?.sessionUpdate;
  if (kind === 'agent_message_chunk' && update?.content?.type === 'text') {
    return { type: 'text', text: update.content.text || '' };
  }
  if (kind === 'agent_thought_chunk' && update?.content?.type === 'text') {
    return { type: 'thinking', text: update.content.text || '' };
  }
  if (kind === 'tool_call') {
    return {
      type: 'tool_start',
      toolName: update.title || update.toolCallId || 'tool',
      toolCallId: update.toolCallId,
    };
  }
  if (kind === 'tool_call_update' && update.status === 'completed') {
    return {
      type: 'tool_complete',
      toolName: update.title || update.toolCallId || 'tool',
      toolCallId: update.toolCallId,
    };
  }
  return null;
}

export class AgentConnection {
  /**
   * @param {string} agentType Agent 类型（claude / codex）
   * @param {string} cwd 工作目录
   */
  constructor(agentType, cwd) {
    this.agentType = agentType;
    this.cwd = cwd;
    /** @type {import('node:child_process').ChildProcessWithoutNullStreams | null} */
    this.child = null;
    /** @type {import('./rpc.js').NdjsonRpc | null} */
    this.rpc = null;
    /** @type {string | null} */
    this.acpSessionId = null;
    this.ready = false;
    /** @type {Set<(ev: StreamEvent) => void>} */
    this._turnListeners = new Set();
  }

  /**
   * 拉起 Agent 子进程并完成 ACP initialize 握手。
   * @returns {Promise<void>}
   */
  async start() {
    if (this.ready) return;

    const profile = getAgentProfile(this.agentType);
    if (!existsSync(this.cwd)) {
      throw new Error(`工作目录不存在：${this.cwd}`);
    }

    const child = spawn(profile.command, profile.args, {
      cwd: this.cwd,
      env: buildAgentEnv(this.agentType),
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    this.child = child;

    // 诊断信息走 stderr，避免污染 stdout 上的 NDJSON 协议通道。
    child.stderr?.setEncoding('utf8');
    child.stderr?.on('data', (chunk) => {
      const line = String(chunk).trim();
      if (line) console.error(`[agent:${this.agentType}] ${line}`);
    });

    const rpc = createNdjsonRpc(child);
    this.rpc = rpc;

    rpc.onRequest = (method, params, id) => {
      handleHostRequest(method, params || {}, { cwd: this.cwd })
        .then((result) => rpc.respond(id, result))
        .catch((err) => {
          rpc.respondError(id, {
            code: -32000,
            message: err instanceof Error ? err.message : String(err),
          });
        });
    };

    rpc.onNotification = (method, params) => {
      if (method !== 'session/update') return;
      // 若已知当前 ACP session，则只转发匹配的更新。
      if (this.acpSessionId && params?.sessionId && params.sessionId !== this.acpSessionId) {
        return;
      }
      const mapped = mapSessionUpdate(params?.update);
      if (!mapped) return;
      for (const listener of this._turnListeners) listener(mapped);
    };

    rpc.onClose = (reason) => {
      this.ready = false;
      for (const listener of this._turnListeners) {
        listener({ type: 'error', text: `Agent 连接已关闭：${reason}` });
      }
    };

    await rpc.send('initialize', {
      protocolVersion: 1,
      clientCapabilities: {
        fs: { readTextFile: true, writeTextFile: true },
      },
      clientInfo: { name: 'acp-web-mvp', version: '0.1.0' },
    });

    this.ready = true;
  }

  /**
   * 在本连接的 cwd 上创建新的 ACP session。
   * @returns {Promise<string>} ACP sessionId
   */
  async createSession() {
    if (!this.rpc || !this.ready) throw new Error('Agent 连接尚未就绪');
    const result = await this.rpc.send('session/new', {
      cwd: this.cwd,
      mcpServers: [],
    });
    const sessionId = result?.sessionId;
    if (!sessionId || typeof sessionId !== 'string') {
      throw new Error('session/new 未返回 sessionId');
    }
    this.acpSessionId = sessionId;
    return sessionId;
  }

  /**
   * 跑一轮 prompt，通过 onEvent 流式输出规范化事件。
   * @param {string} text 用户输入
   * @param {(ev: StreamEvent) => void} onEvent 事件回调
   * @returns {Promise<{ stopReason: string, fullText: string }>}
   */
  async prompt(text, onEvent) {
    if (!this.rpc || !this.ready) throw new Error('Agent 连接尚未就绪');
    if (!this.acpSessionId) throw new Error('尚无 ACP session，请先 createSession');

    let fullText = '';
    /** @param {StreamEvent} ev */
    const listener = (ev) => {
      if (ev.type === 'text' && ev.text) fullText += ev.text;
      onEvent(ev);
    };
    this._turnListeners.add(listener);

    try {
      onEvent({ type: 'status', text: 'prompting' });
      const result = await this.rpc.send('session/prompt', {
        sessionId: this.acpSessionId,
        prompt: [{ type: 'text', text }],
      });
      const stopReason = String(result?.stopReason || 'end_turn');
      onEvent({ type: 'done', stopReason, text: fullText });
      return { stopReason, fullText };
    } finally {
      this._turnListeners.delete(listener);
    }
  }

  /**
   * 销毁子进程与 RPC。
   */
  dispose() {
    this.ready = false;
    this._turnListeners.clear();
    this.rpc?.destroy();
    this.rpc = null;
    this.child = null;
    this.acpSessionId = null;
  }
}
