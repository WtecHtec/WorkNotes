import { DIRECTION, HEAD, LIMITS, LINE_KIND, SHAPE } from "./constants.js"

/** 表示 Mermaid 输入超过领域容量限制，供应用层统一降级。 */
export class DiagramLimitError extends Error {
  /** 保存可读的容量错误信息，不携带 UI 或运行时细节。 */
  constructor(message) {
    super(message)
    this.name = "DiagramLimitError"
  }
}

/** 维护节点、边、分组和 ID 索引的统一图领域模型。 */
export class Graph {
  /** 创建指定布局方向的空图。 */
  constructor(direction = DIRECTION.DOWN) {
    this.direction = direction
    this.nodes = []
    this.edges = []
    this.index = new Map()
    this.groups = []
  }

  /** 新增或合并节点，返回稳定数组下标并执行节点上限检查。 */
  addNode(id, options = {}) {
    const key = String(id).trim()
    if (!key) throw new Error("节点 ID 不能为空")
    const existing = this.index.get(key)
    if (existing !== undefined) {
      const node = this.nodes[existing]
      if (options.label !== undefined) node.label = options.label
      if (options.shape !== undefined) node.shape = options.shape
      if (options.sections !== undefined) node.sections = options.sections
      // 后续边表达式再次引用节点时，不应把它从已经声明的 subgraph 中移出。
      if (options.group !== undefined && options.group !== null && node.group === null) {
        node.group = options.group
      }
      return existing
    }
    if (this.nodes.length >= LIMITS.maxNodes) {
      throw new DiagramLimitError(`节点数量不能超过 ${LIMITS.maxNodes}`)
    }
    const index = this.nodes.length
    this.index.set(key, index)
    this.nodes.push({
      id: key,
      label: options.label ?? key,
      shape: options.shape ?? SHAPE.RECT,
      sections: options.sections ?? null,
      group: options.group ?? null,
    })
    return index
  }

  /** 新增一条带端点、标签和线型信息的边，并执行边上限检查。 */
  addEdge(from, to, options = {}) {
    if (this.edges.length >= LIMITS.maxEdges) {
      throw new DiagramLimitError(`连线数量不能超过 ${LIMITS.maxEdges}`)
    }
    this.edges.push({
      from,
      to,
      label: options.label || null,
      headFrom: options.headFrom ?? HEAD.NONE,
      headTo: options.headTo ?? HEAD.ARROW,
      line: options.line ?? LINE_KIND.SOLID,
    })
  }

  /** 新增 subgraph，计算嵌套深度并返回分组下标。 */
  addGroup(id, label, parent = null) {
    if (this.groups.length >= LIMITS.maxGroups) {
      throw new DiagramLimitError(`分组数量不能超过 ${LIMITS.maxGroups}`)
    }
    let depth = 1
    let cursor = parent
    while (cursor !== null) {
      depth += 1
      cursor = this.groups[cursor]?.parent ?? null
    }
    if (depth > LIMITS.maxGroupDepth) {
      throw new DiagramLimitError(`分组嵌套不能超过 ${LIMITS.maxGroupDepth} 层`)
    }
    const index = this.groups.length
    this.groups.push({ id, label: label || id, parent })
    return index
  }
}

/** 维护 participant 顺序和纵向事件流的时序图领域模型。 */
export class Sequence {
  /** 创建空的参与者索引和事件集合。 */
  constructor() {
    this.participants = []
    this.index = new Map()
    this.items = []
  }

  /** 查找或创建 participant，保持首次出现顺序并允许更新显示标签。 */
  participant(id, label) {
    const key = String(id).trim()
    const existing = this.index.get(key)
    if (existing !== undefined) {
      if (label) this.participants[existing].label = label
      return existing
    }
    if (this.participants.length >= LIMITS.maxNodes) {
      throw new DiagramLimitError(`参与者数量不能超过 ${LIMITS.maxNodes}`)
    }
    const index = this.participants.length
    this.index.set(key, index)
    this.participants.push({ id: key, label: label || key })
    return index
  }

  /** 追加消息、Note 或 Divider，并执行时序项上限检查。 */
  addItem(item) {
    if (this.items.length >= LIMITS.maxEdges) {
      throw new DiagramLimitError(`时序项数量不能超过 ${LIMITS.maxEdges}`)
    }
    this.items.push(item)
  }
}

/** 将 Mermaid 的 TD/TB/BT/LR/RL 标记归一化为领域方向。 */
export function directionFromToken(token) {
  switch (String(token || "TD").toUpperCase()) {
    case "LR": return DIRECTION.RIGHT
    case "RL": return DIRECTION.LEFT
    case "BT": return DIRECTION.UP
    default: return DIRECTION.DOWN
  }
}
