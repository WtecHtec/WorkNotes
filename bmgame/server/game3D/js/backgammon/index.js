function getQueryString(name) {
	var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');  //设置正则匹配规范
	var r = window.location.search.substr(1).match(reg);  // 获取“？”后的字符串并正则匹配
	if (r != null) {
		return decodeURIComponent(r[2]); // 解码参数部分
	}
	return null;
}

window.onload = ()=> {
	const roomId = getQueryString('room')
	const socket = io();
	new  BMGame(socket, roomId);
}	