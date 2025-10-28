export function getParams(path: string) {
  const [name, query] = path.split('?');
  // 指定 paramsFromPath 的类型
  const paramsFromPath: any = {};
  if (query) {
    query.split('&').forEach((item) => {
      const [key, value] = item.split('=');
      if (value) {
        // 约定value中第一个字符是包含@表示是数字类型
        paramsFromPath[key] = value.startsWith('@')
          ? Number(value.substring(1))
          : decodeURIComponent(value);
      }
    });
  }
  return {
    name,
    paramsFromPath,
  };
}

export function getSearchParams(key: string) {
  const { paramsFromPath } = getParams(window.location.href);
  return paramsFromPath?.[key];
}
