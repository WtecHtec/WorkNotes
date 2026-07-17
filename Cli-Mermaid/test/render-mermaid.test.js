import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { describe, it } from "node:test"

import {
  displayWidth,
  renderAnsi,
  renderHtml,
  renderMermaid,
} from "../src/index.js"

function textOf(source, options) {
  const art = renderMermaid(source, options)
  return { art, text: art?.plainLines.join("\n") || "" }
}

describe("flowchart", () => {
  it("渲染节点、中文标签、边标签和箭头", () => {
    const { art, text } = textOf(`
flowchart TD
  A[开始] -->|成功| B{完成}
`)
    assert.equal(art.diagramType, "flowchart")
    assert.equal(art.fallback, false)
    assert.match(text, /开始/u)
    assert.match(text, /成功/u)
    assert.match(text, /完成/u)
    assert.match(text, /▼/u)
  })

  it("支持 LR 和 RL 方向且保持文字可读", () => {
    const lr = textOf("flowchart LR\nA[开始] --> B[结束]").text
    const rl = textOf("flowchart RL\nA[开始] --> B[结束]").text
    assert.match(lr, /开始.*结束/u)
    assert.match(rl, /结束.*开始/u)
    assert.doesNotMatch(rl, /始开|束结/u)
  })

  it("渲染 subgraph 标题与成员", () => {
    const { text } = textOf(`
flowchart TD
  subgraph service[服务层]
    A[API] --> B[Database]
  end
  B --> C[Client]
`)
    assert.match(text, /服务层/u)
    assert.match(text, /API/u)
    assert.match(text, /Database/u)
    assert.match(text, /Client/u)
    assert.match(text, /╭/u)
  })

  it("支持链式边和 fan-out", () => {
    const { text } = textOf("flowchart TD\nA & B --> C --> D")
    for (const label of ["A", "B", "C", "D"]) assert.match(text, new RegExp(label, "u"))
  })

  it("循环边、自循环以及后续边可以同时渲染", () => {
    const { text } = textOf("flowchart LR\nA --> A\nA --> B\nB --> A")
    assert.match(text, /A/u)
    assert.match(text, /B/u)
    assert.ok((text.match(/[▶◀▲▼]/gu) || []).length >= 2)
  })

  it("区分虚线和粗线", () => {
    const dotted = textOf("flowchart TD\nA -.-> B").text
    const thick = textOf("flowchart TD\nA ==> B").text
    assert.match(dotted, /[╌╎]/u)
    assert.match(thick, /[━┃]/u)
  })
})

describe("其他图类型", () => {
  it("渲染状态图", () => {
    const { art, text } = textOf("stateDiagram-v2\n[*] --> Ready\nReady --> [*]")
    assert.equal(art.diagramType, "state")
    assert.match(text, /Ready/u)
    assert.match(text, /●/u)
  })

  it("渲染类图分栏与关系", () => {
    const { art, text } = textOf(`
classDiagram
  class User {
    +id: string
    +login()
  }
  User <|-- Admin
`)
    assert.equal(art.diagramType, "class")
    assert.match(text, /\+id: string/u)
    assert.match(text, /\+login\(\)/u)
    assert.match(text, /△/u)
  })

  it("渲染 ER 实体、属性与基数", () => {
    const { art, text } = textOf(`
erDiagram
  USER {
    string id PK
  }
  USER ||--o{ ORDER : places
`)
    assert.equal(art.diagramType, "er")
    assert.match(text, /string id PK/u)
    assert.match(text, /0\.\.\*/u)
    assert.match(text, /places/u)
  })

  it("渲染时序图、注释与分组分隔线", () => {
    const { art, text } = textOf(`
sequenceDiagram
  participant U as 用户
  participant S as 服务
  U->>S: 请求
  Note over U,S: 异步调用
  loop retry
    S-->>U: 响应
  end
`)
    assert.equal(art.diagramType, "sequence")
    assert.match(text, /用户/u)
    assert.match(text, /异步调用/u)
    assert.match(text, /loop retry/u)
    assert.match(text, /响应/u)
  })
})

describe("平台无关输出", () => {
  it("正确计算 CJK 与 Emoji 显示宽度", () => {
    assert.equal(displayWidth("ABC"), 3)
    assert.equal(displayWidth("中文"), 4)
    assert.equal(displayWidth("😀"), 2)
  })

  it("HTML 适配器转义用户输入并保留语义 class", () => {
    const art = renderMermaid("flowchart TD\nA[<script>alert(1)</script>]")
    const html = renderHtml(art)
    assert.doesNotMatch(html, /<script>/u)
    assert.match(html, /&lt;script&gt;/u)
    assert.match(html, /mermaid-unicode__nodeText/u)
  })

  it("ANSI 适配器可关闭颜色", () => {
    const art = renderMermaid("flowchart TD\nA --> B")
    assert.equal(renderAnsi(art, { color: false }), art.plainLines.join("\n"))
    assert.match(renderAnsi(art), /\u001b\[/u)
  })
})

describe("容错和资源边界", () => {
  it("不支持的图类型降级为源码框", () => {
    const { art, text } = textOf("gantt\ntitle Project")
    assert.equal(art.fallback, true)
    assert.equal(art.reason, "unsupported-or-invalid")
    assert.match(text, /mermaid: gantt/u)
    assert.match(text, /title Project/u)
  })

  it("超过宽度时降级且不超过给定宽度", () => {
    const art = renderMermaid("flowchart LR\nA[Long start node] --> B[Long middle node] --> C[Long final node]", { maxWidth: 32 })
    assert.equal(art.fallback, true)
    assert.equal(art.reason, "too-wide")
    assert.ok(art.plainLines.every((line) => displayWidth(line) <= 32))
  })

  it("极窄 fallback 仍遵守宽度预算", () => {
    const art = renderMermaid("gantt\ntitle Project", { maxWidth: 12 })
    assert.equal(art.fallback, true)
    assert.ok(art.plainLines.every((line) => displayWidth(line) <= 12))
  })

  it("超过节点上限时安全降级", () => {
    const nodes = Array.from({ length: 129 }, (_, index) => `N${index}`).join(" --> ")
    const art = renderMermaid(`flowchart TD\n${nodes}`)
    assert.equal(art.fallback, true)
    assert.equal(art.reason, "limit-exceeded")
  })

  it("CLI 可从 stdin 输出纯文本", () => {
    const result = spawnSync(process.execPath, ["src/adapters/node/cli.js", "--no-color", "--width", "80"], {
      cwd: process.cwd(),
      input: "flowchart TD\nA[Start] --> B[End]",
      encoding: "utf8",
    })
    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /Start/u)
    assert.match(result.stdout, /End/u)
    assert.doesNotMatch(result.stdout, /\u001b\[/u)
  })
})
