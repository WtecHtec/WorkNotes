/* eslint-disable @typescript-eslint/no-explicit-any */
import { MockedRequest, MockedResponse, RequestHandler, ResponseResolver, SerializedHandler } from "./types";

class Worker {
    private handlers: RequestHandler[] = [];
    private handlerMap: Map<string, ResponseResolver> = new Map();
    private registration?: ServiceWorkerRegistration;
    private messageChannel?: MessageChannel;
  
    constructor(handlers: RequestHandler[]) {
      this.handlers = handlers;
      this.setupMessageListener();
    }
  
    // 启动 worker
    async start(options?: { serviceWorker?: { url?: string } }): Promise<void> {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker is not supported in this browser');
      }
  
      const serviceWorkerUrl = options?.serviceWorker?.url || './mockServiceWorker.js';
  
      try {
        // 注册 Service Worker
        this.registration = await navigator.serviceWorker.register(serviceWorkerUrl, {
          scope: '/',
        });
  
        console.log('[MSW] Service Worker registered');
  
        // 等待 Service Worker 激活
        await this.waitForActivation();
  
        // 建立消息通道
        this.setupMessageChannel();
  
        // 发送 handlers 配置到 Service Worker
        this.sendHandlersToServiceWorker();
  
        console.log('[MSW] Mocking enabled.');
      } catch (error) {
        console.error('[MSW] Failed to register Service Worker:', error);
        throw error;
      }
    }
  
    // 等待 Service Worker 激活
    private async waitForActivation(): Promise<void> {
      if (!this.registration) return;
  
      const sw = this.registration.installing || this.registration.waiting || this.registration.active;
      
      if (sw?.state === 'activated') {
        return;
      }
  
      return new Promise((resolve) => {
        sw?.addEventListener('statechange', (e) => {
          if ((e.target as ServiceWorker).state === 'activated') {
            resolve();
          }
        });
      });
    }
  
    // 建立消息通道
    private setupMessageChannel(): void {
      this.messageChannel = new MessageChannel();
      
      // 监听来自 Service Worker 的消息
      this.messageChannel.port1.onmessage = async (event) => {
        const { type, payload } = event.data;
        console.log("Service Worker::", event.data )
        if (type === 'REQUEST') {
          await this.handleRequestFromServiceWorker(payload);
        }
      };
  
      // 发送端口给 Service Worker
      navigator.serviceWorker.controller?.postMessage(
        { type: 'INIT_PORT' },
        [this.messageChannel.port2]
      );
    }
  
    // 处理来自 Service Worker 的请求
    private async handleRequestFromServiceWorker(payload: any): Promise<void> {
      const { requestId, url, method, headers, body } = payload;
  
      // 查找对应的 resolver
      const resolver = this.handlerMap.get(payload.handlerId);
  
      if (!resolver) {
        this.sendResponseToServiceWorker(requestId, null);
        return;
      }
  
      try {
        // 构造请求对象
        const request: MockedRequest = {
          url: new URL(url),
          method,
          headers,
          body,
        };
  
        // 执行 resolver
        const response = await resolver(request);
  
        // 发送响应回 Service Worker
        this.sendResponseToServiceWorker(requestId, response);
      } catch (error) {
        console.error('[MSW] Error in handler:', error);
        this.sendResponseToServiceWorker(requestId, null);
      }
    }
  
    // 发送响应到 Service Worker
    private sendResponseToServiceWorker(requestId: string, response: MockedResponse | null): void {
      this.messageChannel?.port1.postMessage({
        type: 'RESPONSE',
        payload: { requestId, response },
      });
    }
  
    // 发送 handlers 配置到 Service Worker
    private sendHandlersToServiceWorker(): void {
      const serializedHandlers: SerializedHandler[] = this.handlers.map((handler, index) => {
        const id = `handler-${index}`;
        this.handlerMap.set(id, handler.resolver);
  
        return {
          id,
          method: handler.method,
          path: handler.path instanceof RegExp ? handler.path.source : handler.path,
          isRegex: handler.path instanceof RegExp,
        };
      });
  
      navigator.serviceWorker.controller?.postMessage({
        type: 'SET_HANDLERS',
        payload: serializedHandlers,
      });
    }
  
    // 监听消息
    private setupMessageListener(): void {
      // 预留用于其他消息类型
    }
  
    // 停止 worker
    async stop(): Promise<void> {
      if (this.registration) {
        await this.registration.unregister();
        console.log('[MSW] Mocking disabled.');
      }
    }
  
    // 动态添加 handler
    use(...handlers: RequestHandler[]): void {
      this.handlers.push(...handlers);
      if (this.messageChannel) {
        this.sendHandlersToServiceWorker();
      }
    }
  
    // 重置 handlers
    resetHandlers(...handlers: RequestHandler[]): void {
      this.handlers = handlers;
      this.handlerMap.clear();
      if (this.messageChannel) {
        this.sendHandlersToServiceWorker();
      }
    }
  }
  
  // setupWorker 函数
  export function setupWorker(...handlers: RequestHandler[]): Worker {
    return new Worker(handlers);
  }