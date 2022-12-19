const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { v4: uuidv4 } = require('uuid');
const path = require('path')

const USERS = ['Tang', 'Ming']
const PIECES = ['w', 'b']
const CODE_STATUS = {
  INIT: 0, // 创建房间，等待人进入
  RUNNING: 1, // 游戏执行
}
const PIECE_DATA = [];

const roomInfos = {}

app.use(express.static(path.resolve(__dirname, "./game")));// 先搜索这个文件夹

// app.get('/:room', (req, res) => {
//   res.sendFile(`${__dirname}/index.html`);
// });

/**
 * 创建房间，返回房间ID,分享好友参与游戏
 * @param {*} room 
 */
function createRoom(room) {
  io.to(room).emit('msg', {
    type: 'system',
    data: {
      code: CODE_STATUS.INIT,
      data: {
        room,
        player: USERS[0],
        share: `http://127.0.0.1:3000/index.html?room=${room}`
      },
    },
  })
}


function joinRoom(room, id) {
  io.to(id).emit('msg', {
    type: 'system',
    data: {
      code: CODE_STATUS.INIT,
      data: {
        room,
        player: USERS[1],
      },
    },
  }, () => {
    const fastPyer = Math.round(Math.random());
    roomInfos[room].current = USERS[fastPyer] 
    const players = {
      [USERS[fastPyer]]: PIECES[fastPyer],
      [USERS[1 - fastPyer]]: PIECES[1 - fastPyer]
    }
    roomInfos[room].players = players;
    io.to(room).emit('msg', {
      type: 'system',
      data: {
        code: CODE_STATUS.RUNNING,
        data: {
          room,
          players,
          faster: USERS[fastPyer],
        },
      },
    });
  })
}

io.on('connection', (socket) => {
  socket.on('game', (room) => {
    if (roomInfos[room] && roomInfos[room].users.length === 2) {
      return;
    }
    if (room && roomInfos[room]) {
      socket.join(room)
      joinRoom(room, socket.id)
      roomInfos[room].users.push(socket.id)
    } else {
      // 创建房间
      room = uuidv4()
      socket.join(room)
      createRoom(room)
      roomInfos[room] = {
        users: [socket.id],
        pieces: [...PIECE_DATA],
        current: null,
        state: 'init',
        players: {},
      }
    }
  });
});


server.listen(3000, () => {
  console.log('listening on *:3000');
});