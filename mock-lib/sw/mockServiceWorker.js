let handlers = [];
let messagePort = null;
const pendingRequests = new Map();

// 安装事件
self.addEventListener("install", (event) => {
  console.log("[MSW SW] Installing...");
  self.skipWaiting();
});

// 激活事件
self.addEventListener("activate", (event) => {
  console.log("[MSW SW] Activated");
  event.waitUntil(self.clients.claim());
});

// 接收来自主线程的消息
self.addEventListener("message", (event) => {
  const { type, payload } = event.data;

  if (type === "INIT_PORT") {
    messagePort = event.ports[0];
    console.log("[MSW SW] Message port established");

    // 监听来自主线程的响应
    messagePort.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === "RESPONSE") {
        handleResponseFromMainThread(payload);
      }
    };
  } else if (type === "SET_HANDLERS") {
    handlers = payload;
    console.log("[MSW SW] Handlers updated:", handlers.length);
  }
});

// 拦截 fetch 请求
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  const method = request.method;

  console.log("url:::", url);
  // 查找匹配的 handler
  const handler = findHandler(method, url.pathname, url.href);

  if (handler) {
    event.respondWith(handleMockedRequest(request, handler));
  }
  // 如果没有匹配的 handler，不做处理，让请求正常进行
});

// 查找匹配的 handler
function findHandler(method, pathname, href) {
  return handlers.find((handler) => {
    if (handler.method !== method) {
      return false;
    }

    if (handler.isRegex) {
      const regex = new RegExp(handler.path);
      return regex.test(pathname);
    } else if (href === handler.path) {
      return true;
    } else {
      return matchPath(handler.path, pathname);
    }
  });
}

// 路径匹配
function matchPath(pattern, pathname) {
  const regexPattern = pattern
    .replace(/:[^/]+/g, "[^/]+")
    .replace(/\//g, "\\/");

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(pathname);
}

// 处理被 mock 的请求
async function handleMockedRequest(request, handler) {
  const requestId = crypto.randomUUID();

  // 解析请求体
  let body = null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      const text = await request.text();
      body = text ? JSON.parse(text) : null;
    } catch {
      body = null;
    }
  }

  // 转换 headers
  const headers = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // 发送请求到主线程
  return new Promise((resolve) => {
    pendingRequests.set(requestId, resolve);

    messagePort.postMessage({
      type: "REQUEST",
      payload: {
        requestId,
        handlerId: handler.id,
        url: request.url,
        method: request.method,
        headers,
        body,
      },
    });
  });
}

// 处理来自主线程的响应
function handleResponseFromMainThread({ requestId, response }) {
  const resolve = pendingRequests.get(requestId);

  if (resolve) {
    if (response) {
      const { status = 200, headers = {}, body } = response;

      let responseBody = null;
      const responseHeaders = new Headers(headers);

      if (body !== undefined && body !== null) {
        if (typeof body === "object") {
          responseBody = JSON.stringify(body);
          if (!responseHeaders.has("Content-Type")) {
            responseHeaders.set("Content-Type", "application/json");
          }
        } else {
          responseBody = String(body);
        }
      }

      resolve(
        new Response(responseBody, {
          status,
          headers: responseHeaders,
        })
      );
    } else {
      // 没有响应，返回 404
      resolve(new Response(null, { status: 404 }));
    }

    pendingRequests.delete(requestId);
  }
}
