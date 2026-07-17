/**
 * 领域层的容量限制。
 *
 * 限制属于渲染规则，而不是 CLI 或浏览器配置，因此集中放在领域层。
 * 它们防止恶意或意外输入创建过大的图和画布。
 */
export const LIMITS = Object.freeze({
  maxNodes: 128,
  maxEdges: 512,
  maxGroups: 24,
  maxGroupDepth: 6,
  maxCanvasCells: 1 << 21,
  maxMembers: 8,
  wrapWidth: 24,
  maxLabelLines: 4,
  maxEdgeLabel: 28,
})

export const DIRECTION = Object.freeze({
  DOWN: "down",
  UP: "up",
  RIGHT: "right",
  LEFT: "left",
})

export const SHAPE = Object.freeze({
  RECT: "rect",
  ROUND: "round",
  DIAMOND: "diamond",
})

export const LINE_KIND = Object.freeze({
  SOLID: "solid",
  DOTTED: "dotted",
  THICK: "thick",
})

export const HEAD = Object.freeze({
  NONE: "none",
  ARROW: "arrow",
  CIRCLE: "circle",
  CROSS: "cross",
  TRIANGLE: "triangle",
  DIAMOND_FILL: "diamond-fill",
  DIAMOND_OPEN: "diamond-open",
})

/** Canvas 单元格的语义角色。外围适配器只依赖这些稳定角色。 */
export const ROLE = Object.freeze({
  EMPTY: 0,
  BORDER: 1,
  NODE_TEXT: 2,
  EDGE: 3,
  EDGE_LABEL: 4,
  TITLE: 5,
})

export const ROLE_NAME = Object.freeze({
  [ROLE.EMPTY]: "empty",
  [ROLE.BORDER]: "border",
  [ROLE.NODE_TEXT]: "nodeText",
  [ROLE.EDGE]: "edge",
  [ROLE.EDGE_LABEL]: "edgeLabel",
  [ROLE.TITLE]: "title",
})
