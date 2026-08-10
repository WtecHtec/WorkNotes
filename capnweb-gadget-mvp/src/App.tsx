import { useState } from 'react';
import { newWebSocketRpcSession } from 'capnweb';
import type { GadgetAPI } from './gadget.ts';
import './App.css';

interface LogItem {
  id: string;
  time: string;
  type: 'info' | 'success' | 'error';
  text: string;
}

const SERVER_URL = 'ws://localhost:3001';

function App() {
  const [connection, setConnection] = useState<{ gadget: GadgetAPI | null }>({ gadget: null });
  const [count, setCount] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [inputMsg, setInputMsg] = useState<string>('');
  const [showInput, setShowInput] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const addLog = (text: string, type: 'info' | 'success' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString();
    const id = Math.random().toString(36).substring(2, 9);
    setLogs(prev => [...prev.slice(-25), { id, time, type, text }]);
  };

  /**
   * 连接真实 Cap'n Web WebSocket 服务端
   */
  const connectToServer = async () => {
    try {
      setLoading(true);
      addLog(`正在连接 WebSocket 服务端 (${SERVER_URL})...`, 'info');

      const ws = new WebSocket(SERVER_URL);

      ws.onopen = () => {
        addLog('WebSocket 传输通道建立成功', 'success');
        setConnected(true);
      };

      ws.onerror = () => {
        addLog('WebSocket 连接错误，请确认服务端已启动 (npm run server)', 'error');
        setLoading(false);
      };

      ws.onclose = () => {
        addLog('WebSocket 连接已关闭', 'info');
        setConnected(false);
        setConnection({ gadget: null });
        setLoading(false);
      };

      // 使用 Cap'n Web 创建同步 RPC 会话存根
      const gadget = newWebSocketRpcSession<GadgetAPI>(ws);
      setConnection({ gadget });

      // 初始化数据调用
      const initialCount = await gadget.getCount();
      const initialMsg = await gadget.getMessage();

      setCount(initialCount);
      setMessage(initialMsg);
      setInputMsg(initialMsg);

      addLog(`✅ Cap'n Web RPC 会话建立完成，获取远程 Gadget 存根成功`, 'success');
      addLog(`初始状态读取 -> 计数: ${initialCount}, 消息: "${initialMsg}"`, 'info');
      setLoading(false);
    } catch (err: any) {
      addLog(`连接初始化失败: ${err?.message || err}`, 'error');
      setLoading(false);
    }
  };

  const increment = async (delta: number) => {
    const gadget = connection.gadget;
    if (!gadget) return;

    try {
      addLog(`[RPC 发送] increment(${delta})...`, 'info');
      const newCount = await gadget.increment(delta);
      setCount(newCount);
      addLog(`[RPC 返回] 递增成功 -> 当前计数: ${newCount}`, 'success');
    } catch (err: any) {
      addLog(`[RPC 错误] increment 失败: ${err?.message || err}`, 'error');
    }
  };

  const handleUpdateMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const gadget = connection.gadget;
    if (!gadget || !inputMsg.trim()) return;

    try {
      addLog(`[RPC 发送] setMessage("${inputMsg}")...`, 'info');
      await gadget.setMessage(inputMsg);
      const msg = await gadget.getMessage();
      setMessage(msg);
      setShowInput(false);
      addLog(`[RPC 返回] 消息更新成功 -> "${msg}"`, 'success');
    } catch (err: any) {
      addLog(`[RPC 错误] setMessage 失败: ${err?.message || err}`, 'error');
    }
  };

  const disconnect = () => {
    setConnection({ gadget: null });
    setCount(0);
    setMessage('');
    setConnected(false);
    addLog('客户端主动断开 RPC 会话', 'info');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="app-container animate-fade-in">
      {/* 头部 Section */}
      <header className="app-header">
        <div className="header-badge">
          <span>⚡ Cap'n Web RPC Engine</span>
        </div>
        <h1 className="header-title">Cap'n Web + Gadget MVP</h1>
        <p className="header-subtitle">
          React 客户端 <span className="tech-chip">Cap'n Web RPC</span> Node 零拷贝微应用存根
        </p>
      </header>

      {/* 连接状态条 */}
      <section className="glass-card">
        <div className="connection-bar">
          <div className="status-indicator">
            <div className={`status-dot ${connected ? 'connected' : 'disconnected'}`} />
            <div>
              <div className="status-text">
                {connected ? '已连接 Cap\'n Web 服务端' : '服务器未连接'}
              </div>
              <div className="server-url-badge">{SERVER_URL}</div>
            </div>
          </div>

          {!connected ? (
            <button
              onClick={connectToServer}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? '正在连接...' : '🔌 连接到服务端'}
            </button>
          ) : (
            <button onClick={disconnect} className="btn btn-danger">
              断开连接
            </button>
          )}
        </div>
      </section>

      {/* RPC 操作面板 */}
      {connected && (
        <section className="dashboard-grid animate-fade-in">
          {/* 计数器 Card */}
          <div className="glass-card metric-card">
            <div className="card-title">
              <span>📊 远程 Counter 状态</span>
            </div>
            <div className="counter-value">{count}</div>
            <div className="card-actions">
              <button onClick={() => increment(1)} className="btn btn-action-primary">
                +1 递增
              </button>
              <button onClick={() => increment(5)} className="btn btn-action">
                +5 批量
              </button>
              <button onClick={() => increment(-1)} className="btn btn-action">
                -1 递减
              </button>
            </div>
          </div>

          {/* 消息 Card */}
          <div className="glass-card metric-card">
            <div className="card-title">
              <span>💬 远程 Message 状态</span>
            </div>
            <div className="message-box">
              "{message || '无消息'}"
            </div>

            {!showInput ? (
              <div className="card-actions">
                <button onClick={() => setShowInput(true)} className="btn btn-action-primary">
                  ✏️ 修改消息
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateMessage} className="message-input-group">
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="请输入新消息..."
                  className="input-field"
                  autoFocus
                />
                <button type="submit" className="btn btn-action-primary btn-sm">
                  确认
                </button>
                <button
                  type="button"
                  onClick={() => setShowInput(false)}
                  className="btn btn-action btn-sm"
                >
                  取消
                </button>
              </form>
            )}
          </div>
        </section>
      )}

      {/* 实时 RPC 日志控制台 */}
      <section className="glass-card terminal-card">
        <div className="terminal-header">
          <div className="terminal-dots">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
          </div>
          <div className="terminal-title">
            <span>Terminal :: Cap'n Web RPC Activity Log</span>
          </div>
          {logs.length > 0 && (
            <button onClick={clearLogs} className="btn btn-action btn-sm">
              清空日志
            </button>
          )}
        </div>
        <div className="terminal-body">
          {logs.length === 0 ? (
            <div className="empty-logs">
              点击上方「连接到服务端」以观察 Cap'n Web RPC 实时调用...
            </div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="log-entry">
                <span className="log-time">[{log.time}]</span>
                <span className={`log-msg ${log.type}`}>{log.text}</span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 架构与启动说明 */}
      <section className="guide-section">
        <div className="guide-title">
          <span>🚀 架构逻辑与运行说明</span>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <div className="step-heading">后端服务 (Node.js)</div>
              <div className="step-desc">
                运行 <span className="code-chip">npm run server</span> 监听 <span className="code-chip">ws://localhost:3001</span>。使用 <span className="code-chip">RpcTarget</span> 提供存根。
              </div>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <div className="step-heading">前端 App (React + Vite)</div>
              <div className="step-desc">
                运行 <span className="code-chip">npm run dev</span>，通过 <span className="code-chip">newWebSocketRpcSession</span> 建立管道通信。
              </div>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <div className="step-heading">Cap'n Web RPC</div>
              <div className="step-desc">
                对象方法（如 <span className="code-chip">increment()</span>）直接在客户端存根上远程异步执行。
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
