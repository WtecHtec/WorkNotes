import type { Context } from '@cordisjs/core'

export const name = 'logger'

declare module '@cordisjs/core' {
  interface Context {
    logger: {
      info(msg: string): void
      error(msg: string): void
    }
  }
}

export function apply(ctx: Context) {
  ctx.provide('logger', {
    info: (msg: string) => console.log(`[INFO] ${msg}`),
    error: (msg: string) => console.error(`[ERROR] ${msg}`),
  })
}
