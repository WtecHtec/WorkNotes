/**
 * 子进程 stdin/stdout 上的最小 NDJSON-RPC 传输层。
 * 单一职责：帧编解码与请求 id 关联。
 */

/**
 * @typedef {{
 *   kind: 'local',
 *   send: (method: string, params?: Record<string, unknown>, timeoutMs?: number) => Promise<any>,
 *   respond: (id: number | string, result: unknown) => void,
 *   respondError: (id: number | string, error: { code: number, message: string }) => void,
 *   onNotification: ((method: string, params: any) => void) | null,
 *   onRequest: ((method: string, params: any, id: number | string) => void) | null,
 *   onClose: ((reason: string) => void) | null,
 *   destroy: () => void,
 * }} NdjsonRpc
 */

/**
 * 基于子进程标准输入输出创建 JSON-RPC 2.0 客户端。
 * 每行一个 JSON 对象（NDJSON），与 ACP 本地传输一致。
 *
 * @param {import('node:child_process').ChildProcessWithoutNullStreams} child
 * @returns {NdjsonRpc}
 */
export function createNdjsonRpc(child) {
  let nextId = 1;
  /** @type {Map<number, { resolve: (v: any) => void, reject: (e: Error) => void, timer?: NodeJS.Timeout }>} */
  const pending = new Map();
  let buffer = '';
  let destroyed = false;

  /** @type {NdjsonRpc} */
  const rpc = {
    kind: 'local',
    onNotification: null,
    onRequest: null,
    onClose: null,

    send(method, params = {}, timeoutMs) {
      if (destroyed) return Promise.reject(new Error('RPC 已销毁'));
      if (!child.stdin || child.stdin.destroyed) {
        return Promise.reject(new Error('Agent 标准输入不可写'));
      }

      const id = nextId++;
      const payload = JSON.stringify({ jsonrpc: '2.0', method, id, params }) + '\n';
      child.stdin.write(payload);

      return new Promise((resolve, reject) => {
        // session/prompt 可能很长；默认 0 表示不超时。
        const ms = timeoutMs ?? (method === 'session/prompt' ? 0 : 120_000);
        /** @type {{ resolve: (v: any) => void, reject: (e: Error) => void, timer?: NodeJS.Timeout }} */
        const entry = { resolve, reject };
        if (ms > 0) {
          entry.timer = setTimeout(() => {
            if (pending.has(id)) {
              pending.delete(id);
              reject(new Error(`ACP 超时：${method}`));
            }
          }, ms);
        }
        pending.set(id, entry);
      });
    },

    respond(id, result) {
      if (destroyed || !child.stdin || child.stdin.destroyed) return;
      child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
    },

    respondError(id, error) {
      if (destroyed || !child.stdin || child.stdin.destroyed) return;
      child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, error }) + '\n');
    },

    destroy() {
      if (destroyed) return;
      destroyed = true;
      for (const [, p] of pending) {
        if (p.timer) clearTimeout(p.timer);
        p.reject(new Error('RPC 已销毁'));
      }
      pending.clear();
      try {
        child.kill();
      } catch {
        /* 忽略 */
      }
    },
  };

  /**
   * 处理从 Agent 解码出的一条 JSON-RPC 消息。
   * @param {any} msg
   */
  function handleMessage(msg) {
    if (!msg || typeof msg !== 'object') return;

    // 反向请求：Agent → Client（带 method 与 id）
    if (msg.method && msg.id != null) {
      rpc.onRequest?.(msg.method, msg.params ?? {}, msg.id);
      return;
    }

    // 通知：Agent → Client（有 method，无 id）
    if (msg.method) {
      rpc.onNotification?.(msg.method, msg.params ?? {});
      return;
    }

    // 对我们发出请求的响应
    if (msg.id != null) {
      const entry = pending.get(msg.id);
      if (!entry) return;
      pending.delete(msg.id);
      if (entry.timer) clearTimeout(entry.timer);
      if (msg.error) {
        const errText =
          typeof msg.error === 'string'
            ? msg.error
            : msg.error.message || JSON.stringify(msg.error);
        entry.reject(new Error(errText));
      } else {
        entry.resolve(msg.result);
      }
    }
  }

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    buffer += chunk;
    let nl;
    while ((nl = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      try {
        handleMessage(JSON.parse(line));
      } catch {
        // 跳过 stdout 上的非 JSON 噪音（个别 Agent 会往 stdout 打日志）。
      }
    }
  });

  child.on('exit', (code, signal) => {
    const reason = `进程退出（code=${code}, signal=${signal}）`;
    for (const [, p] of pending) {
      if (p.timer) clearTimeout(p.timer);
      p.reject(new Error(reason));
    }
    pending.clear();
    rpc.onClose?.(reason);
  });

  return rpc;
}
