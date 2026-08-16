import type { Context } from '@cordisjs/core'

export const name = 'tools-mock'

declare module '@cordisjs/core' {
  interface Context {
    tools: {
      register(def: any): void
      execute(name: string, args: any): Promise<any>
    }
  }
}

const tools = new Map<string, any>()

export function apply(ctx: Context) {
  ctx.provide('tools', {
    register(def: any) {
      tools.set(def.name, def)
      console.log(`[Tools] Registered tool: ${def.name}`)
    },
    async execute(name: string, args: any) {
      const tool = tools.get(name)
      if (!tool) throw new Error(`Tool not found: ${name}`)
      console.log(`[Tools] Executing ${name} with args:`, args)
      return await tool.execute(args)
    }
  })
}
