/**
 * ACP Client 侧宿主能力。
 * 处理 Agent 的反向请求（权限、文件系统、终端）。
 * 不负责 RPC 连接本身的生命周期。
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

/** @type {Map<string, { child: import('node:child_process').ChildProcess, output: string, done: boolean, exitCode: number | null, waiters: Array<(info: { exitCode: number | null }) => void> }>} */
const terminals = new Map();
let nextTerminalId = 1;

/**
 * 从权限请求选项里挑一个「允许」项（MVP 自动批准）。
 * @param {any} params
 * @returns {string}
 */
function pickAllowOptionId(params) {
  const options = Array.isArray(params?.options) ? params.options : [];
  const allow = options.find(
    (o) =>
      o?.kind === 'allow_once' ||
      o?.kind === 'allow_always' ||
      /allow/i.test(String(o?.optionId || '')) ||
      /allow/i.test(String(o?.name || '')),
  );
  if (allow?.optionId) return allow.optionId;
  if (options[0]?.optionId) return options[0].optionId;
  return 'allow_once';
}

/**
 * 分发 Agent 的一条反向请求，返回 JSON-RPC result。
 * @param {string} method
 * @param {Record<string, unknown>} params
 * @param {{ cwd: string }} ctx
 * @returns {Promise<unknown>}
 */
export async function handleHostRequest(method, params, ctx) {
  switch (method) {
    case 'session/request_permission':
      return {
        outcome: {
          outcome: 'selected',
          optionId: pickAllowOptionId(params),
        },
      };

    case 'fs/read_text_file': {
      const filePath = String(params.path || '');
      const content = await fs.readFile(filePath, 'utf8');
      return { content };
    }

    case 'fs/write_text_file': {
      const filePath = String(params.path || '');
      const content = String(params.content ?? '');
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content, 'utf8');
      return {};
    }

    case 'terminal/create': {
      const id = `term-${nextTerminalId++}`;
      const command = String(params.command ?? (process.platform === 'win32' ? 'cmd' : 'bash'));
      const args = Array.isArray(params.args) ? params.args.map(String) : [];
      const termCwd = String(params.cwd || ctx.cwd || process.cwd());

      const child = spawn(command, args, {
        cwd: termCwd,
        env: process.env,
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      const state = {
        child,
        output: '',
        done: false,
        exitCode: /** @type {number | null} */ (null),
        waiters: /** @type {Array<(info: { exitCode: number | null }) => void>} */ ([]),
      };

      const append = (buf) => {
        state.output += buf.toString();
        if (state.output.length > 100_000) {
          state.output = state.output.slice(-100_000);
        }
      };
      child.stdout?.on('data', append);
      child.stderr?.on('data', append);
      child.on('exit', (code) => {
        state.done = true;
        state.exitCode = code;
        for (const w of state.waiters) w({ exitCode: code });
        state.waiters = [];
        // 结束后延迟清理，避免立刻被二次查询打空。
        setTimeout(() => terminals.delete(id), 5 * 60_000);
      });

      terminals.set(id, state);
      return { terminalId: id };
    }

    case 'terminal/output': {
      const id = String(params.terminalId || '');
      const t = terminals.get(id);
      if (!t) return { output: '', done: true, exitCode: -1 };
      const output = t.output;
      t.output = '';
      return { output, done: t.done, exitCode: t.exitCode };
    }

    case 'terminal/wait_for_exit': {
      const id = String(params.terminalId || '');
      const t = terminals.get(id);
      if (!t) return { exitCode: -1 };
      if (t.done) return { exitCode: t.exitCode };
      return new Promise((resolve) => {
        t.waiters.push(({ exitCode }) => resolve({ exitCode }));
      });
    }

    case 'terminal/kill': {
      const id = String(params.terminalId || '');
      const t = terminals.get(id);
      if (t && !t.done) {
        try {
          t.child.kill();
        } catch {
          /* 忽略 */
        }
      }
      return {};
    }

    case 'terminal/release': {
      const id = String(params.terminalId || '');
      const t = terminals.get(id);
      if (t) {
        try {
          if (!t.done) t.child.kill();
        } catch {
          /* 忽略 */
        }
        terminals.delete(id);
      }
      return {};
    }

    default:
      // 未知反向方法：回空结果，避免 Agent 一直等。
      return {};
  }
}
