import type { Context } from '@cordisjs/core'
import { readFile } from 'node:fs/promises'

export const name = 'file-tool'
export const inject = ['logger', 'tools']

export interface ToolDefinition {
  name: string
  description: string
  parameters: Record<string, { type: string; required?: boolean }>
  execute(args: any): Promise<any> | any
}

export interface ToolsService {
  register?(tool: ToolDefinition): void
}

declare module '@cordisjs/core' {
  interface Context {
    tools?: ToolsService
  }
}

export function apply(ctx: Context) {
  const logger = ctx.logger

  // 注册一个简单工具（需要 tools 服务支持）
  if (ctx.tools) {
    ctx.tools.register?.({
      name: 'read_file',
      description: '读取文件内容',
      parameters: {
        path: { type: 'string', required: true }
      },
      async execute(args: { path: string }) {
        logger.info(`Reading file: ${args.path}`)
        const content = await readFile(args.path, 'utf-8')
        return content
      }
    })
  }
}
