import { LIMITS, ROLE, SHAPE } from "../constants.js"
import { displayWidth, fitText, wrapLabel } from "../unicode.js"
import { groupDepth } from "../layout/graph-structure.js"

/** 节点测量只关心内容与形状，不参与坐标计算。 */
export function measureNode(node) {
  if (node.sections) {
    const sections = node.sections.filter((section) => section.length)
    const width = Math.max(1, ...sections.flat().map(displayWidth)) + 4
    const height = sections.reduce((sum, section) => sum + section.length, 0) + Math.max(0, sections.length - 1) + 2
    return { width, height, lines: null, sections }
  }
  const lines = wrapLabel(node.label, LIMITS.wrapWidth, LIMITS.maxLabelLines)
  const contentWidth = Math.max(1, ...lines.map(displayWidth))
  if (node.shape === SHAPE.DIAMOND) {
    return { width: Math.max(7, contentWidth + 6), height: Math.max(3, lines.length + 2), lines, sections: null }
  }
  return { width: contentWidth + 4, height: lines.length + 2, lines, sections: null }
}

/** 绘制矩形、圆角或分栏节点，并把整个节点区域标记为占用。 */
function drawRect(canvas, placed, node, measured) {
  const { x, y, width, height } = placed
  const rounded = node.shape === SHAPE.ROUND
  const [tl, tr, bl, br] = rounded ? ["╭", "╮", "╰", "╯"] : ["┌", "┐", "└", "┘"]
  canvas.set(x, y, tl, ROLE.BORDER, true)
  canvas.set(x + width - 1, y, tr, ROLE.BORDER, true)
  canvas.set(x, y + height - 1, bl, ROLE.BORDER, true)
  canvas.set(x + width - 1, y + height - 1, br, ROLE.BORDER, true)
  for (let offset = 1; offset < width - 1; offset += 1) {
    canvas.set(x + offset, y, "─", ROLE.BORDER, true)
    canvas.set(x + offset, y + height - 1, "─", ROLE.BORDER, true)
  }
  for (let offset = 1; offset < height - 1; offset += 1) {
    canvas.set(x, y + offset, "│", ROLE.BORDER, true)
    canvas.set(x + width - 1, y + offset, "│", ROLE.BORDER, true)
    for (let inner = 1; inner < width - 1; inner += 1) canvas.set(x + inner, y + offset, " ", ROLE.EMPTY, true)
  }

  const sections = measured.sections || [measured.lines]
  let row = y + 1
  sections.forEach((section, sectionIndex) => {
    if (sectionIndex > 0) {
      canvas.set(x, row, "├", ROLE.BORDER, true)
      canvas.set(x + width - 1, row, "┤", ROLE.BORDER, true)
      for (let offset = 1; offset < width - 1; offset += 1) canvas.set(x + offset, row, "─", ROLE.BORDER, true)
      row += 1
    }
    for (const line of section) {
      const text = fitText(line, width - 2)
      const textX = x + 1 + Math.floor((width - 2 - displayWidth(text)) / 2)
      canvas.setText(textX, row, text, ROLE.NODE_TEXT, true)
      row += 1
    }
  })
}

/** 用四个顶点和斜边绘制菱形节点，并在中心放置标签。 */
function drawDiamond(canvas, placed, measured) {
  const { x, y, width, height } = placed
  const center = x + Math.floor(width / 2)
  const middle = y + Math.floor(height / 2)
  canvas.set(center, y, "◇", ROLE.BORDER, true)
  canvas.set(center, y + height - 1, "◇", ROLE.BORDER, true)
  canvas.set(x, middle, "◇", ROLE.BORDER, true)
  canvas.set(x + width - 1, middle, "◇", ROLE.BORDER, true)
  for (let row = y + 1; row < y + height - 1; row += 1) {
    const distance = Math.abs(middle - row)
    const inset = Math.min(Math.floor(width / 2) - 1, distance * 2)
    canvas.set(x + inset + 1, row, row < middle ? "╱" : "╲", ROLE.BORDER, true)
    canvas.set(x + width - inset - 2, row, row < middle ? "╲" : "╱", ROLE.BORDER, true)
  }
  const lines = measured.lines.slice(0, Math.max(1, height - 2))
  lines.forEach((line, index) => {
    const text = fitText(line, width - 4)
    canvas.setText(center - Math.floor(displayWidth(text) / 2), middle - Math.floor((lines.length - 1) / 2) + index, text, ROLE.NODE_TEXT, true)
  })
}

/** 根据节点形状把已测量节点委派给矩形或菱形绘制实现。 */
export function drawNode(canvas, placed, node, measured) {
  if (node.shape === SHAPE.DIAMOND) drawDiamond(canvas, placed, measured)
  else drawRect(canvas, placed, node, measured)
}

/** 根据已放置成员的包围盒绘制分组框；分组不负责节点布局。 */
export function drawGroups(canvas, graph, placed) {
  const bounds = new Map()
  for (let index = graph.groups.length - 1; index >= 0; index -= 1) {
    const members = []
    graph.nodes.forEach((node, nodeIndex) => {
      if (node.group === index) members.push(placed[nodeIndex])
    })
    for (const [childIndex, childBounds] of bounds) {
      if (graph.groups[childIndex].parent === index) members.push(childBounds)
    }
    if (!members.length) continue
    const depth = groupDepth(graph, index)
    const pad = Math.max(1, 3 - depth)
    const left = Math.max(0, Math.min(...members.map((item) => item.x)) - pad)
    const top = Math.max(0, Math.min(...members.map((item) => item.y)) - pad)
    const right = Math.min(canvas.width - 1, Math.max(...members.map((item) => item.x + item.width - 1)) + pad)
    const bottom = Math.min(canvas.height - 1, Math.max(...members.map((item) => item.y + item.height - 1)) + pad)
    bounds.set(index, { x: left, y: top, width: right - left + 1, height: bottom - top + 1 })
  }

  for (const [index, box] of [...bounds.entries()].reverse()) {
    const { x, y, width, height } = box
    for (let offset = 0; offset < width; offset += 1) {
      canvas.set(x + offset, y, offset === 0 ? "╭" : offset === width - 1 ? "╮" : "─", ROLE.BORDER, true)
      canvas.set(x + offset, y + height - 1, offset === 0 ? "╰" : offset === width - 1 ? "╯" : "─", ROLE.BORDER, true)
    }
    for (let offset = 1; offset < height - 1; offset += 1) {
      canvas.set(x, y + offset, "│", ROLE.BORDER, true)
      canvas.set(x + width - 1, y + offset, "│", ROLE.BORDER, true)
    }
    const title = ` ${fitText(graph.groups[index].label, Math.max(1, width - 4))} `
    canvas.setText(x + 2, y, title, ROLE.TITLE, true)
  }
}
