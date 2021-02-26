function deepCopy(obj) {
 	// 深度复制数组
 	if (Object.prototype.toString.call(obj) === "[object Array]") {
 		const object = [];
 		for (let i = 0; i < obj.length; i++) {
 			object.push(deepCopy(obj[i]))
 		}
 		return object
 	}
 	// 深度复制对象
 	if (Object.prototype.toString.call(obj) === "[object Object]") {
 		const object = {};
 		for (let p in obj) {
 			object[p] = obj[p]
 		}
 		return object
 	}
 }

 function treeToArray(treeObj) {
 	  var queen = [];
 	  var out = [];
 	  queen = queen.concat(treeObj);
 	  while(queen.length) {
 	      var first = queen.shift();
 	    if (first.components) {
 	        queen = queen.concat(first.components)
 	      delete first['components'];
 	    }
 	    
 	    out.push(first);
 	  }
 	  return out;
 }

 function dataToTree(data, itemId, parentId) {
 	// 删除 所有 children,以防止多次调用
 	data.forEach(function(item) {
 		delete item.components;
 	});
 	// 将数据存储为 以 id 为 KEY 的 map 索引数据列
 	var map = {};
 	data.forEach(function(item) {
 		map[item[itemId]] = item;
 	});

 	var val = [];
 	data.forEach(function(item) {
 		// 以当前遍历项，的pid,去map对象中找到索引的id
 		var parent = map[item[parentId]];
 		// 好绕啊，如果找到索引，那么说明此项不在顶级当中,那么需要把此项添加到，他对应的父级中
 		if (parent) {
 			(parent.components || (parent.components = [])).push(item);
 		} else {
 			//如果没有在map中找到对应的索引ID,那么直接把 当前的item添加到 val结果集中，作为顶级
 			val.push(item);
 		}
 	});
 	return val;
 }
