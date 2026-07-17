import { LIMITS, LINE_KIND, ROLE, ROLE_NAME } from "../constants.js"
import { displayWidth, graphemes, graphemeWidth } from "../unicode.js"

const U = 1
const D = 2
const L = 4
const R = 8
const CONT = "\0"

const STYLE = Object.freeze({
  [LINE_KIND.SOLID]: 1,
  [LINE_KIND.DOTTED]: 2,
  [LINE_KIND.THICK]: 4,
})

/** 把上下左右连接位组合转换为标准轻型框线字符。 */
function maskChar(mask) {
  switch (mask) {
    case U: case D: case U | D: return "│"
    case L: case R: case L | R: return "─"
    case D | R: return "┌"
    case D | L: return "┐"
    case U | R: return "└"
    case U | L: return "┘"
    case U | D | R: return "├"
    case U | D | L: return "┤"
    case D | L | R: return "┬"
    case U | L | R: return "┴"
    default: return "┼"
  }
}

/** 根据线型把轻型框线转换为虚线或粗线字符。 */
function styledChar(char, style) {
  if (style === STYLE[LINE_KIND.DOTTED]) {
    if (char === "─") return "╌"
    if (char === "│") return "╎"
  }
  if (style === STYLE[LINE_KIND.THICK]) {
    return ({
      "─": "━", "│": "┃", "┌": "┏", "┐": "┓", "└": "┗", "┘": "┛",
      "├": "┣", "┤": "┫", "┬": "┳", "┴": "┻", "┼": "╋",
    })[char] || char
  }
  return char
}

/** 返回字符在垂直镜像后的等价字形，用于 BT 方向。 */
function flipVerticalGlyph(char) {
  return ({
    "┌": "└", "└": "┌", "┐": "┘", "┘": "┐",
    "┏": "┗", "┗": "┏", "┓": "┛", "┛": "┓",
    "╭": "╰", "╰": "╭", "╮": "╯", "╯": "╮",
    "┬": "┴", "┴": "┬", "┳": "┻", "┻": "┳",
    "▼": "▲", "▲": "▼", "▽": "△", "△": "▽",
  })[char] || char
}

/** 返回字符在水平镜像后的等价字形，用于 RL 方向。 */
function flipHorizontalGlyph(char) {
  return ({
    "┌": "┐", "┐": "┌", "└": "┘", "┘": "└",
    "┏": "┓", "┓": "┏", "┗": "┛", "┛": "┗",
    "╭": "╮", "╮": "╭", "╰": "╯", "╯": "╰",
    "├": "┤", "┤": "├", "┣": "┫", "┫": "┣",
    "▶": "◀", "◀": "▶", "▷": "◁", "◁": "▷",
  })[char] || char
}

/** 表示申请的字符画布超过安全单元格限制。 */
export class CanvasSizeError extends Error {
  /** 记录失败的宽高，生成可供应用层识别的异常。 */
  constructor(width, height) {
    super(`画布尺寸 ${width}×${height} 超过安全限制`)
    this.name = "CanvasSizeError"
  }
}

/**
 * 与平台无关的字符画布。
 *
 * 字符、角色、连接位分别存储，避免每个单元格创建对象；Node 和浏览器
 * 可以共享同一份实现。occupied 用于阻止边穿过节点与分组边框。
 */
export class UnicodeCanvas {
  /** 分配字符数组和紧凑 TypedArray，不为单元格创建对象。 */
  constructor(width, height) {
    if (width <= 0 || height <= 0 || width * height > LIMITS.maxCanvasCells) {
      throw new CanvasSizeError(width, height)
    }
    this.width = width
    this.height = height
    this.chars = new Array(width * height).fill(" ")
    this.roles = new Uint8Array(width * height)
    this.masks = new Uint8Array(width * height)
    this.lineStyles = new Uint8Array(width * height)
    this.occupied = new Uint8Array(width * height)
    this.currentLineKind = LINE_KIND.SOLID
  }

  /** 把二维坐标转换为各内部数组共用的一维下标。 */
  index(x, y) {
    return y * this.width + x
  }

  /** 判断坐标是否位于当前画布的有效边界内。 */
  inside(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height
  }

  /** 写入显式字符与语义角色，并清除该格已有的连线掩码。 */
  set(x, y, char, role = ROLE.EMPTY, occupied = false) {
    if (!this.inside(x, y)) return
    const index = this.index(x, y)
    this.chars[index] = char
    this.roles[index] = role
    // 显式字符（包括文本中的空格）优先于先前的连线掩码。
    this.masks[index] = 0
    this.lineStyles[index] = 0
    if (occupied) this.occupied[index] = 1
  }

  /** 清空单元格的字符、角色、连线和占用状态。 */
  clearCell(x, y) {
    if (!this.inside(x, y)) return
    const index = this.index(x, y)
    this.chars[index] = " "
    this.roles[index] = ROLE.EMPTY
    this.masks[index] = 0
    this.lineStyles[index] = 0
    this.occupied[index] = 0
  }

  /** 按字素和显示宽度写入文本，用 CONT 标记双宽字符的后续列。 */
  setText(x, y, text, role = ROLE.NODE_TEXT, occupied = false) {
    let cursor = x
    for (const grapheme of graphemes(String(text))) {
      const width = Math.max(1, graphemeWidth(grapheme))
      this.set(cursor, y, grapheme, role, occupied)
      for (let offset = 1; offset < width; offset += 1) {
        this.set(cursor + offset, y, CONT, role, occupied)
      }
      cursor += width
    }
  }

