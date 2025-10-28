// build.mjs
import { build } from 'vite';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = path.resolve(__dirname, 'src/widget/');

const entries = Object.fromEntries(
  fs
    .readdirSync(srcDir)
    .filter((dir) => {
      const mainJsx = path.join(srcDir, dir, 'main.tsx');
      const mainJsxBackup = path.join(srcDir, dir, 'main.jsx');
      return (
        fs.existsSync(mainJsx) ||
        (fs.existsSync(mainJsxBackup) && dir === entry)
      );
    })
    .map((dir) => {
      const mainTsx = path.join(srcDir, dir, 'main.tsx');
      const mainJsx = path.join(srcDir, dir, 'main.jsx');
      return [dir, fs.existsSync(mainTsx) ? mainTsx : mainJsx];
    })
);

for (const key in entries) {
  await build({
    build: {
      lib: {
        entry: resolve(__dirname, entries[key]),
        name: key.replace(/-([a-z])/g, (_, c) => c.toUpperCase()), // 全局变量名
        fileName: key,
        formats: ['iife'], // ✅ 每次只打一个入口
      },
      outDir: `dist/${key}`,
      emptyOutDir: false,
      rollupOptions: {
        output: {
          inlineDynamicImports: true, // 避免 chunk 拆分
        },
      },
    },
  });
}
