#!/usr/bin/env node
import { program } from 'commander';
import { processFile, processDirectory } from './core/processor';
import { ensureOutputDir } from './utils/file';

const { version } = require('../package.json');

program
  .version(version)
  .description('一个用于处理 React 项目国际化的命令行工具')
  .option('-d, --dir <directory>', '要处理的目录路径')
  .option('-f, --file <file>', '要处理的单个文件路径')
  .option('-o, --output <output>', '输出目录路径')
  .option('-m, --mode <mode>', '处理模式: ast 或 regex', 'ast')
  .option('-v, --verbose', '显示详细日志')
  .on('--help', () => {
    console.log('');
    console.log('示例:');
    console.log('  $ i18n-processor -f src/App.tsx -o dist/i18n');
    console.log('  $ i18n-processor -d src/pages -o dist/i18n -m regex');
    console.log('');
    console.log('支持的文件类型:');
    console.log('  .js, .jsx, .ts, .tsx');
  });

program.parse(process.argv);

const options = program.opts();

async function main() {
  try {
    if (!options.dir && !options.file) {
      console.error('错误: 请指定目录(-d) 或文件路径(-f)');
      process.exit(1);
    }

    if (options.mode !== 'ast' && options.mode !== 'regex') {
      console.error('错误: 处理模式必须是 "ast" 或 "regex"');
      process.exit(1);
    }

    if (options.output) {
      await ensureOutputDir(options.output);
    }

    if (options.file) {
      await processFile(options.file, options as any);
    }

    if (options.dir) {
      await processDirectory(options.dir, options as any);
    }

  } catch (error) {
    console.error('处理过程中发生错误:', error);
    process.exit(1);
  }
}

main();