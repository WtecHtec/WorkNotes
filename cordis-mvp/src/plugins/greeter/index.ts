import type { Context } from '@cordisjs/core'

export interface GreeterConfig {
  name?: string
  greeting?: string
}

export const name = 'greeter'
export const inject = ['logger']

export function apply(ctx: Context, config: GreeterConfig = {}) {
  const logger = ctx.logger
  const name = config.name ?? 'World'
  const greeting = config.greeting ?? 'Hello'

  ctx.on('app:start', () => {
    logger.info(`${greeting}, ${name}!`)
  })

  return () => {
    logger.info('Greeter plugin cleaned up')
  }
}