  /** 给未占用单元格累加方向连接位与当前线型。 */
  addBits(x, y, bits) {
    if (!this.inside(x, y)) return
    const index = this.index(x, y)
    if (this.occupied[index]) return
    this.masks[index] |= bits
    this.lineStyles[index] |= STYLE[this.currentLineKind]
    this.roles[index] = ROLE.EDGE
  }

  /** 在两点之间写入水平连接位，端点只携带实际存在的方向。 */
  segmentHorizontal(y, x0, x1) {
    const start = Math.min(x0, x1)
    const end = Math.max(x0, x1)
    for (let x = start; x <= end; x += 1) {
      let bits = 0
      if (x > start) bits |= L
      if (x < end) bits |= R
      this.addBits(x, y, bits)
    }
  }

  /** 在两点之间写入垂直连接位，端点只携带实际存在的方向。 */
  segmentVertical(x, y0, y1) {
    const start = Math.min(y0, y1)
    const end = Math.max(y0, y1)
    for (let y = start; y <= end; y += 1) {
      let bits = 0
      if (y > start) bits |= U
      if (y < end) bits |= D
      this.addBits(x, y, bits)
    }
  }

  /** 将积累的连接位一次性光栅化为转角、交叉和直线字符。 */
  finalizeConnections() {
    for (let index = 0; index < this.chars.length; index += 1) {
      if (this.masks[index] && this.chars[index] === " ") {
        this.chars[index] = styledChar(maskChar(this.masks[index]), this.lineStyles[index])
      }
    }
  }

  /** 垂直翻转画布与方向字形，复用 TD 布局实现 BT。 */
  flipVertical() {
    for (let y = 0; y < Math.floor(this.height / 2); y += 1) {
      const otherY = this.height - 1 - y
      for (let x = 0; x < this.width; x += 1) {
        const left = this.index(x, y)
        const right = this.index(x, otherY)
        ;[this.chars[left], this.chars[right]] = [this.chars[right], this.chars[left]]
        ;[this.roles[left], this.roles[right]] = [this.roles[right], this.roles[left]]
      }
    }
    this.chars = this.chars.map(flipVerticalGlyph)
  }

  /** 水平翻转画布与方向字形，并恢复翻转后的文本阅读顺序。 */
  flipHorizontal() {
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < Math.floor(this.width / 2); x += 1) {
        const otherX = this.width - 1 - x
        const left = this.index(x, y)
        const right = this.index(otherX, y)
        ;[this.chars[left], this.chars[right]] = [this.chars[right], this.chars[left]]
        ;[this.roles[left], this.roles[right]] = [this.roles[right], this.roles[left]]
      }
    }
    this.chars = this.chars.map(flipHorizontalGlyph)

    // 几何翻转会把文本倒序；按语义角色重建文本段，让标签仍按阅读顺序显示。
    const textRoles = new Set([ROLE.NODE_TEXT, ROLE.EDGE_LABEL, ROLE.TITLE])
    for (let y = 0; y < this.height; y += 1) {
      let x = 0
      while (x < this.width) {
        const role = this.roles[this.index(x, y)]
        if (!textRoles.has(role)) {
          x += 1
          continue
        }
        const start = x
        let text = ""
        while (x < this.width && this.roles[this.index(x, y)] === role) {
          const char = this.chars[this.index(x, y)]
          if (char !== CONT) text += char
          x += 1
        }
        const end = x
        for (let cursor = start; cursor < end; cursor += 1) this.clearCell(cursor, y)
        this.setText(start, y, Array.from(text).reverse().join(""), role)
      }
    }
  }

  /** 把内部网格导出为纯文本行和带语义角色的样式片段。 */
  toArt(metadata = {}) {
    const plainLines = []
    const styledLines = []
    for (let y = 0; y < this.height; y += 1) {
      let last = -1
      for (let x = this.width - 1; x >= 0; x -= 1) {
        const char = this.chars[this.index(x, y)]
        if (char !== " " && char !== CONT) {
          last = x
          break
        }
      }
      if (last < 0) {
        plainLines.push("")
        styledLines.push([])
        continue
      }

      let plain = ""
      const spans = []
      let run = ""
      let runRole = ROLE.EMPTY
      for (let x = 0; x <= last; x += 1) {
        const index = this.index(x, y)
        const char = this.chars[index]
        if (char === CONT) continue
        const role = this.roles[index]
        plain += char
        if (role !== runRole && run) {
          spans.push({ text: run, role: ROLE_NAME[runRole] })
          run = ""
        }
        runRole = role
        run += char
      }
      if (run) spans.push({ text: run, role: ROLE_NAME[runRole] })
      plainLines.push(plain.trimEnd())
      styledLines.push(spans)
    }
    while (plainLines.at(-1) === "") {
      plainLines.pop()
      styledLines.pop()
    }
    while (plainLines[0] === "") {
      plainLines.shift()
      styledLines.shift()
    }
    return { plainLines, styledLines, width: Math.max(0, ...plainLines.map(displayWidth)), ...metadata }
  }
}
