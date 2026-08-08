# Prime Agent 父子协作 MVP

 Prime Agent 核心机制的最小可运行版本。

## 对应关系

| Prime Agent 机制 | 本 MVP 实现 |
|---|---|
| `rlm(...)` 立即 admission | `AgentSession.rlm()` 返回 `RLMSpawnHandle`，后台跑子任务 |
| 子 Agent 独立上下文 | 每个 child 独立 `context` + `kernel` |
| `agent_message` 回传结果 | `agent_message_send()` + `inbox` 队列 |
| 父可追问子 | parent -> child 再发一条 message |
| compaction | 超长上下文时总结旧消息，kernel 状态保留 |
| Continual Harness `/refine` | `refine(lesson)` 写入 kernel.harness |

## 文件

```text
prime-agent-mvp/
├── main.py
├── agent.py
├── case_data.py
├── kernel.py
├── config.py
├── .env.example
├── .env
├── requirements.txt
└── README.md
```

## 配置（.env）

```bash
cd prime-agent-mvp
cp .env.example .env
# 编辑 .env，填入你的 key / model / base_url
```

`.env` 示例：

```env
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=sk-xxxx
LLM_MODEL=gpt-4o-mini
LLM_MAX_CONTEXT=6
LLM_TEMPERATURE=0.4
```

兼容端点示例（Ollama）：

```env
LLM_BASE_URL=http://127.0.0.1:11434/v1
LLM_API_KEY=ollama
LLM_MODEL=qwen2.5
```

## 运行

```bash
cd prime-agent-mvp
pip install -r requirements.txt
python main.py
```

## 说明

- `config.py` 会自动加载同目录 `.env`
- 环境变量优先级高于默认值
- 请勿把真实 `LLM_API_KEY` 提交到 git
