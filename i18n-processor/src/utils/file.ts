import { promises as fs } from 'fs';
import path from 'path';

export async function ensureOutputDir(outputPath: string): Promise<void> {
  try {
    // 确保目录存在，使用绝对路径
    const absolutePath = path.resolve(outputPath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

export async function ensureFileExists(filePath: string): Promise<void> {
  try {
    // 使用绝对路径
    const absolutePath = path.resolve(filePath);
    // 确保父目录存在
    await ensureOutputDir(absolutePath);
    // 检查文件是否存在
    await fs.access(absolutePath);
  } catch {
    // 文件不存在，创建空文件
    const absolutePath = path.resolve(filePath);
    await fs.writeFile(absolutePath, '', 'utf8');
  }
}



export async function isValidFile(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile() && /\.(js|jsx|ts|tsx)$/.test(filePath);
  } catch {
    return false;
  }
}

export async function getAllFiles(dirPath: string): Promise<string[]> {
  const files: string[] = [];

  async function traverse(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        await traverse(fullPath);
      } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  await traverse(dirPath);
  return files;
}