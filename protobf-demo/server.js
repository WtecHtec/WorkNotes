// const axios = require('axios');
const express = require('express');
// const protobuf = require('protobufjs');
const protoRoot =  require('./proto/proto')
const cors = require('cors');

const app = express();

app.use(cors());

run().catch(err => console.log(err));

async function run() {
  // const root = await protobuf.load('./proto/user.proto');

  const doc = { name: 'Bill', age: 30 };
  const User = protoRoot.lookupType('userpackage.User');

  app.get('/user', function(req, res) {
    res.send(User.encode(doc).finish());
  });

  // 在decode之前需要用raw中间件处理一遍protobuf数据
  app.post('/user', express.raw({ type: '*/*' }), function(req, res) {
    // Assume `req.body` contains the protobuf as a utf8-encoded string
    const user = User.decode(Buffer.from(req.body));
    Object.assign(doc, user);
    res.end();
  });

  await app.listen(3000);
  console.log('服务启动： http://127.0.0.1:3000')
}
