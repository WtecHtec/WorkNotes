// mock-llm-server/server.js
//
// 一个假的 LLM 服务,用来在没有真实模型/API key 的情况下,
// 演示"LLM 决定调用工具 -> 拿到工具结果 -> 继续生成"这个标准循环是怎么流式发生的。
//
// 输出协议:HTTP chunked + NDJSON(每行一个 JSON 对象),行类型:
//   {"type":"delta","text":"..."}          — 一段文本 token(增量)
//   {"type":"tool_call","name":..,"arguments":{...}}  — 模型决定调用某个工具
//   {"type":"done"}                        — 这一轮生成结束
//
// 真实项目里,把这个文件换成真正调用 Anthropic / OpenAI 的流式 API 即可,
// orchestrator 那边的消费逻辑基本不用改。

import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4001;

// 触发"调用 show_map 工具"的关键词 -> 提取出的地点
const PLACE_KEYWORDS = [
  { pattern: /东京塔|tokyo tower/i, place: "东京塔" },
  { pattern: /浅草寺/i, place: "浅草寺" },
  { pattern: /涩谷/i, place: "涩谷十字路口" },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function streamTokens(res, text, delayMs = 40) {
  const words = text.split(/(?<=\s)|(?=[，。！？])/u).filter(Boolean);
  for (const w of words) {
    res.write(JSON.stringify({ type: "delta", text: w }) + "\n");
    await sleep(delayMs);
  }
}

app.post("/generate", async (req, res) => {
  res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");

  const { message = "", toolResult = null } = req.body || {};

  // ---- 第二轮:工具已经执行完,拿着结果继续生成收尾文本 ----
  if (toolResult) {
    await streamTokens(
      res,
      `好的,已经把 ${toolResult.arguments?.query ?? "目标地点"} 标在地图上了,你可以点标记查看详情，或者点“获取路线”按钮直接问路。`
    );
    res.write(JSON.stringify({ type: "done" }) + "\n");
    res.end();
    return;
  }

  // ---- 第一轮:决定要不要调用工具 ----
  const hit = PLACE_KEYWORDS.find((k) => k.pattern.test(message));

  if (hit) {
    await streamTokens(res, `好的，我来帮你查一下 ${hit.place} 的位置，`);
    res.write(
      JSON.stringify({
        type: "tool_call",
        name: "show_map",
        arguments: { query: hit.place },
      }) + "\n"
    );
    res.write(JSON.stringify({ type: "done" }) + "\n");
    res.end();
    return;
  }

  // ---- 没命中关键词:走普通闲聊分支 ----
  await streamTokens(
    res,
    "我是一个 mock LLM，目前只认识几个地点关键词（东京塔 / 浅草寺 / 涩谷）。试着问我“带我看看东京塔”看看效果吧。"
  );
  res.write(JSON.stringify({ type: "done" }) + "\n");
  res.end();
});

app.listen(PORT, () => {
  console.log(`[mock-llm-server] listening on http://localhost:${PORT}`);
});
