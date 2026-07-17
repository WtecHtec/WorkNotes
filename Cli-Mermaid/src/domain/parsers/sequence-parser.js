import { Sequence } from "../model.js"
import { cleanLabel, splitStatements } from "./common.js"

const MESSAGE_OPERATORS = ["-->>", "->>", "--x", "-x", "--)", "-)", "-->", "->"]

/** 在消息语句中选择位置最靠前、长度最精确的时序操作符。 */
function findMessage(statement) {
  let best = null
  for (const operator of MESSAGE_OPERATORS) {
    const index = statement.indexOf(operator)
    if (index >= 0 && (!best || index < best.index || (index === best.index && operator.length > best.operator.length))) {
      best = { index, operator }
    }
  }
  return best
}

/** 将 sequenceDiagram 源码解析为有序 participant 与时序项集合。 */
export function parseSequence(source) {
  const statements = splitStatements(source)
  if (!/^sequenceDiagram\b/i.test(statements[0] || "")) return null
  const sequence = new Sequence()
  const blocks = []
  let autoNumber = false
  let messageNumber = 0

  for (const statement of statements.slice(1)) {
    const first = statement.split(/\s+/u)[0]?.toLowerCase()
    if (first === "participant" || first === "actor") {
      const declaration = statement.slice(first.length).trim()
      const match = declaration.match(/^([^\s]+)(?:\s+as\s+(.+))?$/iu)
      if (!match) return null
      sequence.participant(match[1], match[2] ? cleanLabel(match[2]) : null)
      continue
    }
    if (first === "autonumber") {
      autoNumber = true
      continue
    }
    if (["activate", "deactivate", "create", "destroy", "title", "acctitle", "accdescr", "links", "link", "properties"].includes(first)) continue
    if (first === "note") {
      const note = statement.match(/^note\s+(over|left of|right of)\s+([^:]+)\s*:\s*(.*)$/iu)
      if (!note) return null
      const ids = note[2].split(",").map((id) => sequence.participant(id.trim()))
      sequence.addItem({ type: "note", anchor: note[1].toLowerCase(), participants: ids, text: cleanLabel(note[3]) })
      continue
    }
    if (["loop", "alt", "opt", "par", "critical", "break"].includes(first)) {
      blocks.push(true)
      sequence.addItem({ type: "divider", text: cleanLabel(statement) })
      continue
    }
    if (["else", "and", "option"].includes(first)) {
      if (blocks.at(-1)) sequence.addItem({ type: "divider", text: cleanLabel(statement) })
      continue
    }
    if (first === "rect" || first === "box") {
      blocks.push(false)
      continue
    }
    if (first === "end") {
      if (blocks.pop()) sequence.addItem({ type: "divider", text: "end" })
      continue
    }

    const found = findMessage(statement)
    if (!found) return null
    const fromId = statement.slice(0, found.index).trim()
    const rest = statement.slice(found.index + found.operator.length).trimStart().replace(/^[+-]+/u, "")
    const colon = rest.indexOf(":")
    const toId = (colon >= 0 ? rest.slice(0, colon) : rest).trim()
    let text = colon >= 0 ? cleanLabel(rest.slice(colon + 1)) : null
    if (!fromId || !toId) return null
    if (autoNumber) {
      messageNumber += 1
      text = `${messageNumber}.${text ? ` ${text}` : ""}`
    }
    sequence.addItem({
      type: "message",
      from: sequence.participant(fromId),
      to: sequence.participant(toId),
      text,
      dotted: found.operator.startsWith("--"),
      cross: found.operator.includes("x"),
    })
  }
  return sequence.participants.length ? { kind: "sequence", sequence } : null
}
