/**
 * Cap'n Web + Gadget 真实 WebSocket 服务端
 * 使用 Node + TypeScript + ws
 */

import { WebSocketServer } from 'ws';
import { newWebSocketRpcSession } from 'capnweb';
import { SimpleGadget } from './src/gadget.ts';

const PORT = 3001;

const wss = new WebSocketServer({ port: PORT });

console.log(`[Cap'n Web Server] 正在监听 ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
  console.log('[Cap\'n Web Server] 客户端已连接');

  // 创建 Gadget 实例（每个连接一个独立实例，模拟私有 Gadget）
  const gadget = new SimpleGadget();

  // 使用 Cap'n Web 创建 RPC 会话
  // 注意：newWebSocketRpcSession 接受 WebSocket 实例
  newWebSocketRpcSession(ws as any, gadget);

  ws.on('close', () => {
    console.log('[Cap\'n Web Server] 客户端已断开');
  });
});
