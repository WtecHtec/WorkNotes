import fs from 'fs';
import path from 'path';
import os from 'os';
import { configManager } from '../config';

const DEFAULT_PROMPT_DIR = path.join(os.homedir(), '.dd', 'prompts');

export const DEFAULT_REPORT_PROMPT = `
你是一名专业的周报助手，请根据以下 Git 提交记录生成一份高质量的周报。

用户：{{user}}
时间范围：{{from}} 至 {{to}}

以下是本周期提交记录：
{{commits}}

请将输出内容格式化为 **Markdown**，并包含以下部分：

1. **工作总结（Summary）**  
   - 用 2-4 句话概述本周的主要工作、进展情况和整体方向。

2. **关键成果（Key Achievements）**  
   - 用项目符号列出本周完成的主要任务、修复内容、功能优化或可量化成果。

3. **技术细节（Technical Details）**  
   - 简述与代码相关的技术实现、重构、性能优化、架构调整等内容。

严格要求：  
- 全部内容请用中文撰写。  
- 不要逐条重复 commit 内容，而是提炼核心要点。  
- 输出风格保持简洁、专业、自然。
`;

export const DEFAULT_REVIEW_PROMPT = `
你是一名资深架构师，请对以下 Diff 代码进行严格的 Code Review。

Diff 内容：
{{diff}}

请从以下角度逐项分析，并给出清晰、可落地的优化建议：

### 1. 潜在缺陷（Potential Bugs）
- 逻辑判断是否正确？
- 是否存在未处理的异常或边界情况？
- 是否有空指针、类型错误、时间序列错误？

### 2. 代码质量（Code Style & Best Practices）
- 变量命名、函数长度、模块职责是否合适？
- 是否符合所在语言/框架的最佳实践？
- 是否存在重复代码可抽象？

### 3. 性能与可扩展性（Performance & Scalability）
- 是否存在低效算法或多余开销？
- 是否可做缓存、延迟加载、拆分模块？

### 4. 安全风险（Security Considerations）
- 是否存在注入风险？
- 是否处理敏感数据？
- 是否暴露内部结构、路径、配置？

### 5. 额外建议（Optional）
- 对未来维护是否友好？
- 是否符合架构设计原则？

请将最终输出以 **中文**、结构化 Markdown 格式呈现。
`;

export class PromptManager {
    static getPromptPath(name: string): string {
        const config = configManager.get();
        if (config.prompts && (config.prompts as any)[name]) {
            return (config.prompts as any)[name];
        }
        return path.join(DEFAULT_PROMPT_DIR, `${name}.md`);
    }

    static async load(name: string, defaultContent: string): Promise<string> {
        const promptPath = this.getPromptPath(name);

        if (fs.existsSync(promptPath)) {
            return fs.readFileSync(promptPath, 'utf-8');
        }

        return defaultContent;
    }

    static async initDefaults() {
        if (!fs.existsSync(DEFAULT_PROMPT_DIR)) {
            fs.mkdirSync(DEFAULT_PROMPT_DIR, { recursive: true });
        }

        const reportPath = path.join(DEFAULT_PROMPT_DIR, 'report.md');
        if (!fs.existsSync(reportPath)) {
            fs.writeFileSync(reportPath, DEFAULT_REPORT_PROMPT.trim());
            console.log(`Created default report prompt at ${reportPath}`);
        }

        const reviewPath = path.join(DEFAULT_PROMPT_DIR, 'review.md');
        if (!fs.existsSync(reviewPath)) {
            fs.writeFileSync(reviewPath, DEFAULT_REVIEW_PROMPT.trim());
            console.log(`Created default review prompt at ${reviewPath}`);
        }
    }
}
