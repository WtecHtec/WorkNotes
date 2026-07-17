import { DIRECTION } from "../constants.js"
import { UnicodeCanvas } from "../rendering/unicode-canvas.js"
import { drawHorizontalEdges, drawVerticalEdges } from "../rendering/graph-edge-router.js"
import { drawGroups, drawNode, measureNode } from "../rendering/graph-node-painter.js"
import { assignTracks, computeRanks, groupDepth, orderRanks } from "./graph-structure.js"

const GAP_ALONG_RANK = 4
const BASE_BAND_GAP = 4

/** 为每个相邻 rank 计算边区间并分配可复用的正交路由轨道。 */
function trackPlan(graph, ranks, placed, rankCount, horizontal) {
  const plans = new Map()
  const bandCounts = new Array(Math.max(0, rankCount - 1)).fill(1)
  for (let rank = 0; rank < rankCount - 1; rank += 1) {
    const intervals = []
    graph.edges.forEach((edge, edgeIndex) => {
      if (ranks[edge.from] !== rank || ranks[edge.to] !== rank + 1) return
      const fromCenter = horizontal
        ? placed[edge.from].y + Math.floor(placed[edge.from].height / 2)
        : placed[edge.from].x + Math.floor(placed[edge.from].width / 2)
      const toCenter = horizontal
        ? placed[edge.to].y + Math.floor(placed[edge.to].height / 2)
        : placed[edge.to].x + Math.floor(placed[edge.to].width / 2)
      intervals.push({ start: Math.min(fromCenter, toCenter), end: Math.max(fromCenter, toCenter), edge: edgeIndex })
    })
    const result = assignTracks(intervals)
    bandCounts[rank] = result.count
    for (const [edge, track] of result.assigned) plans.set(edge, track)
  }
  return { plans, bandCounts }
}

/** 在节点左上角和尺寸确定后补齐中心连接点坐标。 */
function finishPlacement(item) {
  item.centerX = item.x + Math.floor(item.width / 2)
  item.centerY = item.y + Math.floor(item.height / 2)
}

/** 协调测量、分层、坐标和绘制；具体算法与绘图细节由独立模块承担。 */
export function layoutGraph(graph, maxWidth = null) {
  const ranks = computeRanks(graph)
  const rows = orderRanks(graph, ranks)
  const measured = graph.nodes.map(measureNode)
  const horizontal = graph.direction === DIRECTION.RIGHT || graph.direction === DIRECTION.LEFT
  const groupMargin = graph.groups.length
    ? Math.min(8, 2 + Math.max(...graph.groups.map((_, index) => groupDepth(graph, index))))
    : 1
  const placed = new Array(graph.nodes.length)

  if (!horizontal) {
    const rowWidths = rows.map((row) => row.reduce((sum, node) => sum + measured[node].width, 0) + Math.max(0, row.length - 1) * GAP_ALONG_RANK)
    const contentWidth = Math.max(1, ...rowWidths)
    for (let rank = 0; rank < rows.length; rank += 1) {
      let x = groupMargin + Math.floor((contentWidth - rowWidths[rank]) / 2)
      for (const node of rows[rank]) {
        placed[node] = { x, y: 0, width: measured[node].width, height: measured[node].height, rank: ranks[node] }
        x += measured[node].width + GAP_ALONG_RANK
      }
    }

    const { plans, bandCounts } = trackPlan(graph, ranks, placed, rows.length, false)
    let y = groupMargin
    for (let rank = 0; rank < rows.length; rank += 1) {
      const rowHeight = Math.max(...rows[rank].map((node) => measured[node].height))
      for (const node of rows[rank]) {
        placed[node].y = y + Math.floor((rowHeight - measured[node].height) / 2)
        finishPlacement(placed[node])
      }
      y += rowHeight + (rank < rows.length - 1 ? BASE_BAND_GAP + bandCounts[rank] : 0)
    }
    const backEdges = graph.edges.filter((edge) => edge.from !== edge.to && ranks[edge.to] !== ranks[edge.from] + 1).length
    const canvasWidth = groupMargin + contentWidth + groupMargin + backEdges * 2 + 3
    const canvasHeight = y + groupMargin + 3
    if (maxWidth && canvasWidth > maxWidth) throw new RangeError("diagram-too-wide")
    const canvas = new UnicodeCanvas(canvasWidth, canvasHeight)
    drawGroups(canvas, graph, placed)
    graph.nodes.forEach((node, index) => drawNode(canvas, placed[index], node, measured[index]))
    drawVerticalEdges(canvas, graph, placed, ranks, plans, groupMargin + contentWidth)
    canvas.finalizeConnections()
    if (graph.direction === DIRECTION.UP) canvas.flipVertical()
    return canvas
  }

  const columnHeights = rows.map((row) => row.reduce((sum, node) => sum + measured[node].height, 0) + Math.max(0, row.length - 1) * GAP_ALONG_RANK)
  const contentHeight = Math.max(1, ...columnHeights)
  for (let rank = 0; rank < rows.length; rank += 1) {
    let y = groupMargin + Math.floor((contentHeight - columnHeights[rank]) / 2)
    for (const node of rows[rank]) {
      placed[node] = { x: 0, y, width: measured[node].width, height: measured[node].height, rank: ranks[node] }
      y += measured[node].height + GAP_ALONG_RANK
    }
  }
  const { plans, bandCounts } = trackPlan(graph, ranks, placed, rows.length, true)
  let x = groupMargin
  for (let rank = 0; rank < rows.length; rank += 1) {
    const columnWidth = Math.max(...rows[rank].map((node) => measured[node].width))
    for (const node of rows[rank]) {
      placed[node].x = x + Math.floor((columnWidth - measured[node].width) / 2)
      finishPlacement(placed[node])
    }
    x += columnWidth + (rank < rows.length - 1 ? BASE_BAND_GAP + bandCounts[rank] : 0)
  }
  const backEdges = graph.edges.filter((edge) => edge.from !== edge.to && ranks[edge.to] !== ranks[edge.from] + 1).length
  const canvasWidth = x + groupMargin + 3
  const canvasHeight = groupMargin + contentHeight + groupMargin + backEdges * 2 + 3
  if (maxWidth && canvasWidth > maxWidth) throw new RangeError("diagram-too-wide")
  const canvas = new UnicodeCanvas(canvasWidth, canvasHeight)
  drawGroups(canvas, graph, placed)
  graph.nodes.forEach((node, index) => drawNode(canvas, placed[index], node, measured[index]))
  drawHorizontalEdges(canvas, graph, placed, ranks, plans, groupMargin + contentHeight)
  canvas.finalizeConnections()
  if (graph.direction === DIRECTION.LEFT) canvas.flipHorizontal()
  return canvas
}
