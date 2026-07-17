#!/usr/bin/env node

import { readFile } from "node:fs/promises"
import { stdin, stdout, stderr } from "node:process"
import { renderMermaid } from "../../application/render-mermaid.js"
import { renderAnsi } from "./ansi-renderer.js"

/** 生成 CLI 帮助文本，集中维护参数说明。 */
function usage() {
  return `用法：mermaid-unicode [文件] [选项]

文件为空时从 stdin 读取。

选项：
  --width <列数>   限制输出宽度，默认使用当前终端宽度
  --no-color       禁用 ANSI 颜色
  --help           显示帮助
`
}

/** 持续读取标准输入并合并为 UTF-8 Mermaid 源码。 */
async function readStdin() {
  const chunks = []
  for await (const chunk of stdin) chunks.push(chunk)
  return Buffer.concat(chunks).toString("utf8")
}

/** 解析 CLI 参数并验证文件、宽度和颜色选项之间的约束。 */
function parseArguments(argv) {
  const options = { file: null, color: true, width: stdout.columns || null }
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === "--help" || argument === "-h") return { ...options, help: true }
    if (argument === "--no-color") {
      options.color = false
      continue
    }
    if (argument === "--width") {
      const width = Number.parseInt(argv[index + 1], 10)
      if (!Number.isFinite(width) || width < 8) throw new Error("--width 必须是大于等于 8 的整数")
      options.width = width
      index += 1
      continue
    }
    if (argument.startsWith("-")) throw new Error(`未知选项：${argument}`)
    if (options.file) throw new Error("一次只能读取一个文件")
    options.file = argument
  }
  return options
}

try {
  const options = parseArguments(process.argv.slice(2))
  if (options.help) {
    stdout.write(usage())
    process.exitCode = 0
  } else {
    const source = options.file ? await readFile(options.file, "utf8") : await readStdin()
    const art = renderMermaid(source, { maxWidth: options.width })
    const useColor = options.color && stdout.isTTY === true && !process.env.NO_COLOR
    stdout.write(`${renderAnsi(art, { color: useColor })}\n`)
  }
} catch (error) {
  stderr.write(`mermaid-unicode: ${error.message}\n`)
  process.exitCode = 1
}
