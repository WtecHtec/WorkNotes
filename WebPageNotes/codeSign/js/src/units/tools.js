function formatArrayToTree(data, idKey = 'domId', parentKey = 'parentId') {
  const result = []
  if(!Array.isArray(data)) {
      return result
  }
  data.forEach(item => {
      delete item.children;
  });
  const map = {};
  data.forEach(item => {
      map[item[idKey]] = item;
  });
  data.forEach(item => {
      const parent = map[item[parentKey]];
      if(parent) {
          (parent.children || (parent.children = [])).push(item);
      } else {
          result.push(item);
      }
  });
  return result;
}
/**
 * javascript处理HTML的Decode(解码)
 * @param {*} str 
 * @returns 
 */
function htmlDecodeByRegExp (str){  
  var s = "";
  if(!str || str.length == 0) return "";
  s = str.replace(/&amp;/g,"&");
  s = s.replace(/&lt;/g,"<");
  s = s.replace(/&gt;/g,">");
  s = s.replace(/&nbsp;/g," ");
  s = s.replace(/&#39;/g,"\'");
  s = s.replace(/&quot;/g,"\"");
  return s;  
}
