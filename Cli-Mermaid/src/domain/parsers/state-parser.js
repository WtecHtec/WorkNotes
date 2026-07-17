import { HEAD, LINE_KIND, SHAPE } from "../constants.js"
import { Graph, directionFromToken } from "../model.js"
import { cleanLabel, splitStatements } from "./common.js"

/** 创建普通状态或将 [*] 转换为独立的开始/结束伪状态。 */
function stateNode(graph, id, source) {
  if (id === "[*]") {
    return graph.addNode(source ? "__start__" : "__end__", {
      label: source ? "●" : "◉",
      shape: SHAPE.ROUND,
    })
  }
  return graph.addNode(id, { shape: SHAPE.ROUND })
}

/** 将 stateDiagram 源码解析为圆角状态节点与转换边。 */
export function parseState(source) {
  const statements = splitStatements(source)
  if (!/^stateDiagram(?:-v2)?\b/i.test(statements[0] || "")) return null
  const graph = new Graph()
  let inNote = false

  for (const statement of statements.slice(1)) {
    if (inNote) {
      if (/^end\s+note$/i.test(statement)) inNote = false
      continue
    }
    const first = statement.split(/\s+/u)[0]?.toLowerCase()
    if (first === "direction") {
      graph.direction = directionFromToken(statement.split(/\s+/u)[1])
      continue
    }
    if (first === "note") {
      if (!statement.includes(":")) inNote = true
      continue
    }
    if (["classdef", "class", "hide", "scale", "}"].includes(first)) continue
    if (first === "state") {
      const rest = statement.slice(5).trim().replace(/\{$/u, "").trim()
      const alias = rest.match(/^["'](.+)["']\s+as\s+([\w:.-]+)$/u)
      const choice = rest.match(/^([\w:.-]+)\s+<<choice>>$/u)
      if (alias) graph.addNode(alias[2], { label: cleanLabel(alias[1]), shape: SHAPE.ROUND })
      else if (choice) graph.addNode(choice[1], { label: choice[1], shape: SHAPE.DIAMOND })
      else if (rest && !/\s/u.test(rest)) graph.addNode(rest, { shape: SHAPE.ROUND })
      continue
    }
    if (statement.includes("-->")) {
      const parts = statement.split("-->").map((part) => part.trim())
      let previous = null
      for (let index = 0; index < parts.length - 1; index += 1) {
        const leftId = previous === null ? parts[index].replace(/-+$/u, "").trim() : null
        const [rightPart, label] = parts[index + 1].split(/:(.*)/su)
        const rightId = rightPart.replace(/^-+|[-]+$/gu, "").trim()
        if ((!leftId && previous === null) || !rightId) return null
        const from = previous ?? stateNode(graph, leftId, true)
        const to = stateNode(graph, rightId, false)
        graph.addEdge(from, to, {
          label: label ? cleanLabel(label) : null,
          headTo: HEAD.ARROW,
          line: LINE_KIND.SOLID,
        })
        previous = to
      }
      continue
    }
    const description = statement.match(/^([\w:.-]+)\s*:\s*(.+)$/u)
    if (description) {
      const existing = graph.index.get(description[1])
      const shape = existing === undefined ? SHAPE.ROUND : graph.nodes[existing].shape
      graph.addNode(description[1], { label: cleanLabel(description[2]), shape })
      continue
    }
    if (/^[\w:.-]+$/u.test(statement)) {
      graph.addNode(statement, { shape: SHAPE.ROUND })
      continue
    }
    return null
  }
  return graph.nodes.length ? { kind: "state", graph } : null
}
