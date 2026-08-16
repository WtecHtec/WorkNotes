import { MyApp } from './core/app.ts'
import * as logger from './plugins/logger/index.ts'
import * as greeter from './plugins/greeter/index.ts'
import * as toolsMock from './plugins/tools-mock/index.ts'
import * as fileTool from './plugins/file-tool/index.ts'

const app = new MyApp()

app
  .use(logger)
  .use(toolsMock)
  .use(greeter, { name: 'Cordis', greeting: '欢迎使用' })
  .use(fileTool)

app.start()

// ==================== Mock 调用 fileTool ====================
setTimeout(async () => {
  try {
    const result = await app.ctx.tools.execute('read_file', {
      path: 'README.md'
    })
    console.log('[Mock Result]', result)
  } catch (err) {
    console.error('[Mock Error]', err)
  }

  app.dispose()
}, 1500)