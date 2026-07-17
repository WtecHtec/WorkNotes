import { renderAnsi, renderMermaid } from "../src/index.js"

const source = `
flowchart TD
  User[用户] -->|提交请求| API(API 服务)
  API --> Auth{权限验证}
  Auth -->|通过| DB[(数据库)]
  Auth -->|拒绝| Error[返回错误]
`

const art = renderMermaid(source, { maxWidth: 100 })
console.log(renderAnsi(art))
