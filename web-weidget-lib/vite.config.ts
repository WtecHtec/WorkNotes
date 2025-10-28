import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite'
import cssInjectedByJs from 'vite-plugin-css-injected-by-js';
import fs from 'fs';
import path, { join } from 'path';
import autoprefixer from 'autoprefixer';

const srcDir = path.resolve(__dirname, 'src/widget/');

const entry = process.env.ENTRY || 'filter-widget';




// 自动扫描 src 下每个组件目录，支持 .tsx 和 .jsx
const entries = Object.fromEntries(
  fs
    .readdirSync(srcDir)
    .filter((dir) => {
      const mainJsx = path.join(srcDir, dir, 'main.tsx');
      const mainJsxBackup = path.join(srcDir, dir, 'main.jsx');
      console.log(dir, entry);
      return fs.existsSync(mainJsx) || fs.existsSync(mainJsxBackup);
    })
    .filter((dir) => dir === entry)
    .map((dir) => {
      const mainTsx = path.join(srcDir, dir, 'main.tsx');
      const mainJsx = path.join(srcDir, dir, 'main.jsx');
      return [dir, fs.existsSync(mainTsx) ? mainTsx : mainJsx];
    })
);

export default defineConfig({
  resolve: {
    alias: {
      '@': join(__dirname, 'src'),
    },
  },
  plugins: [
    preact({
      jsx: {
        jsxImportSource: 'preact',
      },
    }),
    tailwindcss(),
    cssInjectedByJs(),
   
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    lib: {
      entry: entries,
      name: 'PreactWidgets',
      formats: ['iife'],
      fileName: (format, entryName) => `${entryName}/${entryName}.${format}.js`,
    },
    rollupOptions: {
      // CSS 内联插件会自动处理，不需要生成单独文件
    },
    outDir: 'dist',
    emptyOutDir: false,
  },
});
