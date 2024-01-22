/**
 * 命令模式（map 记录操作，根据 key 作为寻址）
 * 
 * “将指令信息封装成一个对象，并将此对象作为参数发送给接收方去执行，
 * 以使命令的请求方与执行方解耦，双方只通过传递各种命令过象来完成任务”
 * 
 * 例如：操作电视剧
 */

class Command {
	exe() { }
	unexe() { }
}

class TV {
	constructor() { }
	on() {
		console.log('开机')
	}
	off() {
		console.log('关机')
	}

	volumeUp() {
		console.log('音量+')
	}

	volumeDown() {
		console.log('音量-')
	}
}

class TVOnCommand extends Command {
	constructor(tv) {
		super()
		this.tv = tv
	}
	exe() { this.tv.on() }
	unexe() { this.tv.off() }
}

class TVOffCommand extends Command {
	constructor(tv) {
		super()
		this.tv = tv
	}
	exe() { this.tv.off() }
	unexe() { this.tv.on() }
}


class TVVolumeUpCommand extends Command {
	constructor(tv) {
		super()
		this.tv = tv
	}
	exe() { this.tv.volumeUp() }
	unexe() { this.tv.volumeDown() }
}

class TVVolumeDownCommand extends Command {
	constructor(tv) {
		super()
		this.tv = tv
	}
	exe() { this.tv.volumeDown() }
	unexe() { this.tv.volumeUp() }
}

class Keyboard {
	constructor() {
		this.keyCommands = {}
	}
	bindKeyCommand(key, commands) {
		this.keyCommands[key] = [...commands]
	}
	onKeyPressed(key) {
		this.keyCommands[key].forEach(item => {
			item.exe()
		});
	}
}

const keyboard = new Keyboard()
const tv = new TV()
keyboard.bindKeyCommand('f1', [
	new TVOnCommand(tv),
	new TVVolumeUpCommand(tv),
	new TVVolumeUpCommand(tv),
	new TVVolumeUpCommand(tv),
	new TVVolumeUpCommand(tv),
])

keyboard.onKeyPressed('f1')