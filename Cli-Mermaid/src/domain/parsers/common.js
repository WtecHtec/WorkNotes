import { HEAD, LINE_KIND, SHAPE } from "../constants.js"

/** 去掉引号外的 Mermaid 注释，避免标签中的 %% 被误删。 */
/** 去掉引号外的 Mermaid %% 注释，保留标签中的字面百分号。 */
function stripComment(line) {
  let quote = null
  for (let index = 0; index < line.length - 1; index += 1) {
    const char = line[index]
    if ((char === '"' || char === "'") && line[index - 1] !== "\\") {
      quote = quote === char ? null : (quote || char)
    }
    if (!quote && char === "%" && line[index + 1] === "%") {
      return line.slice(0, index)
    }
  }
  return line
}

/** Mermaid 允许一行多条分号语句；这里只在引号外拆分。 */
export function splitStatements(source) {
  const statements = []
  for (const rawLine of String(source).replace(/\r\n?/g, "\n").split("\n")) {
    const line = stripComment(rawLine)
    let quote = null
    let current = ""
    for (let index = 0; index < line.length; index += 1) {
      const char = line[index]
      if ((char === '"' || char === "'") && line[index - 1] !== "\\") {
        quote = quote === char ? null : (quote || char)
      }
      if (char === ";" && !quote) {
        if (current.trim()) statements.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }
    if (current.trim()) statements.push(current.trim())
  }
  return statements
}

const NAMED_ENTITIES = Object.freeze({
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
})

/** 解码命名和数字 HTML 实体，并兼容常见的双重转义输入。 */
export function decodeHtmlEntities(value) {
  let result = String(value)
  // 两轮解码覆盖 &amp;lt; 这类模型常见的双重转义。
  for (let pass = 0; pass < 2; pass += 1) {
    result = result.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (whole, body) => {
      if (body[0] === "#") {
        const hex = body[1]?.toLowerCase() === "x"
        const number = Number.parseInt(body.slice(hex ? 2 : 1), hex ? 16 : 10)
        return Number.isFinite(number) ? String.fromCodePoint(number) : whole
      }
      return NAMED_ENTITIES[body.toLowerCase()] ?? whole
    })
  }
  return result
}

/** 清理 Mermaid 标签中的引号、简单 Markdown 和格式化 HTML 标签。 */
export function cleanLabel(raw) {
  let label = String(raw).trim()
  if ((label.startsWith('"') && label.endsWith('"'))
    || (label.startsWith("'") && label.endsWith("'"))) {
    label = label.slice(1, -1)
  }
  label = label
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?(?:b|strong|i|em|code|span|small|sub|sup)(?:\s[^>]*)?>/gi, "")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
  return decodeHtmlEntities(label).trim()
}

/** 在括号和引号之外拆分，供 fan-out 节点表达式使用。 */
export function splitOutside(value, separator) {
  const parts = []
  let current = ""
  let quote = null
  const stack = []
  const pairs = { "[": "]", "(": ")", "{": "}" }
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]
    if ((char === '"' || char === "'") && value[index - 1] !== "\\") {
      quote = quote === char ? null : (quote || char)
    }
    if (!quote) {
      if (pairs[char]) stack.push(pairs[char])
      else if (stack.at(-1) === char) stack.pop()
      if (stack.length === 0 && char === separator) {
        if (current.trim()) parts.push(current.trim())
        current = ""
        continue
      }
    }
    current += char
  }
  if (current.trim()) parts.push(current.trim())
  return parts
}

/** 从指定位置开始寻找配对闭合符，忽略引号内部的括号字符。 */
function findClosing(value, start, open, close) {
  let depth = 0
  let quote = null
  for (let index = start; index < value.length; index += 1) {
    const char = value[index]
    if ((char === '"' || char === "'") && value[index - 1] !== "\\") {
      quote = quote === char ? null : (quote || char)
    }
    if (quote) continue
    if (char === open) depth += 1
    if (char === close) {
      depth -= 1
      if (depth === 0) return index
    }
  }
  return -1
}

