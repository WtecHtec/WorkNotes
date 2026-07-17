/** 构造忽略回边的 DAG，并用最长路径计算每个节点的层级。 */
export function computeRanks(graph) {
  const count = graph.nodes.length
  const children = Array.from({ length: count }, () => [])
  for (const edge of graph.edges) if (edge.from !== edge.to) children[edge.from].push(edge.to)

  const color = new Uint8Array(count)
  const dag = Array.from({ length: count }, () => [])
  const order = []
  /** 深度优先遍历节点；发现指向灰色节点的边时将其视为回边。 */
  const visit = (node) => {
    color[node] = 1
    for (const child of children[node]) {
      if (color[child] === 1) continue
      dag[node].push(child)
      if (color[child] === 0) visit(child)
    }
    color[node] = 2
    order.push(node)
  }
  for (let node = 0; node < count; node += 1) if (!color[node]) visit(node)

  const ranks = new Array(count).fill(0)
  for (const node of order.reverse()) {
    for (const child of dag[node]) ranks[child] = Math.max(ranks[child], ranks[node] + 1)
  }
  return ranks
}

/** 使用双向重心扫描调整同层节点顺序，减少可避免的连线交叉。 */
export function orderRanks(graph, ranks) {
  const maxRank = Math.max(...ranks)
  const rows = Array.from({ length: maxRank + 1 }, () => [])
  ranks.forEach((rank, node) => rows[rank].push(node))

  /** 按相邻层重心重新排序指定层，同时用原顺序保证稳定性。 */
  const sortRow = (rank, neighborRank) => {
    const positions = new Map(rows[neighborRank].map((node, index) => [node, index]))
    const original = new Map(rows[rank].map((node, index) => [node, index]))
    /** 计算节点在相邻层所有连接点位置的算术平均值。 */
    const barycenter = (node) => {
      const neighbors = []
      for (const edge of graph.edges) {
        if (edge.from === node && ranks[edge.to] === neighborRank) neighbors.push(positions.get(edge.to))
        if (edge.to === node && ranks[edge.from] === neighborRank) neighbors.push(positions.get(edge.from))
      }
      return neighbors.length
        ? neighbors.reduce((sum, value) => sum + value, 0) / neighbors.length
        : original.get(node)
    }
    rows[rank].sort((left, right) => barycenter(left) - barycenter(right) || original.get(left) - original.get(right))
  }

  for (let pass = 0; pass < 4; pass += 1) {
    for (let rank = 1; rank <= maxRank; rank += 1) sortRow(rank, rank - 1)
    for (let rank = maxRank - 1; rank >= 0; rank -= 1) sortRow(rank, rank + 1)
  }
  return rows
}

/** 贪心区间着色：重叠连线使用不同轨道，不重叠连线复用轨道。 */
export function assignTracks(intervals) {
  const tracks = []
  const assigned = new Map()
  const sorted = [...intervals].sort((left, right) => left.start - right.start || left.end - right.end)
  for (const interval of sorted) {
    let track = tracks.findIndex((end) => end < interval.start)
    if (track < 0) {
      track = tracks.length
      tracks.push(interval.end)
    } else {
      tracks[track] = interval.end
    }
    assigned.set(interval.edge, track)
  }
  return { assigned, count: Math.max(1, tracks.length) }
}

/** 沿 parent 链计算分组深度，为嵌套边距和容量判断提供依据。 */
export function groupDepth(graph, groupIndex) {
  let depth = 0
  let cursor = groupIndex
  while (cursor !== null && cursor !== undefined) {
    depth += 1
    cursor = graph.groups[cursor]?.parent ?? null
  }
  return depth
}
