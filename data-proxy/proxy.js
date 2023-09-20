const http = require('http');
const zlib = require('zlib');
const { connect } = require('net');

/****************** 工具方法 ******************/
const getHostPort = (host, defaultPort) => {
  let port = defaultPort || 80;
  const index = host.indexOf(':');
  if (index !== -1) {
    port = host.substring(index + 1);
    host = host.substring(0, index);
  }
  return { host, port };
};

const getOptions = (req, defaultPort) => {
  // 这里假定 host 一定存在，完整实现参见 Whistle
  const { host, port } = getHostPort(req.headers.host, defaultPort);
  return {
    hostname: host, // 指定请求域名，用于通过 DNS 获取服务器 IP 及设置请求头 host 字段
    port, // 指定服务器端口
    path: req.url || '/',
    method: req.method,
    headers: req.headers,
    rejectUnauthorized: false, // 给 HTTPS 请求用的，HTTP 请求会自动忽略
  };
};

// 简单处理，出错直接断开，完整实现逻辑参考 Whistle
const handleClose = (req, res) => {
  const destroy = (err) => { // 及时关闭无用的连接，防止内存泄露
    req.destroy();
    res && res.destroy();
  };
  res && res.on('error', destroy);
  req.on('error', destroy);
  req.once('close', destroy);
};


/****************** 服务代码 ******************/
const server = http.createServer();
// 处理 HTTP 请求
server.on('request', (req, res) => {
  console.log('request')
  // 与服务端建立连接，透传客户端请求及服务端响应内容
  const client = http.request(getOptions(req), (svrRes) => {
    res.writeHead(svrRes.statusCode, svrRes.headers);
    console.log(`状态码: ${svrRes.statusCode}`)
    console.log(`请求头`, svrRes.headers)
    let html = ''
    // gzip 需要解压,不然数据乱码
    if (svrRes.headers['content-encoding'] == 'gzip') {
      const gzip = zlib.createGunzip();
      svrRes.pipe(gzip);
      output = gzip;
    } else {
      output = svrRes;
      svrRes.pipe(res);
    }
    output.on('data', (data) => {
      data = data.toString('utf-8');
      html += data;
    });
    output.on('end', () => {
      console.log(html);
    })
  });
  req.pipe(client);
  handleClose(res, client);
});

// 隧道代理：处理 HTTPS、HTTP2、WebSocket、TCP 等请求
server.on('connect', (req, socket) => {
  console.log('connect')
  // 与服务端建立连接，透传客户端请求及服务端响应内容
  const client = connect(getHostPort(req.url), () => {
    socket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    socket.pipe(client).pipe(socket);
  });
  handleClose(socket, client);
});

server.listen(8099);