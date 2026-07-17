import { LIMITS, ROLE, SHAPE } from "../constants.js"
import { displayWidth, fitText } from "../unicode.js"
import { UnicodeCanvas } from "../rendering/unicode-canvas.js"

const PARTICIPANT_GAP = 6

/** 绘制 participant 或 Note 使用的三行矩形框，并居中写入文本。 */
function drawBox(canvas, centerX, y, width, text) {
  const x = centerX - Math.floor(width / 2)
  canvas.set(x, y, "┌", ROLE.BORDER, true)
  canvas.set(x + width - 1, y, "┐", ROLE.BORDER, true)
  canvas.set(x, y + 2, "└", ROLE.BORDER, true)
  canvas.set(x + width - 1, y + 2, "┘", ROLE.BORDER, true)
  for (let offset = 1; offset < width - 1; offset += 1) {
    canvas.set(x + offset, y, "─", ROLE.BORDER, true)
    canvas.set(x + offset, y + 2, "─", ROLE.BORDER, true)
  }
  canvas.set(x, y + 1, "│", ROLE.BORDER, true)
  canvas.set(x + width - 1, y + 1, "│", ROLE.BORDER, true)
  for (let offset = 1; offset < width - 1; offset += 1) {
    canvas.set(x + offset, y + 1, " ", ROLE.EMPTY, true)
  }
  const label = fitText(text, width - 2)
  canvas.setText(x + 1 + Math.floor((width - 2 - displayWidth(label)) / 2), y + 1, label, ROLE.NODE_TEXT, true)
}

/** 根据 Note 的 over/left/right 锚点计算水平起点与宽度。 */
function noteGeometry(xs, item, textWidth) {
  const [first, second = first] = item.participants
  if (item.anchor === "over") {
    const left = Math.min(first, second)
    const right = Math.max(first, second)
    const center = Math.floor((xs[left] + xs[right]) / 2)
    const width = Math.max(textWidth + 4, xs[right] - xs[left] + 5)
    return { x: Math.max(0, center - Math.floor(width / 2)), width }
  }
  const width = textWidth + 4
  if (item.anchor === "left of") return { x: Math.max(0, xs[first] - width - 2), width }
  return { x: xs[first] + 2, width }
}

/** 依据 participant 横轴和事件时间轴生成完整时序图 Canvas。 */
export function layoutSequence(sequence, maxWidth = null) {
  const labels = sequence.participants.map((participant) => fitText(participant.label, LIMITS.wrapWidth))
  const widths = labels.map((label) => Math.max(5, displayWidth(label) + 4))
  const gaps = []
  for (let index = 0; index < labels.length - 1; index += 1) {
    gaps[index] = Math.max(PARTICIPANT_GAP, Math.ceil(widths[index] / 2) + Math.ceil(widths[index + 1] / 2) + 2)
  }

  // 消息文本反向约束 participant 间距，避免先布局后发现标签无处可放。
  for (const item of sequence.items) {
    if (item.type !== "message" || item.from === item.to) continue
    const left = Math.min(item.from, item.to)
    const right = Math.max(item.from, item.to)
    const required = Math.max(4, displayWidth(item.text || "") + 2)
    const current = gaps.slice(left, right).reduce((sum, value) => sum + value, 0)
    if (current < required) gaps[right - 1] += required - current
  }

  const xs = new Array(labels.length).fill(0)
  xs[0] = Math.ceil(widths[0] / 2)
  for (let index = 1; index < xs.length; index += 1) xs[index] = xs[index - 1] + gaps[index - 1]

  let canvasWidth = xs.at(-1) + Math.ceil(widths.at(-1) / 2) + 2
  for (const item of sequence.items) {
    if (item.type === "note") {
      const geometry = noteGeometry(xs, item, displayWidth(item.text))
      canvasWidth = Math.max(canvasWidth, geometry.x + geometry.width + 1)
    }
    if (item.type === "divider") canvasWidth = Math.max(canvasWidth, displayWidth(item.text) + 4)
  }
  if (maxWidth && canvasWidth > maxWidth) throw new RangeError("diagram-too-wide")

  const rows = []
  let y = 4
  for (const item of sequence.items) {
    rows.push(y)
    if (item.type === "message") y += item.from === item.to ? 4 : item.text ? 3 : 2
    else if (item.type === "note") y += 4
    else y += 2
  }
  const bottomY = y
  const canvas = new UnicodeCanvas(canvasWidth, bottomY + 3)

  labels.forEach((label, index) => {
    drawBox(canvas, xs[index], 0, widths[index], label)
    drawBox(canvas, xs[index], bottomY, widths[index], label)
  })

  sequence.items.forEach((item, index) => {
    if (item.type !== "note") return
    const row = rows[index]
    const geometry = noteGeometry(xs, item, displayWidth(item.text))
    const center = geometry.x + Math.floor(geometry.width / 2)
    drawBox(canvas, center, row, geometry.width, item.text)
  })

  for (const x of xs) canvas.segmentVertical(x, 3, bottomY - 1)

  sequence.items.forEach((item, index) => {
    const row = rows[index]
    if (item.type === "divider") {
      canvas.segmentHorizontal(row, 0, canvasWidth - 1)
      const text = ` ${fitText(item.text, canvasWidth - 4)} `
      canvas.setText(2, row, text, ROLE.EDGE_LABEL)
      return
    }
    if (item.type !== "message") return
    const fromX = xs[item.from]
    const toX = xs[item.to]
    if (item.from === item.to) {
      canvas.segmentHorizontal(row, fromX, fromX + 4)
      canvas.segmentVertical(fromX + 4, row, row + 2)
      canvas.segmentHorizontal(row + 2, fromX + 1, fromX + 4)
      canvas.set(fromX + 1, row + 2, item.cross ? "×" : "◀", ROLE.EDGE)
      if (item.text) canvas.setText(fromX + 6, row + 1, fitText(item.text, LIMITS.maxEdgeLabel), ROLE.EDGE_LABEL)
      return
    }

    const arrowRow = item.text ? row + 1 : row
    const left = Math.min(fromX, toX)
    const right = Math.max(fromX, toX)
    canvas.currentLineKind = item.dotted ? "dotted" : "solid"
    canvas.segmentHorizontal(arrowRow, left, right)
    const pointsRight = toX > fromX
    canvas.set(pointsRight ? toX - 1 : toX + 1, arrowRow, item.cross ? "×" : pointsRight ? "▶" : "◀", ROLE.EDGE)
    if (item.text) {
      const text = fitText(item.text, Math.max(1, right - left - 2))
      canvas.setText(left + 1 + Math.floor((right - left - 2 - displayWidth(text)) / 2), row, text, ROLE.EDGE_LABEL)
    }
  })

  canvas.finalizeConnections()
  return canvas
}
