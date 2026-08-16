import { Context } from '@cordisjs/core'

declare module '@cordisjs/core' {
  interface Events {
    'app:start'(): void
    'app:dispose'(): void
  }
}

export class MyApp {
  public readonly ctx: Context

  constructor() {
    this.ctx = new Context()
  }

  use(plugin: any, config?: any) {
    this.ctx.plugin(plugin, config)
    return this
  }

  start() {
    this.ctx.emit('app:start')
    console.log('✅ MyApp started')
  }

  dispose() {
    this.ctx.emit('app:dispose')
    console.log('🛑 MyApp disposed')
  }
}
