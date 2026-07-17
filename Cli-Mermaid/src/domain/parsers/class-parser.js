import { HEAD, LIMITS, LINE_KIND, SHAPE } from "../constants.js"
import { Graph, directionFromToken } from "../model.js"
import { cleanLabel, splitStatements } from "./common.js"

const RELATIONS = [
  ["<|--", HEAD.TRIANGLE, HEAD.NONE, LINE_KIND.SOLID],
  ["--|>", HEAD.NONE, HEAD.TRIANGLE, LINE_KIND.SOLID],
  ["<|..", HEAD.TRIANGLE, HEAD.NONE, LINE_KIND.DOTTED],
  ["..|>", HEAD.NONE, HEAD.TRIANGLE, LINE_KIND.DOTTED],
  ["*--", HEAD.DIAMOND_FILL, HEAD.NONE, LINE_KIND.SOLID],
  ["--*", HEAD.NONE, HEAD.DIAMOND_FILL, LINE_KIND.SOLID],
  ["o--", HEAD.DIAMOND_OPEN, HEAD.NONE, LINE_KIND.SOLID],
  ["--o", HEAD.NONE, HEAD.DIAMOND_OPEN, LINE_KIND.SOLID],
  ["<..", HEAD.ARROW, HEAD.NONE, LINE_KIND.DOTTED],
  ["..>", HEAD.NONE, HEAD.ARROW, LINE_KIND.DOTTED],
  ["<--", HEAD.ARROW, HEAD.NONE, LINE_KIND.SOLID],
  ["-->", HEAD.NONE, HEAD.ARROW, LINE_KIND.SOLID],
  ["--", HEAD.NONE, HEAD.NONE, LINE_KIND.SOLID],
  ["..", HEAD.NONE, HEAD.NONE, LINE_KIND.DOTTED],
]

/** 确保类节点及其属性容器存在，并返回对应节点下标。 */
function ensureInfo(graph, infos, name) {
  const index = graph.addNode(name, { shape: SHAPE.RECT })
  if (!infos[index]) infos[index] = { annotation: null, attributes: [], methods: [] }
  return index
}

/** 把类成员分配到属性或方法分区，并处理注解与成员上限。 */
function pushMember(info, raw) {
  const annotation = raw.match(/^<<(.+)>>$/u)
  if (annotation) {
    info.annotation = annotation[1].trim()
    return
  }
  const value = cleanLabel(raw.replace(/~/g, (match, offset, source) => {
    const before = source.slice(0, offset).split("~").length - 1
    return before % 2 === 0 ? "<" : ">"
  }))
  const target = value.includes("(") ? info.methods : info.attributes
  if (target.length < LIMITS.maxMembers) target.push(value)
  else if (target.at(-1) !== "…") target.push("…")
}

/** 识别类关系操作符、基数和标签，生成标准边属性。 */
function parseRelation(statement) {
  for (const [operator, headFrom, headTo, line] of RELATIONS) {
    const index = statement.indexOf(operator)
    if (index < 0) continue
    let left = statement.slice(0, index).trim()
    let right = statement.slice(index + operator.length).trim()
    let cardinalityLeft = ""
    let cardinalityRight = ""
    left = left.replace(/\s+"([^"]+)"$/u, (_, value) => { cardinalityLeft = value; return "" }).trim()
    right = right.replace(/^"([^"]+)"\s+/u, (_, value) => { cardinalityRight = value; return "" }).trim()
    const colon = right.indexOf(":")
    const label = colon >= 0 ? cleanLabel(right.slice(colon + 1)) : ""
    if (colon >= 0) right = right.slice(0, colon).trim()
    if (!left || !right || /\s/u.test(left) || /\s/u.test(right)) return null
    return {
      left,
      right,
      headFrom,
      headTo,
      line,
      label: [cardinalityLeft, label, cardinalityRight].filter(Boolean).join(" ") || null,
    }
  }
  return null
}

/** 将 classDiagram 源码解析为带分栏节点和 UML 端点的 Graph。 */
export function parseClass(source) {
  const statements = splitStatements(source)
  if (!/^classDiagram\b/i.test(statements[0] || "")) return null
  const graph = new Graph()
  const infos = []
  let current = null

  for (const statement of statements.slice(1)) {
    if (current !== null) {
      if (statement === "}") current = null
      else pushMember(infos[current], statement)
      continue
    }
    const first = statement.split(/\s+/u)[0]?.toLowerCase()
    if (first === "direction") {
      graph.direction = directionFromToken(statement.split(/\s+/u)[1])
      continue
    }
    if (["note", "callback", "click", "link", "style", "cssclass", "classdef", "namespace", "}"].includes(first)) continue
    const declaration = statement.match(/^class\s+([\w:.-]+)\s*(\{)?$/u)
    if (declaration) {
      const index = ensureInfo(graph, infos, declaration[1])
      if (declaration[2]) current = index
      continue
    }
    const annotation = statement.match(/^<<(.+)>>\s+([\w:.-]+)$/u)
    if (annotation) {
      const index = ensureInfo(graph, infos, annotation[2])
      infos[index].annotation = annotation[1].trim()
      continue
    }
    const relation = parseRelation(statement)
    if (relation) {
      const from = ensureInfo(graph, infos, relation.left)
      const to = ensureInfo(graph, infos, relation.right)
      graph.addEdge(from, to, relation)
      continue
    }
    const member = statement.match(/^([\w:.-]+)\s*:\s*(.+)$/u)
    if (member) {
      const index = ensureInfo(graph, infos, member[1])
      pushMember(infos[index], member[2])
      continue
    }
    return null
  }

  for (let index = 0; index < graph.nodes.length; index += 1) {
    const info = infos[index] || { annotation: null, attributes: [], methods: [] }
    graph.nodes[index].sections = [
      [...(info.annotation ? [`«${info.annotation}»`] : []), graph.nodes[index].label],
      info.attributes,
      info.methods,
    ]
  }
  return graph.nodes.length ? { kind: "class", graph } : null
}
