import { ProcessResult } from './types';

export async function processWithRegex(content: string): Promise<ProcessResult> {
  let modifiedContent = content;
  let needImportT = false;

  // 检查是否已经引入了 t 函数
  const hasImportT = content.includes('import { t }') || content.includes('const { t }');

  // 处理包含变量的模板字符串
  modifiedContent = modifiedContent.replace(/([^'"`]*[\u4e00-\u9fa5]+[^'"`]*\{[^}]+\}[^'"`]*)/g, (match, p1) => {
    if (/[\u4e00-\u9fa5]/.test(p1)) {
      needImportT = true;
      const variables: any = [];
      const processedText = p1.replace(/\{([^}]+)\}/g, (m: any, variable: any) => {
        variables.push(variable.trim());
        return '{}';
      });
      return `t('${processedText}', [${variables.join(', ')}])`;
    }
    return match;
  });

  // 处理 JSX 中的中文文本
  modifiedContent = modifiedContent.replace(/>([\s]*[\u4e00-\u9fa5]+[^<]*)</g, (match, p1) => {
    if (/[\u4e00-\u9fa5]/.test(p1)) {
      needImportT = true;
      return `>{t('${p1.trim()}')}<`;
    }
    return match;
  });

  // 处理字符串中的中文文本
  modifiedContent = modifiedContent.replace(/(['"])((?:(?!\1)[^\\]|\\.)*[\u4e00-\u9fa5]+(?:(?!\1)[^\\]|\\.)*)\1/g, (match, quote, content) => {
    if (/[\u4e00-\u9fa5]/.test(content)) {
      needImportT = true;
      return `t(${quote}${content}${quote})`;
    }
    return match;
  });

  if (needImportT && !hasImportT) {
    modifiedContent = `import { t } from '@/i18n';\n${modifiedContent}`;
  }

  return {
    code: modifiedContent,
    hasModification: needImportT
  };
}