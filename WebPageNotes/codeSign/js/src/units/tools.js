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