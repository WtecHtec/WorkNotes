import { parseClass } from "./class-parser.js"
import { parseEr } from "./er-parser.js"
import { parseFlowchart } from "./flowchart-parser.js"
import { parseSequence } from "./sequence-parser.js"
import { parseState } from "./state-parser.js"

const PARSERS = [parseFlowchart, parseState, parseClass, parseEr, parseSequence]

/** 依次尝试各图类型，返回首个完整模型且不向外泄漏半成品。 */
export function parseDiagram(source) {
  for (const parser of PARSERS) {
    const result = parser(source)
    if (result) return result
  }
  return null
}
