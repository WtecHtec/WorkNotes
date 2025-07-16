// vite-plugin-regexp-patch.ts
import { Plugin } from "vite";

export default function regexpPatchPlugin(): Plugin {
  return {
    name: "patch-problematic-regexp",
    enforce: "pre",

    transform(code, id) {
      // 限定只处理某个库，比如 flexvars

      if (!id.includes("node_modules/@voerkai18n/runtime")) return;

      const regexpConstructPattern = /var\s+(\w+)\s*=\s*new\s+RegExp\(\s*"([^"]+)"\s*,\s*"gm"\s*\);?/g;

      const matches = [...code.matchAll(regexpConstructPattern)];

      let modifiedCode = code;

      for (const match of matches) {
        const [fullMatch, varName, regexpStr] = match;

        // 只处理包含 lookbehind 的那条正则
        if (!regexpStr.includes("(?<")) continue;

        const fallbackLiteral = `/(^|[^\\\\])\\{([\\S]+\\s)?\\s*(\\w+)?((\\s*\\|\\s*\\w*(\\(.*?\\)){0,1}\\s*)*)\\s*(\\s[\\S]+)?\\}/gm`;

        const tryCatchCode = `
          var ${varName};
          try {
            ${varName} = new RegExp("${regexpStr}", "gm");
          } catch (e) {
          console.log("无法使用 lookbehind")
            ${varName} = ${fallbackLiteral};
          }`.trim();

        // 替换整句
        modifiedCode = modifiedCode.replace(fullMatch, tryCatchCode);
        // console.log(`[vite-plugin-regexp-patch] patched ${varName} in ${id}`);
      }

      // console.log(`[patch-problematic-regexp] patched regex in: ${id}`);
      return {
        code: modifiedCode,
        map: null,
      };
    },
  };
}
