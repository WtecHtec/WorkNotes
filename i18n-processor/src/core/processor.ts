import { processWithAST } from './ast';
import { promises as fs } from 'fs';
import path from 'path';
import { ProcessOptions } from './types';
import { ensureOutputDir, isValidFile, getAllFiles, ensureFileExists } from '../utils/file';

export async function processFile(filePath: string, options: ProcessOptions) {
  try {
    if (!await isValidFile(filePath)) {
      throw new Error(`无效的文件: ${filePath}`);
    }
    console.log("处理文件中:::")
    const content = await fs.readFile(filePath, 'utf8');
    const processor = options.mode === 'ast' ? processWithAST : processWithAST;
    
    const result = await processor(content);
    const outputPath = options.output 
    ? path.join(options.output, path.relative(process.cwd(), filePath))
    : filePath;
    if (result.hasModification) {
      // 确保输出目录存在
      await ensureOutputDir(path.dirname(outputPath));
       // 确保输出文件存在
      await ensureFileExists(outputPath);
      // 写入文件
      await fs.writeFile(outputPath, result.code, 'utf8');
      console.log(`已处理文件: ${outputPath}`);
    } else {
      console.log(`文件没有内容可修改.`);
    }
  } catch (error) {
    console.error(`处理文件 ${filePath} 时出错:`, error);
    throw error;
  }
}

export async function processDirectory(dirPath: string, options: ProcessOptions) {
  try {
    const files = await getAllFiles(dirPath);
    
    for (const file of files) {
      await processFile(file, options);
    }
  } catch (error) {
    console.error(`处理目录 ${dirPath} 时出错:`, error);
    throw error;
  }
}