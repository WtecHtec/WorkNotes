import { layoutGraph } from "../domain/layout/graph-layout.js"
import { layoutSequence } from "../domain/layout/sequence-layout.js"
import { parseDiagram } from "../domain/parsers/index.js"
import { renderFallback } from "../domain/rendering/fallback-renderer.js"

/**
 * 应用用例：把 Mermaid 源码编排为与平台无关的字符图结果。
 *
 * 领域异常在这一层被转换为 fallback；适配器无需理解解析或布局错误。
 */
export function renderMermaid(source, options = {}) {
  const text = String(source ?? "")
  if (!text.trim()) return null
  const maxWidth = Number.isFinite(options.maxWidth) && options.maxWidth > 0
    ? Math.floor(options.maxWidth)
    : null

  try {
    const parsed = parseDiagram(text)
    if (!parsed) return renderFallback(text, maxWidth, "unsupported-or-invalid")
    const canvas = parsed.kind === "sequence"
      ? layoutSequence(parsed.sequence, maxWidth)
      : layoutGraph(parsed.graph, maxWidth)
    return canvas.toArt({ fallback: false, reason: null, diagramType: parsed.kind })
  } catch (error) {
    const reason = error instanceof RangeError && error.message === "diagram-too-wide"
      ? "too-wide"
      : error?.name === "DiagramLimitError" || error?.name === "CanvasSizeError"
        ? "limit-exceeded"
        : "invalid-diagram"
    return renderFallback(text, maxWidth, reason)
  }
}
