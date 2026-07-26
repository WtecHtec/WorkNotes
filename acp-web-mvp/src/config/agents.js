/**
 * Agent 注册表：只描述如何启动各 ACP Agent。
 * 不负责进程生命周期，也不处理 HTTP。
 */

import path from 'node:path';

/** @typedef {'claude' | 'codex'} AgentType */

/**
 * 内置 Agent 启动配置。
 * command/args 风格与 agents-chat 的 ACP 适配器一致。
 */
const AGENT_PROFILES = {
  claude: {
    id: 'claude',
    label: 'Claude Code (ACP)',
    command: 'npx',
    args: ['-y', '@agentclientprotocol/claude-agent-acp@latest'],
  },
  codex: {
    id: 'codex',
    label: 'Codex (ACP)',
    command: 'npx',
    // 默认使用已发布的 codex-acp；可用环境变量 CODEX_ACP_PACKAGE 覆盖。
    args: ['-y', process.env.CODEX_ACP_PACKAGE || '@zed-industries/codex-acp@latest'],
  },
};

/**
 * 列出前端可选的 Agent。
 * @returns {{ id: string, label: string }[]}
 */
export function listAgentOptions() {
  return Object.values(AGENT_PROFILES).map(({ id, label }) => ({ id, label }));
}

/**
 * 按类型解析启动配置。
 * @param {string} agentType
 * @returns {{ id: string, label: string, command: string, args: string[] }}
 */
export function getAgentProfile(agentType) {
  const profile = AGENT_PROFILES[agentType];
  if (!profile) {
    const known = Object.keys(AGENT_PROFILES).join(', ');
    throw new Error(`未知 Agent「${agentType}」。可选：${known}`);
  }
  return { ...profile, args: [...profile.args] };
}

/**
 * 解析会话工作目录。
 * @param {string | undefined} cwdFromClient 前端传入的路径
 * @returns {string} 绝对路径
 */
export function resolveSessionCwd(cwdFromClient) {
  const raw = (cwdFromClient || process.env.ACP_CWD || process.cwd()).trim();
  return path.resolve(raw);
}

/**
 * 合并进 Agent 子进程的环境变量。
 * 密钥放在环境变量里，不写死在注册表中。
 * @param {AgentType | string} agentType
 * @returns {NodeJS.ProcessEnv}
 */
export function buildAgentEnv(agentType) {
  const env = { ...process.env };
  if (agentType === 'claude' && process.env.ANTHROPIC_API_KEY) {
    env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  }
  if (agentType === 'codex' && process.env.OPENAI_API_KEY) {
    env.OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  }
  return env;
}
