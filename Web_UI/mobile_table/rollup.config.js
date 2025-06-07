import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import pkg from './package.json';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      name: 'MobileTable'
    },
    {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: pkg.unpkg,
      format: 'umd',
      name: 'MobileTable'
    }
  ],
  external: (id) => {
    // 更严格的外部依赖检查
    return ['react', 'react-dom', '@nutui/nutui-react', '@nutui/icons-react', 'classnames'].includes(id) ||
           id.startsWith('react/') ||
           id.startsWith('react-dom/') ||
           id.startsWith('@nutui/');
  },
  plugins: [
    resolve({
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      preferBuiltins: false,
      dedupe: ['react', 'react-dom'],
      // 防止解析 peer dependencies
      skip: ['react', 'react-dom', '@nutui/nutui-react', '@nutui/icons-react']
    }),
    commonjs({
      include: /node_modules/,
      exclude: ['react', 'react-dom', '@nutui/nutui-react', '@nutui/icons-react'],
      requireReturnsDefault: 'auto',
      transformMixedEsModules: true
    }),
    postcss({
      inject: false,
      extract: 'index.css',  // 提取到独立的CSS文件
      modules: false
    }),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      rootDir: 'src'
    })
  ]
};