const segmenter = typeof Intl !== "undefined" && Intl.Segmenter
  ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
  : null

/** 按用户可见字素切分，避免把 Emoji 的代理对或 ZWJ 序列拆开。 */
export function graphemes(text) {
  if (!segmenter) return Array.from(text)
  return Array.from(segmenter.segment(text), (item) => item.segment)
}

/** 判断 code point 是否为组合符、控制符或其他零显示宽度字符。 */
function isZeroWidth(codePoint, char) {
  return codePoint === 0
    || codePoint === 0x200d
    || (codePoint >= 0xfe00 && codePoint <= 0xfe0f)
    || (codePoint >= 0xe0100 && codePoint <= 0xe01ef)
    || /\p{Mark}/u.test(char)
}

// 与常见 wcwidth 实现保持相同思路：这些区段在终端中通常占两个单元格。
/** 判断 code point 在终端单元格模型中是否通常占两个显示列。 */
function isFullWidth(codePoint) {
  if (codePoint < 0x1100) return false
  return codePoint <= 0x115f
    || codePoint === 0x2329
    || codePoint === 0x232a
    || (codePoint >= 0x2e80 && codePoint <= 0x3247 && codePoint !== 0x303f)
    || (codePoint >= 0x3250 && codePoint <= 0x4dbf)
    || (codePoint >= 0x4e00 && codePoint <= 0xa4c6)
    || (codePoint >= 0xa960 && codePoint <= 0xa97c)
    || (codePoint >= 0xac00 && codePoint <= 0xd7a3)
    || (codePoint >= 0xf900 && codePoint <= 0xfaff)
    || (codePoint >= 0xfe10 && codePoint <= 0xfe19)
    || (codePoint >= 0xfe30 && codePoint <= 0xfe6b)
    || (codePoint >= 0xff01 && codePoint <= 0xff60)
    || (codePoint >= 0xffe0 && codePoint <= 0xffe6)
    || (codePoint >= 0x1b000 && codePoint <= 0x1b2ff)
    || (codePoint >= 0x1f200 && codePoint <= 0x1f251)
    || (codePoint >= 0x20000 && codePoint <= 0x3fffd)
}

/** 返回单个字素在终端单元格模型中的宽度。 */
export function graphemeWidth(grapheme) {
  if (!grapheme) return 0
  // Emoji 序列可能包含多个 code point，但视觉上通常只占两个单元格。
  if (/\p{Extended_Pictographic}/u.test(grapheme)
    || /^\p{Regional_Indicator}{2}$/u.test(grapheme)) return 2

  let width = 0
  for (const char of Array.from(grapheme)) {
    const codePoint = char.codePointAt(0)
    if (isZeroWidth(codePoint, char)) continue
    if (codePoint < 32 || (codePoint >= 0x7f && codePoint < 0xa0)) continue
    width += isFullWidth(codePoint) ? 2 : 1
  }
  return width
}

/** 累加各字素的显示列宽，得到平台一致的文本宽度。 */
export function displayWidth(text) {
  let width = 0
  for (const grapheme of graphemes(String(text))) width += graphemeWidth(grapheme)
  return width
}

/**
 * 按显示列截断文本，而不是按 UTF-16 长度截断。
 * 省略号也计入宽度，保证节点边框不会被撑开。
 */
export function fitText(text, maxWidth, ellipsis = "…") {
  const source = String(text)
  if (displayWidth(source) <= maxWidth) return source
  if (maxWidth <= 0) return ""
  const ellipsisWidth = displayWidth(ellipsis)
  const target = Math.max(0, maxWidth - ellipsisWidth)
  let out = ""
  let width = 0
  for (const grapheme of graphemes(source)) {
    const next = graphemeWidth(grapheme)
    if (width + next > target) break
    out += grapheme
    width += next
  }
  return out + (ellipsisWidth <= maxWidth ? ellipsis : "")
}

const BREAK_CHARS = new Set(["_", "-", ".", "/"])

/** 将节点标签包装成有限行数，优先在空格和标识符边界换行。 */
export function wrapLabel(text, maxWidth, maxLines) {
  const source = String(text).trim()
  if (!source) return [""]

  const units = graphemes(source)
  const lines = []
  let current = ""
  let currentWidth = 0
  let lastBreak = -1

  /** 将当前缓冲提交为一行，必要时按最大宽度追加省略号。 */
  const flush = (forceEllipsis = false) => {
    if (!current && !forceEllipsis) return
    const value = forceEllipsis ? fitText(current, maxWidth) : current.trim()
    lines.push(value)
    current = ""
    currentWidth = 0
    lastBreak = -1
  }

  for (let index = 0; index < units.length; index += 1) {
    const unit = units[index]
    const width = graphemeWidth(unit)
    if (currentWidth + width <= maxWidth || current.length === 0) {
      current += unit
      currentWidth += width
      if (/\s/u.test(unit) || BREAK_CHARS.has(unit)) lastBreak = current.length
      continue
    }

    if (lastBreak > 0) {
      const head = current.slice(0, lastBreak).trimEnd()
      const tail = current.slice(lastBreak).trimStart()
      lines.push(head)
      current = tail + unit
      currentWidth = displayWidth(current)
    } else {
      flush()
      current = unit
      currentWidth = width
    }

    if (lines.length === maxLines - 1 && index < units.length - 1) {
      current += units.slice(index + 1).join("")
      flush(true)
      return lines
    }
  }
  flush()
  return lines.slice(0, maxLines)
}
