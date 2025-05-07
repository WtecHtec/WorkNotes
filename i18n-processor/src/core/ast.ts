import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { ProcessResult } from './types';

export async function processWithAST(content: string): Promise<ProcessResult> {
  try {
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy'],
    });

    let hasModification = false;
    let needImportT = false;
    
    // 添加防递归标记
    const processedNodes = new WeakSet();

    traverse(ast, {
      StringLiteral(path) {
        // 检查节点是否已处理或者是t函数的参数
        if (processedNodes.has(path.node) || 
            path.parent.type === 'CallExpression' && 
            path.parent.callee.type === 'Identifier' && 
            path.parent.callee.name === 't') {
          return;
        }

        if (/[\u4e00-\u9fa5]/.test(path.node.value)) {
          hasModification = true;
          needImportT = true;
          const newNode = t.callExpression(
            t.identifier('t'),
            [t.stringLiteral(path.node.value)]
          );
          processedNodes.add(path.node);
          processedNodes.add(newNode);
          path.replaceWith(newNode);
        }
      },

      TemplateLiteral(path) {
        // 检查节点是否已处理或者是t函数的参数
        if (processedNodes.has(path.node) || 
            path.parent.type === 'CallExpression' && 
            path.parent.callee.type === 'Identifier' && 
            path.parent.callee.name === 't') {
          return;
        }

        const { expressions, quasis } = path.node;
        let hasChinese = false;
        
        quasis.forEach(quasi => {
          if (/[\u4e00-\u9fa5]/.test(quasi.value.raw)) {
            hasChinese = true;
          }
        });

        if (hasChinese) {
          hasModification = true;
          needImportT = true;

          const templateStr = quasis.map((quasi, i) => {
            return i === quasis.length - 1 
              ? quasi.value.raw 
              : quasi.value.raw + '{}';
          }).join('');

          const newNode = t.callExpression(
            t.identifier('t'),
            [
              t.stringLiteral(templateStr),
              t.arrayExpression(expressions as any)
            ]
          );
          processedNodes.add(path.node);
          processedNodes.add(newNode);
          path.replaceWith(newNode);
        }
      },

      JSXText(path) {
        // 检查节点是否已处理
        if (processedNodes.has(path.node) || 
            path.parent.type === 'JSXExpressionContainer' && 
            path.parent.expression.type === 'CallExpression' && 
            path.parent.expression.callee.type === 'Identifier' &&
            path.parent.expression.callee.name === 't') {
          return;
        }

        const text = path.node.value.trim();
        if (/[\u4e00-\u9fa5]/.test(text) && text.length > 0) {
          hasModification = true;
          needImportT = true;
          const callExpr = t.callExpression(
            t.identifier('t'),
            [t.stringLiteral(text)]
          );
          const newNode = t.jsxExpressionContainer(callExpr);
          processedNodes.add(path.node);
          processedNodes.add(newNode);
          processedNodes.add(callExpr);
          path.replaceWith(newNode);
        }
      },

      JSXAttribute(path) {
        if (
          path.node.value && 
          t.isStringLiteral(path.node.value) && 
          /[\u4e00-\u9fa5]/.test(path.node.value.value) &&
          !processedNodes.has(path.node.value)
        ) {
          hasModification = true;
          needImportT = true;
          
          const tCall = t.callExpression(
            t.identifier('t'),
            [t.stringLiteral(path.node.value.value)]
          );
          
          const newNode = t.jsxExpressionContainer(tCall);
          processedNodes.add(path.node.value);
          processedNodes.add(newNode);
          processedNodes.add(tCall);
          
          path.node.value = newNode;
        }
      }
    });

    if (hasModification && needImportT) {
      const importAst = parse(`import { t } from '@/i18n';`, {
        sourceType: 'module'
      });
      ast.program.body.unshift(importAst.program.body[0]);
    }

    return {
      code: generate(ast, { 
        retainLines: true, 
        compact: false,
        jsescOption: {
          minimal: true
        }
      }, content).code,
      hasModification
    };
  } catch (error) {
    console.error('AST 处理错误:', error);
    throw error;
  }
}