const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { v4: uuidv4 } = require('uuid');
const path = require('path')
const Piece = require('./piece')

const USERS = ['Tang', 'Ming']
const PIECES = ['w', 'b']
const CODE_STATUS = {
  INIT: -1, // 创建房间，等待人进入
	JOIN: 0, // 加入游戏
  RUNNING: 1, // 游戏执行,
	BATTE: 2, // 对弈ing
	END: 3,
	ERROR: 404,
}


const roomInfos = {}


app.use(express.static(path.resolve(__dirname, "./game3D")));
app.use(express.static(path.resolve(__dirname, "game")));

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
        share: `http://127.0.0.1:3000/backgammon.html?room=${room}`
      },
    },
  })
}


function joinRoom(room, id) {
  io.to(id).emit('msg', {
    type: 'system',
    data: {
      code: CODE_STATUS.JOIN,
      data: {
        room,
        player: USERS[1],
      },
    },
  }, () => {
    const fastPyer = Math.round(Math.random());
    roomInfos[room].current = USERS[fastPyer]
		roomInfos[room].users.push(id)
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
					pieces: roomInfos[room].piece.pieces,
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
    } else {
      // 创建房间
      room = uuidv4()
      socket.join(room)
      createRoom(room)
      roomInfos[room] = {
        users: [socket.id],
        piece: new Piece(),
        current: null,
        state: 'init',
        players: {},
      }
    }
  });

	socket.on('battle', ({roomId, position, player}) => {
		const { name, pieceType } = player || {};
		if (roomInfos[roomId] 
			&& position 
			&& roomInfos[roomId].players[name]
			&& roomInfos[roomId].players[name] === pieceType) {
			const { x, z} = position
			const st = roomInfos[roomId].piece.setPices(x, z, pieceType)
			if (!st) return;
			const isWin = roomInfos[roomId].piece.isWin(x, z, pieceType)
			socket.to(roomId).emit('msg', {
				type: 'battle',
				data: {
					code: CODE_STATUS.RUNNING,
					data: {
						position,
						current: name,
						pieceType: pieceType,
						pieces: roomInfos[roomId].piece.pieces,
					},
				},
			}, () => {
				if (isWin || roomInfos[roomId].piece.isFinsh()) {
					io.to(roomId).emit('msg', {
						type: 'system',
						data: {
							code: CODE_STATUS.END,
							data: {
								winor: isWin ?  name : '',
							}
						}
					})
				}

			})
		} else {
			io.to('msg', {
				type: 'system',
				data: {
					code: CODE_STATUS.ERROR
				}
			})
		}
	})

});


server.listen(3000, () => {
  console.log('listening on *:3000');
});