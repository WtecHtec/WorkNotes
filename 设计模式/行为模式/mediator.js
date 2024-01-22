/**
 * 中介模式
 * “为对象构架出一个互动平台，通过减少对象间的依赖程度以达到解耦的目的”
 * 例如： 聊天室
 */

// 中介(聊天平台)
class ChatRoom {
	constructor() {
		this.userList = []
	}
	register(user) {
		this.userList.push(user)
		console.log(`${user.getName()}加入`)
	}

	sendMSG(formUser, msg) {
		this.userList.forEach(item => {
			item.listen(formUser, msg)
		})
	}
}
class User {
	constructor(name) {
		this.name = name
		this.chatRoom = null
	}
	getName() {
		return this.name
	}
	login(chatRoom) {
		this.chatRoom = chatRoom
		this.chatRoom.register(this)
	}
	talk(msg) {
		this.chatRoom.sendMSG(this, msg)
	}

	listen(formUser, msg) {
		console.log(`${this.getName()}收到：${formUser.getName()} 发送信息（${msg}）`)
	}
}

const chatRoom = new ChatRoom()

const u1 = new User('u1')
const u2 = new User('u2')
const u3 = new User('u3')

u1.login(chatRoom)
u2.login(chatRoom)

u1.talk('hello')