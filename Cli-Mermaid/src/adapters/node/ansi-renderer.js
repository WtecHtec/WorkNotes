const DEFAULT_THEME = Object.freeze({
  empty: "",
  border: "\u001b[36m",
  nodeText: "\u001b[37m",
  edge: "\u001b[90m",
  edgeLabel: "\u001b[33m",
  title: "\u001b[1;35m",
})

const RESET = "\u001b[0m"

/** 将平台无关的 styledLines 转换为 ANSI；核心领域层不感知终端。 */
export function renderAnsi(art, options = {}) {
  if (!art) return ""
  if (options.color === false) return art.plainLines.join("\n")
  const theme = { ...DEFAULT_THEME, ...(options.theme || {}) }
  return art.styledLines
    .map((line) => line.map((span) => {
      const prefix = theme[span.role] || ""
      return prefix ? `${prefix}${span.text}${RESET}` : span.text
    }).join(""))
    .join("\n")
}

export { DEFAULT_THEME as defaultAnsiTheme }
