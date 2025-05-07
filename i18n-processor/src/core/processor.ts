import { processWithAST } from './ast';
import { processWithRegex } from './regex';
import { promises as fs } from 'fs';
import path from 'path';
import { ProcessOptions } from './types';
import { ensureOutputDir, isValidFile, getAllFiles, ensureFileExists } from '../utils/file';

export async function processFile(filePath: string, options: ProcessOptions) {
  try {
    if (!await isValidFile(filePath)) {
      throw new Error(`无效的文件: ${filePath}`);
    }

    const content = await fs.readFile(filePath, 'utf8');
    const processor = options.mode === 'ast' ? processWithAST : processWithRegex;
    
    const result = await processor(content);
    
    if (result.hasModification) {
      const outputPath = options.output 
        ? path.join(options.output, path.relative(process.cwd(), filePath))
        : filePath;
        console.log("outputPath:::", outputPath, path.dirname(outputPath))
      await ensureOutputDir(path.dirname(outputPath));
       // 确保输出文件存在
      await ensureFileExists(outputPath);

      await fs.writeFile(outputPath, result.code, 'utf8');
      
      if (options.verbose) {
        console.log(`已处理文件: ${outputPath}`);
      }
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