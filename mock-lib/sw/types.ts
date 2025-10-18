/* eslint-disable @typescript-eslint/no-explicit-any */
// 类型定义
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface MockedRequest {
  url: URL;
  method: string;
  headers: Record<string, string>;
  body?: any;
}

export interface MockedResponse {
  status?: number;
  headers?: Record<string, string>;
  body?: any;
}

export type ResponseResolver = (req: MockedRequest) => MockedResponse | Promise<MockedResponse>;

export interface RequestHandler {
  method: HttpMethod;
  path: string | RegExp;
  resolver: ResponseResolver;
}

// 序列化后的 handler（用于传递给 Service Worker）
export interface SerializedHandler {
  id: string;
  method: HttpMethod;
  path: string;
  isRegex: boolean;
}

// 请求处理器创建函数
export const http = {
  get: (path: string | RegExp, resolver: ResponseResolver): RequestHandler => ({
    method: 'GET',
    path,
    resolver,
  }),
  post: (path: string | RegExp, resolver: ResponseResolver): RequestHandler => ({
    method: 'POST',
    path,
    resolver,
  }),
  put: (path: string | RegExp, resolver: ResponseResolver): RequestHandler => ({
    method: 'PUT',
    path,
    resolver,
  }),
  delete: (path: string | RegExp, resolver: ResponseResolver): RequestHandler => ({
    method: 'DELETE',
    path,
    resolver,
  }),
  patch: (path: string | RegExp, resolver: ResponseResolver): RequestHandler => ({
    method: 'PATCH',
    path,
    resolver,
  }),
};