import { HEAD, LIMITS, ROLE } from "../constants.js"
import { displayWidth, fitText } from "../unicode.js"

/** 根据端点类型和进入方向选择对应 Unicode 箭头或 UML 符号。 */
function headGlyph(head, direction) {
  if (head === HEAD.NONE) return null
  if (head === HEAD.CIRCLE) return "○"
  if (head === HEAD.CROSS) return "×"
  if (head === HEAD.DIAMOND_FILL) return "◆"
  if (head === HEAD.DIAMOND_OPEN) return "◇"
  if (head === HEAD.TRIANGLE) return ({ down: "▽", up: "△", right: "▷", left: "◁" })[direction]
  return ({ down: "▼", up: "▲", right: "▶", left: "◀" })[direction]
}

/** 截断并居中放置边标签，使显式文本覆盖底层连线。 */
function placeEdgeLabel(canvas, edge, x, y, availableWidth) {
  if (!edge.label) return
  const text = fitText(edge.label, Math.min(LIMITS.maxEdgeLabel, Math.max(1, availableWidth)))
  canvas.setText(Math.max(0, x - Math.floor(displayWidth(text) / 2)), y, text, ROLE.EDGE_LABEL)
}

/** 为 TD/BT 布局绘制前向边、回边和自循环。 */
export function drawVerticalEdges(canvas, graph, placed, ranks, trackPlans, contentRight) {
  let backLane = 0
  for (let index = 0; index < graph.edges.length; index += 1) {
    const edge = graph.edges[index]
    const from = placed[edge.from]
    const to = placed[edge.to]
    canvas.currentLineKind = edge.line

    if (edge.from === edge.to) {
      const lane = from.x + from.width + 2
      canvas.segmentHorizontal(from.centerY, from.x + from.width, lane)
      canvas.segmentVertical(lane, from.centerY, from.y + from.height + 1)
      canvas.segmentHorizontal(from.y + from.height + 1, from.centerX + 1, lane)
      canvas.set(from.centerX, from.y + from.height + 1, "▲", ROLE.EDGE)
      placeEdgeLabel(canvas, edge, lane + 1, from.centerY + 1, LIMITS.maxEdgeLabel)
      continue
    }

    if (ranks[edge.to] === ranks[edge.from] + 1) {
      const track = trackPlans.get(index) ?? 0
      const busY = from.y + from.height + track + 1
      canvas.segmentVertical(from.centerX, from.y + from.height, busY)
      canvas.segmentHorizontal(busY, from.centerX, to.centerX)
      canvas.segmentVertical(to.centerX, busY, to.y - 2)
      const targetHead = headGlyph(edge.headTo, "down")
      if (targetHead) canvas.set(to.centerX, to.y - 1, targetHead, ROLE.EDGE)
      const sourceHead = headGlyph(edge.headFrom, "up")
      if (sourceHead) canvas.set(from.centerX, from.y + from.height, sourceHead, ROLE.EDGE)
      placeEdgeLabel(canvas, edge, Math.floor((from.centerX + to.centerX) / 2), busY, Math.min(LIMITS.maxEdgeLabel, Math.max(1, canvas.width - 2)))
      continue
    }

    const lane = contentRight + 2 + backLane * 2
    backLane += 1
    const fromX = from.x + from.width
    const toX = to.x + to.width
    canvas.segmentHorizontal(from.centerY, fromX, lane)
    canvas.segmentVertical(lane, from.centerY, to.centerY)
    canvas.segmentHorizontal(to.centerY, toX + 2, lane)
    const targetHead = headGlyph(edge.headTo, "left")
    if (targetHead) canvas.set(toX + 1, to.centerY, targetHead, ROLE.EDGE)
    const sourceHead = headGlyph(edge.headFrom, "right")
    if (sourceHead) canvas.set(fromX, from.centerY, sourceHead, ROLE.EDGE)
    placeEdgeLabel(canvas, edge, lane, Math.floor((from.centerY + to.centerY) / 2), LIMITS.maxEdgeLabel)
  }
}

/** 为 LR/RL 布局绘制前向边、回边和自循环。 */
export function drawHorizontalEdges(canvas, graph, placed, ranks, trackPlans, contentBottom) {
  let backLane = 0
  for (let index = 0; index < graph.edges.length; index += 1) {
    const edge = graph.edges[index]
    const from = placed[edge.from]
    const to = placed[edge.to]
    canvas.currentLineKind = edge.line

    if (edge.from === edge.to) {
      const lane = from.y + from.height + 2
      canvas.segmentVertical(from.centerX, from.y + from.height, lane)
      canvas.segmentHorizontal(lane, from.centerX, from.x + from.width + 1)
      canvas.segmentVertical(from.x + from.width + 1, from.centerY + 1, lane)
      canvas.set(from.x + from.width + 1, from.centerY, "◀", ROLE.EDGE)
      continue
    }

    if (ranks[edge.to] === ranks[edge.from] + 1) {
      const track = trackPlans.get(index) ?? 0
      const busX = from.x + from.width + track + 1
      canvas.segmentHorizontal(from.centerY, from.x + from.width, busX)
      canvas.segmentVertical(busX, from.centerY, to.centerY)
      canvas.segmentHorizontal(to.centerY, busX, to.x - 2)
      const targetHead = headGlyph(edge.headTo, "right")
      if (targetHead) canvas.set(to.x - 1, to.centerY, targetHead, ROLE.EDGE)
      const sourceHead = headGlyph(edge.headFrom, "left")
      if (sourceHead) canvas.set(from.x + from.width, from.centerY, sourceHead, ROLE.EDGE)
      if (edge.label) {
        const text = fitText(edge.label, LIMITS.maxEdgeLabel)
        canvas.setText(busX - Math.floor(displayWidth(text) / 2), Math.max(0, Math.floor((from.centerY + to.centerY) / 2) - 1), text, ROLE.EDGE_LABEL)
      }
      continue
    }

    const lane = contentBottom + 2 + backLane * 2
    backLane += 1
    const fromY = from.y + from.height
    const toY = to.y + to.height
    canvas.segmentVertical(from.centerX, fromY, lane)
    canvas.segmentHorizontal(lane, from.centerX, to.centerX)
    canvas.segmentVertical(to.centerX, toY + 2, lane)
    const targetHead = headGlyph(edge.headTo, "up")
    if (targetHead) canvas.set(to.centerX, toY + 1, targetHead, ROLE.EDGE)
    const sourceHead = headGlyph(edge.headFrom, "down")
    if (sourceHead) canvas.set(from.centerX, fromY, sourceHead, ROLE.EDGE)
  }
}
