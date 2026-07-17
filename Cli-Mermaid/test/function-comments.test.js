import assert from "node:assert/strict"
import { readFile, readdir } from "node:fs/promises"
import { join } from "node:path"
import { it } from "node:test"

const CONTROL_WORDS = new Set(["if", "for", "while", "switch", "catch", "with"])

/** 返回 src 下全部 JavaScript 文件的绝对路径。 */
async function sourceFiles() {
  const root = join(process.cwd(), "src")
  const entries = await readdir(root, { recursive: true })
  return entries.filter((entry) => entry.endsWith(".js")).map((entry) => join(root, entry))
}

/** 查找指定代码行之前最近的非空行，供 JSDoc 邻接检查使用。 */
function previousNonEmptyLine(lines, index) {
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    if (lines[cursor].trim()) return lines[cursor].trim()
  }
  return ""
}

/** 提取命名函数、命名箭头函数和类方法，忽略匿名回调。 */
function declaredFunctionName(line) {
  const declaration = line.match(/^\s*(?:export\s+)?(?:async\s+)?function\s+([\w$]+)/u)
  if (declaration) return declaration[1]
  const arrow = line.match(/^\s*const\s+([\w$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/u)
  if (arrow) return arrow[1]
  const method = line.match(/^ {2}([\w$]+)\([^)]*\)\s*\{/u)
  if (method && !CONTROL_WORDS.has(method[1])) return method[1]
  return null
}

it("所有生产代码命名函数都有独立 JSDoc", async () => {
  const missing = []
  for (const file of await sourceFiles()) {
    const lines = (await readFile(file, "utf8")).split("\n")
    lines.forEach((line, index) => {
      const name = declaredFunctionName(line)
      if (!name) return
      const previous = previousNonEmptyLine(lines, index)
      if (!previous.endsWith("*/")) missing.push(`${file}:${index + 1} ${name}`)
    })
  }
  assert.deepEqual(missing, [], `以下函数缺少独立 JSDoc：\n${missing.join("\n")}`)
})
