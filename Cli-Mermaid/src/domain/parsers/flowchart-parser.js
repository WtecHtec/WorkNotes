import { Graph, directionFromToken } from "../model.js"
import { cleanLabel, edgeStyle, parseNodeToken, splitOutside, splitStatements, tokenizeEdgeChain } from "./common.js"

/** 解析单个或 fan-out 节点表达式，并把节点合并进当前 Graph。 */
function addNodeExpression(graph, expression, group) {
  const result = []
  for (const token of splitOutside(expression, "&")) {
    const node = parseNodeToken(token)
    if (!node) return null
    result.push(graph.addNode(node.id, {
      ...(node.explicitLabel ? { label: node.label, shape: node.shape } : {}),
      group,
    }))
  }
  return result
}

/** 将 graph/flowchart Mermaid 源码解析为统一 Graph 领域模型。 */
export function parseFlowchart(source) {
  const statements = splitStatements(source)
  const header = statements[0]?.match(/^(?:graph|flowchart)\s*([A-Za-z]{2})?/i)
  if (!header) return null
  const graph = new Graph(directionFromToken(header[1]))
  const groupStack = []

  for (const statement of statements.slice(1)) {
    const first = statement.split(/\s+/u)[0]?.toLowerCase()
    if (first === "direction") {
      graph.direction = directionFromToken(statement.split(/\s+/u)[1])
      continue
    }
    if (first === "subgraph") {
      const declaration = statement.slice("subgraph".length).trim()
      const bracket = declaration.match(/^([\w:.-]+)\s*\[(.*)\]$/u)
      const quoted = declaration.match(/^([\w:.-]+)\s+["'](.+)["']$/u)
      const id = bracket?.[1] || quoted?.[1] || declaration.split(/\s+/u)[0]
      const label = cleanLabel(bracket?.[2] || quoted?.[2] || declaration.slice(id.length).trim() || id)
      const parent = groupStack.at(-1) ?? null
      groupStack.push(graph.addGroup(id, label, parent))
      continue
    }
    if (first === "end") {
      groupStack.pop()
      continue
    }
    if (["style", "classdef", "class", "click", "linkstyle"].includes(first)) continue

    const chain = tokenizeEdgeChain(statement)
    if (!chain) {
      const nodes = addNodeExpression(graph, statement, groupStack.at(-1) ?? null)
      if (!nodes) return null
      continue
    }

    const parsedGroups = chain.nodes.map((node) => addNodeExpression(
      graph,
      node,
      groupStack.at(-1) ?? null,
    ))
    if (parsedGroups.some((group) => !group)) return null
    for (let index = 0; index < chain.operators.length; index += 1) {
      const operation = chain.operators[index]
      const style = edgeStyle(operation.operator)
      for (const left of parsedGroups[index]) {
        for (const right of parsedGroups[index + 1]) {
          const from = style.reverse ? right : left
          const to = style.reverse ? left : right
          graph.addEdge(from, to, {
            ...style,
            label: operation.label,
            headFrom: style.reverse ? style.headTo : style.headFrom,
            headTo: style.reverse ? style.headFrom : style.headTo,
          })
        }
      }
    }
  }
  return graph.nodes.length ? { kind: "flowchart", graph } : null
}
