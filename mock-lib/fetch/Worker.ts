/* eslint-disable @typescript-eslint/no-this-alias */
import { MockedRequest, MockedResponse, RequestHandler } from "./types";



class Worker {
    private handlers: RequestHandler[] = [];
    private isStarted: boolean = false;
    private originalFetch: typeof fetch;
  
    constructor(handlers: RequestHandler[]) {
      this.handlers = handlers;
      this.originalFetch = window.fetch;
    }
  
    // 启动 worker
    async start(): Promise<void> {
      if (this.isStarted) {
        console.warn('Worker is already started');
        return;
      }
  
      this.isStarted = true;
      this.interceptFetch();
      console.log('[MSW] Mocking enabled.');
    }
  
    // 停止 worker
    stop(): void {
      if (!this.isStarted) {
        return;
      }
  
      window.fetch = this.originalFetch;
      this.isStarted = false;
      console.log('[MSW] Mocking disabled.');
    }
  
    // 拦截 fetch
    private interceptFetch(): void {
      const self = this;
  
      window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
        const request = new Request(input, init);
        const url = new URL(request.url);
        const method = request.method.toUpperCase();
  
        // 查找匹配的 handler
        const handler = self.findHandler(method, url);
  
        if (handler) {
          console.log(`[MSW] ${method} ${url.pathname} (mocked)`);
  
          // 解析请求体
          let body;
          if (request.body) {
            const text = await request.text();
            try {
              body = JSON.parse(text);
            } catch {
              body = text;
            }
          }
  
          // 构造 MockedRequest
          const mockedRequest: MockedRequest = {
            url,
            method,
            headers: request.headers,
            body,
          };
  
          // 执行 resolver
          const mockedResponse = await handler.resolver(mockedRequest);
  
          // 构造 Response 对象
          return self.createResponse(mockedResponse);
        }
  
        // 没有匹配的 handler，发起真实请求
        return self.originalFetch(input, init);
      };
    }
  
    // 查找匹配的 handler
    private findHandler(method: string, url: URL): RequestHandler | undefined {
      return this.handlers.find(handler => {
        // 方法匹配
        if (handler.method !== method) {
          return false;
        }
  
        // 路径匹配
        if (typeof handler.path === 'string') {
          // 简单字符串匹配（支持路径参数）
          return this.matchPath(handler.path, url.pathname);
        } else {
          // 正则匹配
          return handler.path.test(url.pathname);
        }
      });
    }
  
    // 路径匹配（支持简单的路径参数）
    private matchPath(pattern: string, pathname: string): boolean {
      // 将 /users/:id 转换为正则
      const regexPattern = pattern
        .replace(/:[^/]+/g, '[^/]+')
        .replace(/\//g, '\\/');
      
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(pathname);
    }
  
    // 创建 Response 对象
    private createResponse(mockedResponse: MockedResponse): Response {
      const { status = 200, headers = {}, body } = mockedResponse;
  
      let responseBody: BodyInit | null = null;
      const responseHeaders = new Headers(headers);
  
      if (body !== undefined) {
        if (typeof body === 'object') {
          responseBody = JSON.stringify(body);
          if (!responseHeaders.has('Content-Type')) {
            responseHeaders.set('Content-Type', 'application/json');
          }
        } else {
          responseBody = String(body);
        }
      }
  
      return new Response(responseBody, {
        status,
        headers: responseHeaders,
      });
    }
  
    // 动态添加 handler
    use(...handlers: RequestHandler[]): void {
      this.handlers.push(...handlers);
    }
  
    // 重置 handlers
    resetHandlers(...handlers: RequestHandler[]): void {
      this.handlers = handlers;
    }
  }
  
  // setupWorker 函数
  export function setupWorker(...handlers: RequestHandler[]): Worker {
    return new Worker(handlers);
  }
  