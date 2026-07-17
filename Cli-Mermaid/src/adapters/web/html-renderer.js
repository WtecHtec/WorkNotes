/** 将不可信文本转义为 HTML 实体，阻止 Mermaid 标签进入浏览器 DOM 语义。 */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export const defaultMermaidUnicodeCss = `
.mermaid-unicode {
  margin: 0;
  overflow: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-variant-ligatures: none;
  line-height: 1.25;
  white-space: pre;
}
.mermaid-unicode__border { color: #22d3ee; }
.mermaid-unicode__nodeText { color: #e5e7eb; }
.mermaid-unicode__edge { color: #94a3b8; }
.mermaid-unicode__edgeLabel { color: #fbbf24; }
.mermaid-unicode__title { color: #e879f9; font-weight: 700; }
`.trim()

/**
 * 返回安全的 HTML 字符串。所有用户输入都经过转义，不使用 innerHTML 解释 Mermaid 标签。
 */
export function renderHtml(art, options = {}) {
  if (!art) return ""
  const className = options.className || "mermaid-unicode"
  const lines = art.styledLines.map((line) => line.map((span) => {
    const roleClass = `${className}__${span.role}`
    return `<span class="${escapeHtml(roleClass)}">${escapeHtml(span.text)}</span>`
  }).join("")).join("\n")
  return `<pre class="${escapeHtml(className)}" role="img" aria-label="${escapeHtml(options.ariaLabel || "Mermaid diagram")}">${lines}</pre>`
}
