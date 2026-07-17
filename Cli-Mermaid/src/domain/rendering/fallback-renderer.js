import { ROLE } from "../constants.js"
import { displayWidth, fitText, graphemes, graphemeWidth } from "../unicode.js"
import { UnicodeCanvas } from "./unicode-canvas.js"

/** 按终端显示列切分长源码行，保证 fallback 不突破宽度预算。 */
function chunkLine(line, limit) {
  if (!limit || displayWidth(line) <= limit) return [line]
  const output = []
  let current = ""
  let width = 0
  for (const grapheme of graphemes(line)) {
    const next = Math.max(1, graphemeWidth(grapheme))
    if (current && width + next > limit) {
      output.push(current)
      current = ""
      width = 0
    }
    current += grapheme
    width += next
  }
  if (current) output.push(current)
  return output
}

/** 将不支持、无效或过大的 Mermaid 源码渲染为带标题的安全文本框。 */
export function renderFallback(source, maxWidth, reason) {
  const header = String(source).trim().split(/\s+/u)[0] || "diagram"
  const title = ` mermaid: ${header} `
  const bodyLimit = maxWidth ? Math.max(1, maxWidth - 4) : null
  const displayTitle = bodyLimit ? fitText(title, bodyLimit) : title
  const body = String(source)
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .flatMap((line) => chunkLine(line, bodyLimit))
  const contentWidth = Math.max(displayWidth(displayTitle), 1, ...body.map(displayWidth))
  const canvas = new UnicodeCanvas(contentWidth + 4, body.length + 2)

  canvas.set(0, 0, "╭", ROLE.BORDER, true)
  canvas.setText(1, 0, displayTitle, ROLE.TITLE, true)
  const titleWidth = displayWidth(displayTitle)
  for (let x = titleWidth + 1; x < contentWidth + 3; x += 1) canvas.set(x, 0, "─", ROLE.BORDER, true)
  canvas.set(contentWidth + 3, 0, "╮", ROLE.BORDER, true)

  body.forEach((line, index) => {
    canvas.set(0, index + 1, "│", ROLE.BORDER, true)
    canvas.setText(2, index + 1, line, ROLE.NODE_TEXT)
    canvas.set(contentWidth + 3, index + 1, "│", ROLE.BORDER, true)
  })
  canvas.set(0, body.length + 1, "╰", ROLE.BORDER, true)
  for (let x = 1; x < contentWidth + 3; x += 1) canvas.set(x, body.length + 1, "─", ROLE.BORDER, true)
  canvas.set(contentWidth + 3, body.length + 1, "╯", ROLE.BORDER, true)
  return canvas.toArt({ fallback: true, reason, diagramType: null })
}