/** 解析 Mermaid 节点表达式，未知装饰会退化为普通矩形。 */
export function parseNodeToken(raw) {
  const value = String(raw).trim()
  const idMatch = value.match(/^([\w:.-]+)/u)
  if (!idMatch) return null
  const id = idMatch[1]
  const rest = value.slice(id.length).trim()
  if (!rest) return { id, label: id, shape: SHAPE.RECT, explicitLabel: false }

  let open = rest[0]
  let close = open === "[" ? "]" : open === "(" ? ")" : open === "{" ? "}" : null
  if (!close) return { id, label: id, shape: SHAPE.RECT, explicitLabel: false }
  let start = 0
  let shape = SHAPE.RECT
  if (open === "(") shape = SHAPE.ROUND
  if (open === "{") shape = SHAPE.DIAMOND

  // Mermaid 的 ((text)) 与 ([text]) 都按圆角节点处理。
  if (rest.startsWith("((")) {
    start = 1
    open = "("
    close = ")"
    shape = SHAPE.ROUND
  } else if (rest.startsWith("([")) {
    const end = rest.lastIndexOf("])")
    if (end >= 2) return { id, label: cleanLabel(rest.slice(2, end)), shape: SHAPE.ROUND, explicitLabel: true }
  }

  const end = findClosing(rest, start, open, close)
  if (end < 0) return null
  const label = rest.slice(start + 1, end)
  return { id, label: cleanLabel(label), shape, explicitLabel: true }
}

const EDGE_OPERATORS = [
  "<-.->", "<==>", "<-->", "-.->", "==>", "<--", "-->",
  "--x", "--o", "x--", "o--", "-.-", "===", "---", "--",
]

/** 检查当前位置是否存在受支持的 Flowchart 边操作符。 */
function operatorAt(value, index) {
  return EDGE_OPERATORS.find((operator) => value.startsWith(operator, index)) || null
}

/**
 * 将 A -->|label| B --> C 转换为节点段与边操作符。
 * 扫描器只在节点括号之外识别操作符，标签中的箭头不会误触发。
 */
export function tokenizeEdgeChain(statement) {
  const nodes = []
  const operators = []
  let quote = null
  const stack = []
  let current = ""
  const pairs = { "[": "]", "(": ")", "{": "}" }

  for (let index = 0; index < statement.length;) {
    const char = statement[index]
    if ((char === '"' || char === "'") && statement[index - 1] !== "\\") {
      quote = quote === char ? null : (quote || char)
    }
    if (!quote) {
      if (pairs[char]) stack.push(pairs[char])
      else if (stack.at(-1) === char) stack.pop()
    }
    const operator = !quote && stack.length === 0 ? operatorAt(statement, index) : null
    if (!operator) {
      current += char
      index += 1
      continue
    }

    nodes.push(current.trim())
    current = ""
    index += operator.length
    while (/\s/u.test(statement[index] || "")) index += 1
    let label = null
    if (statement[index] === "|") {
      const end = statement.indexOf("|", index + 1)
      if (end < 0) return null
      label = cleanLabel(statement.slice(index + 1, end))
      index = end + 1
    }
    operators.push({ operator, label })
  }
  nodes.push(current.trim())
  if (operators.length === 0 || nodes.some((node) => !node)) return null
  return { nodes, operators }
}

/** 将边操作符归一化为方向、端点图形和实线/虚线/粗线属性。 */
export function edgeStyle(operator) {
  const dotted = operator.includes(".")
  const thick = operator.includes("=")
  let headFrom = HEAD.NONE
  let headTo = HEAD.NONE
  if (operator.startsWith("<")) headFrom = HEAD.ARROW
  if (operator.endsWith(">")) headTo = HEAD.ARROW
  if (operator.startsWith("o")) headFrom = HEAD.CIRCLE
  if (operator.endsWith("o")) headTo = HEAD.CIRCLE
  if (operator.startsWith("x")) headFrom = HEAD.CROSS
  if (operator.endsWith("x")) headTo = HEAD.CROSS
  return {
    reverse: operator.startsWith("<") && !operator.endsWith(">"),
    headFrom,
    headTo,
    line: dotted ? LINE_KIND.DOTTED : thick ? LINE_KIND.THICK : LINE_KIND.SOLID,
  }
}
