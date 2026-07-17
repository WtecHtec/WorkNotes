import { LIMITS, LINE_KIND, SHAPE } from "../constants.js"
import { Graph } from "../model.js"
import { cleanLabel, splitStatements } from "./common.js"

/** 把 Mermaid ER 端点符号转换为可显示的基数字符串。 */
function cardinality(value) {
  switch (value) {
    case "|o": case "o|": return "0..1"
    case "||": return "1"
    case "}o": case "o{": return "0..*"
    case "}|": case "|{": return "1..*"
    default: return null
  }
}

/** 确保实体节点和属性容器存在，并解析可选的实体别名。 */
function ensureEntity(graph, infos, raw) {
  const alias = raw.match(/^([\w:.-]+)\[(.*)\]$/u)
  const id = alias?.[1] || raw
  const index = graph.addNode(id, { label: alias ? cleanLabel(alias[2]) : id, shape: SHAPE.RECT })
  if (!infos[index]) infos[index] = []
  return index
}

/** 将 erDiagram 源码解析为实体分栏与关系边。 */
export function parseEr(source) {
  const statements = splitStatements(source)
  if (!/^erDiagram\b/i.test(statements[0] || "")) return null
  const graph = new Graph()
  const infos = []
  let current = null

  for (const statement of statements.slice(1)) {
    if (current !== null) {
      if (statement === "}") {
        current = null
      } else {
        const value = cleanLabel(statement.split(/\s+"/u)[0])
        const target = infos[current]
        if (target.length < LIMITS.maxMembers) target.push(value)
        else if (target.at(-1) !== "…") target.push("…")
      }
      continue
    }
    const relation = statement.match(/^([^\s]+)\s+([|o}{.\-]{6})\s+([^\s:]+)(?:\s*:\s*(.*))?$/u)
    if (relation) {
      const operator = relation[2]
      const leftCard = cardinality(operator.slice(0, 2))
      const rightCard = cardinality(operator.slice(4, 6))
      const connector = operator.slice(2, 4)
      if (!leftCard || !rightCard || !["--", ".."].includes(connector)) return null
      const from = ensureEntity(graph, infos, relation[1])
      const to = ensureEntity(graph, infos, relation[3])
      graph.addEdge(from, to, {
        label: [leftCard, cleanLabel(relation[4] || ""), rightCard].filter(Boolean).join(" "),
        headFrom: "none",
        headTo: "none",
        line: connector === ".." ? LINE_KIND.DOTTED : LINE_KIND.SOLID,
      })
      continue
    }
    const declaration = statement.match(/^([^\s{]+)\s*(\{)?$/u)
    if (!declaration) return null
    const index = ensureEntity(graph, infos, declaration[1])
    if (declaration[2]) current = index
  }

  for (let index = 0; index < graph.nodes.length; index += 1) {
    graph.nodes[index].sections = [[graph.nodes[index].label], infos[index] || []]
  }
  return graph.nodes.length ? { kind: "er", graph } : null
}
