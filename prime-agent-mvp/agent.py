#!/usr/bin/env python3
"""
AgentSession：更贴近 Prime Agent 的父子协作核心机制。

核心对应关系：
1. rlm()          -> 立即返回 handle，后台创建独立子 AgentSession
2. 独立上下文     -> 每个 Agent 独立 context / kernel
3. agent_message  -> asyncio.Queue 消息回传（不是 rlm 返回值）
4. compaction     -> 超长上下文时总结旧消息，保留 kernel 状态
5. /refine        -> 把经验写入 harness（kernel 中的 harness 区）
"""

from __future__ import annotations

import asyncio
import json
import re
import uuid
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from openai import AsyncOpenAI

from config import CONFIG
from kernel import PersistentKernel


@dataclass
class RLMSpawnHandle:
    """对应 Prime Agent 的 RLMSpawnHandle：仅表示 admission，不含结果。"""

    child_id: str
    name: str
    status: str = "running"
    task: Optional[asyncio.Task] = field(default=None, repr=False)


@dataclass
class AgentMessage:
    sender: str
    content: str
    receiver_role: str  # parent | child
    receiver_name: str = ""


class AgentSession:
    def __init__(
        self,
        name: str,
        role: str = "root",  # root | child
        model: Optional[str] = None,
        parent: Optional["AgentSession"] = None,
        system_prompt: Optional[str] = None,
    ) -> None:
        self.name = name
        self.role = role
        self.model = model or CONFIG["model"]
        self.parent = parent
        self.kernel = PersistentKernel()
        self.context: List[Dict[str, str]] = []
        self.children: Dict[str, AgentSession] = {}
        self.registry: Dict[str, RLMSpawnHandle] = {}
        self.inbox: asyncio.Queue[AgentMessage] = asyncio.Queue()

        default_system = (
            "你是 Root Agent，负责拆分任务、调度子 Agent、汇总结论。用中文输出，结论要具体可执行。"
            if role == "root"
            else f"你是子 Agent「{name}」，只负责自己的专项任务，完成后用简洁中文结论汇报。"
        )
        self.system_prompt = system_prompt or default_system
        self.context.append({"role": "system", "content": self.system_prompt})

        self.client = AsyncOpenAI(
            base_url=CONFIG["base_url"],
            api_key=CONFIG["api_key"],
        )

    # ---------- helpers ----------
    @staticmethod
    def _is_garbage_text(text: str) -> bool:
        """检测空内容 / 纯标点引号空格 / 重复噪声。"""
        if text is None:
            return True
        s = str(text).strip()
        if not s:
            return True

        compact = re.sub(r"\s+", "", s)
        if not compact:
            return True
        if set(compact) <= set("\"'“”‘’·.-_~`"):
            return True

        quote_chars = "\"'“”‘’"
        quote_count = sum(1 for ch in s if ch in quote_chars)
        # 引号刷屏：绝对数量多，或占比高
        if quote_count >= 15 and quote_count / max(len(s), 1) > 0.2:
            return True
        if len(s) >= 20 and quote_count / len(s) > 0.35:
            return True

        # 去掉空白和引号后，若几乎没剩有效字符
        meaningful = re.sub(r"[\s\"'“”‘’·.\-_`~，,。.!！?？:：;；]", "", s)
        if len(s) >= 30 and len(meaningful) < max(8, int(len(s) * 0.08)):
            return True

        # 重复片段
        if len(s) >= 40:
            head = s[:12]
            if head and s.count(head) >= 4:
                return True
            # 专门打 " " 循环
            if s.count('"') >= 20 and s.replace('"', "").replace(" ", "").strip() == "":
                return True
            if s.count('" ') >= 10 or s.count(' "') >= 10:
                # 若有效中文/字母数字很少
                if len(re.findall(r"[\u4e00-\u9fffA-Za-z0-9]", s)) < 12:
                    return True
        return False

    @staticmethod
    def _clean_text(text: str, fallback: str = "") -> str:
        s = (text or "").strip()
        if AgentSession._is_garbage_text(s):
            return fallback
        # 压缩连续空白
        s = re.sub(r"[ \t]{2,}", " ", s)
        s = re.sub(r"\n{3,}", "\n\n", s)
        return s.strip()

    @staticmethod
    def _extractive_summary(messages: List[Dict[str, str]], limit: int = 6) -> str:
        """不依赖模型的确定性压缩摘要，避免 LLM 返回噪声。"""
        snippets: List[str] = []
        for msg in messages:
            role = msg.get("role", "user")
            content = (msg.get("content") or "").strip()
            if not content or AgentSession._is_garbage_text(content):
                continue
            # 去掉过长 JSON/代码噪音，只留前 120 字
            one = re.sub(r"\s+", " ", content)
            if len(one) > 120:
                one = one[:120] + "..."
            snippets.append(f"- {role}: {one}")
            if len(snippets) >= limit:
                break
        if not snippets:
            return "早期对话已压缩；关键结论见 kernel.received_messages / synthesis_evidence。"
        return "历史要点：\n" + "\n".join(snippets)

    @staticmethod
    def _normalize_messages(messages: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """合并连续同 role，保证 user/assistant 交替，避免部分模型返回空内容。"""
        if not messages:
            return messages

        system_parts: List[str] = []
        body: List[Dict[str, str]] = []

        for msg in messages:
            role = msg.get("role", "user")
            content = (msg.get("content") or "").strip()
            if not content or AgentSession._is_garbage_text(content):
                continue
            if role == "system":
                system_parts.append(content)
                continue
            if role not in ("user", "assistant"):
                role = "user"
            if body and body[-1]["role"] == role:
                body[-1]["content"] += "\n\n" + content
            else:
                body.append({"role": role, "content": content})

        # 必须以 user 结尾才能稳定拿到 assistant 回复
        if body and body[0]["role"] != "user":
            body.insert(0, {"role": "user", "content": "请基于上下文继续。"})
        if body and body[-1]["role"] != "user":
            body.append({"role": "user", "content": "请继续并给出完整结论。"})

        normalized: List[Dict[str, str]] = []
        if system_parts:
            normalized.append({"role": "system", "content": "\n".join(system_parts)})
        normalized.extend(body)
        return normalized

    # ---------- LLM ----------
    async def _chat(self, messages: List[Dict[str, str]]) -> str:
        payload = self._normalize_messages(messages)
        if not payload:
            return ""

        resp = await self.client.chat.completions.create(
            model=self.model,
            messages=payload,
            temperature=CONFIG["temperature"],
        )
        choice = resp.choices[0].message
        text = (choice.content or "").strip()

        if not text:
            text = (getattr(choice, "reasoning_content", None) or "").strip()

        text = self._clean_text(text, fallback="")
        if text:
            return text

        # 再试一次，降低随机性
        resp2 = await self.client.chat.completions.create(
            model=self.model,
            messages=payload
            + [
                {
                    "role": "user",
                    "content": "请直接输出完整中文结论，不要输出空白、引号或无意义符号。",
                }
            ],
            temperature=0.2,
        )
        text2 = self._clean_text((resp2.choices[0].message.content or "").strip(), fallback="")
        return text2

    # ---------- agent_message ----------
    async def agent_message_send(
        self,
        content: str,
        *,
        receiver_role: str,
        receiver_name: str = "",
    ) -> None:
        """对应 Prime Agent 的 agent_message.send()。"""
        msg = AgentMessage(
            sender=self.name,
            content=content,
            receiver_role=receiver_role,
            receiver_name=receiver_name,
        )

        if receiver_role == "parent":
            if not self.parent:
                raise RuntimeError(f"[{self.name}] 没有 parent，无法回传")
            await self.parent.inbox.put(msg)
            print(f"[message] {self.name} -> parent({self.parent.name})")
            return

        if receiver_role == "child":
            child = self._find_child(receiver_name)
            if not child:
                raise RuntimeError(f"[{self.name}] 找不到子 Agent: {receiver_name}")
            await child.inbox.put(msg)
            print(f"[message] {self.name} -> child({child.name})")
            return

        raise ValueError(f"未知 receiver_role: {receiver_role}")

    def _find_child(self, name_or_id: str) -> Optional[AgentSession]:
        if name_or_id in self.children:
            return self.children[name_or_id]
        for cid, child in self.children.items():
            if child.name == name_or_id or cid == name_or_id:
                return child
        return None

    async def wait_messages(self, n: int, timeout: float = 120.0) -> List[AgentMessage]:
        """父 Agent 收集 n 条子 Agent 回传，并写入 kernel（供最终汇总使用）。"""
        messages: List[AgentMessage] = []
        received = list(self.kernel.get("received_messages_structured", []) or [])

        for _ in range(n):
            msg = await asyncio.wait_for(self.inbox.get(), timeout=timeout)
            messages.append(msg)
            received.append({"sender": msg.sender, "content": msg.content})
            # 上下文里用 assistant 占位，避免连续 user 导致模型异常
            self.context.append(
                {
                    "role": "user",
                    "content": f"[子Agent消息 | {msg.sender}]\n{msg.content}",
                }
            )
            self.context.append(
                {
                    "role": "assistant",
                    "content": f"已收到 {msg.sender} 的汇报，继续等待或汇总。",
                }
            )

        self.kernel.set("received_messages_structured", received)
        return messages

    # ---------- rlm ----------
    async def rlm(self, prompt: str, name: Optional[str] = None) -> RLMSpawnHandle:
        """
        对应 Prime Agent 的 rlm()：
        - 立即返回 handle（admission）
        - 不返回子 Agent 结果
        - 子 Agent 后台独立运行，完成后通过 agent_message 回传
        """
        child_id = f"sub-{uuid.uuid4().hex[:8]}"
        child_name = name or child_id
        child = AgentSession(
            name=child_name,
            role="child",
            model=self.model,
            parent=self,
            system_prompt=(
                f"你是专项子 Agent「{child_name}」。"
                "请只完成分配给你的任务，输出简洁、可执行的中文结论。"
                "不要代替父 Agent 做最终汇总。"
            ),
        )
        self.children[child_id] = child

        handle = RLMSpawnHandle(child_id=child_id, name=child_name, status="running")
        self.registry[child_id] = handle

        if "case_code" in self.kernel.state:
            child.kernel.set("case_code", self.kernel.get("case_code"))

        async def _child_job() -> None:
            try:
                case_code = child.kernel.get("case_code", "")
                full_prompt = (
                    f"{prompt}\n\n"
                    f"以下是你需要审查的材料：\n{case_code}\n\n"
                    "请直接给出结论，控制在 8 行以内，不要输出空内容。"
                )
                result = await child.run_local(full_prompt)
                if not result:
                    result = f"[{child_name}] 模型返回空内容，请父 Agent 标记为需重试。"

                await child.agent_message_send(result, receiver_role="parent")
                handle.status = "completed"
                print(f"[{self.name}] 子 Agent 完成: {child_name}")
            except Exception as e:
                handle.status = "failed"
                await child.agent_message_send(
                    f"执行失败: {e}",
                    receiver_role="parent",
                )
                print(f"[{self.name}] 子 Agent 失败: {child_name} -> {e}")

        handle.task = asyncio.create_task(_child_job())
        print(f"[{self.name}] rlm admitted: {child_name} ({child_id})")
        return handle

    async def run_local(self, task: str) -> str:
        """单 Agent 本地执行一轮（不自动拆分子 Agent）。"""
        self.context.append({"role": "user", "content": task})
        reply = await self._chat(self.context)
        if not reply:
            reply = "（模型返回空，已跳过本轮有效结论）"
        self.context.append({"role": "assistant", "content": reply})
        await self._maybe_compact()
        return reply

    def _build_fallback_report(self, msgs: List[AgentMessage]) -> str:
        lines = ["# 最终审查报告（fallback 拼接）", ""]
        lines.append("## 1. 总体风险")
        lines.append("高（子 Agent 已回报多项认证与测试问题）")
        lines.append("")
        lines.append("## 2-4. 子 Agent 原始结论")
        for m in msgs:
            lines.append(f"### 来自 {m.sender}")
            lines.append(m.content or "（空）")
            lines.append("")
        lines.append("## 说明")
        lines.append("模型汇总返回空内容，因此回退为子 Agent 消息拼接结果。")
        return "\n".join(lines)

    @staticmethod
    def _extract_json_object(text: str) -> Optional[Dict[str, Any]]:
        """从模型输出中提取 JSON 对象。"""
        if not text:
            return None
        text = text.strip()
        # 直接 JSON
        try:
            data = json.loads(text)
            return data if isinstance(data, dict) else None
        except Exception:
            pass
        # ```json ... ```
        fence = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.S)
        if fence:
            try:
                data = json.loads(fence.group(1))
                return data if isinstance(data, dict) else None
            except Exception:
                pass
        # 截取第一个大括号对象
        start = text.find("{")
        end = text.rfind("}")
        if start >= 0 and end > start:
            try:
                data = json.loads(text[start : end + 1])
                return data if isinstance(data, dict) else None
            except Exception:
                return None
        return None

    async def _parent_decide(self, instruction: str) -> Dict[str, Any]:
        """
        父 Agent 决策：由 LLM 自动决定要创建哪些子 Agent。
        合法 action:
          - rlm: {type,name,prompt}
        """
        raw = await self.run_local(instruction)
        data = self._extract_json_object(raw)
        if not data:
            data = {
                "thought": "模型未输出合法 JSON，使用最小兜底拆分",
                "actions": [
                    {
                        "type": "rlm",
                        "name": "security-reviewer",
                        "prompt": "审查安全问题：密钥、密码存储、token、权限。给出风险与修复建议。",
                    },
                    {
                        "type": "rlm",
                        "name": "test-reviewer",
                        "prompt": "审查测试覆盖缺口，列出缺失用例和最少测试清单。",
                    },
                ],
            }
        actions = data.get("actions") or []
        if not isinstance(actions, list):
            actions = []
        # 只保留 rlm，忽略追问等复杂动作
        actions = [
            a
            for a in actions
            if isinstance(a, dict) and str(a.get("type", "")).lower().strip() == "rlm"
        ]
        data["actions"] = actions
        data["raw"] = raw
        return data

    async def _execute_parent_actions(
        self,
        actions: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """执行父 Agent 自动生成的 rlm 动作（不做追问）。"""
        handles: List[RLMSpawnHandle] = []

        for act in actions:
            if not isinstance(act, dict):
                continue
            if str(act.get("type", "")).lower().strip() != "rlm":
                continue
            name = str(act.get("name") or "").strip() or None
            prompt = str(act.get("prompt") or "").strip()
            if not prompt:
                continue
            handle = await self.rlm(prompt, name=name)
            handles.append(handle)
            print(f"[{self.name}] 父Agent自动 rlm -> {handle.name}: {prompt[:80]}")

        child_msgs: List[AgentMessage] = []
        if handles:
            print(f"[{self.name}] 等待 {len(handles)} 个子 Agent 回传...")
            child_msgs = await self.wait_messages(len(handles))
            for m in child_msgs:
                preview = (m.content or "")[:120]
                print(f"[{self.name}] 收到 {m.sender}: {preview}...")

        return {
            "handles": handles,
            "messages": child_msgs,
        }

    async def run_as_parent(self, user_task: str, case_code: str) -> str:
        """
        简化版父子协作（贴近 Prime Agent，但不追问）：
        1. 父 Agent 自动输出 rlm actions
        2. 并行创建子 Agent 并等待回传
        3. 父 Agent 基于子结论直接汇总最终报告
        4. refine harness
        """
        self.kernel.set("case_code", case_code)
        self.kernel.set("user_task", user_task)
        self.kernel.set("received_messages_structured", [])

        # 1) 父 Agent 自动生成子 Agent
        decide_spawn = (
            "你是 Root Agent。请根据用户任务，自动决定创建哪些子 Agent。\n"
            "对应 Prime Agent 的 rlm()：由你决定 spawn，不是系统写死。\n\n"
            f"用户任务：\n{user_task}\n\n"
            "材料已放入 kernel.case_code。\n\n"
            "请只输出 JSON：\n"
            "{\n"
            '  "thought": "简短思考",\n'
            '  "actions": [\n'
            '    {"type": "rlm", "name": "子agent名", "prompt": "给子agent的任务"},\n'
            '    {"type": "rlm", "name": "另一个", "prompt": "..."}\n'
            "  ]\n"
            "}\n"
            "要求：1-3 个 rlm；name 用英文短横线；prompt 具体可执行。"
        )
        decision = await self._parent_decide(decide_spawn)
        print(f"\n[{self.name}] 父Agent决策(生成子Agent):\n{decision.get('raw', '')}\n")
        self.kernel.set("parent_decision_spawn", decision)

        result = await self._execute_parent_actions(decision.get("actions", []))
        all_msgs: List[AgentMessage] = list(result["messages"])

        if not all_msgs:
            print(f"[{self.name}] 未收到子 Agent 消息，使用兜底 rlm")
            fallback = await self._parent_decide(
                "请输出 JSON，actions 至少包含 2 个 type=rlm。"
            )
            # 若仍解析失败，_parent_decide 自带 fallback actions
            result = await self._execute_parent_actions(fallback.get("actions", []))
            all_msgs = list(result["messages"])

        # 2) 直接汇总，不再追问
        evidence = "\n\n".join(
            f"### {m.sender}\n{m.content}" for m in all_msgs if (m.content or "").strip()
        )
        self.kernel.set("synthesis_evidence", evidence)

        synthesize_prompt = (
            "请基于以下子 Agent 审查结论，直接输出最终审查报告。\n\n"
            f"{evidence}\n\n"
            "输出结构：\n"
            "1. 总体风险\n"
            "2. 安全问题（按优先级）\n"
            "3. 测试缺口\n"
            "4. 立刻可做的 3 个修复动作\n"
            "要求：中文、简洁、可执行，禁止空白和引号刷屏。"
        )
        final = await self.run_local(synthesize_prompt)
        final = self._clean_text(final, fallback="")

        if not final or final.startswith("（模型返回空") or self._is_garbage_text(final):
            print(f"[{self.name}] 汇总无效，启用 fallback 拼接")
            final = self._build_fallback_report(all_msgs)

        spawned = [h.name for h in self.registry.values()]
        await self.refine(
            lesson=(
                "复杂任务由父 Agent 自动输出 rlm 生成子 Agent，"
                f"本次: {spawned}；子结论回收后直接汇总，不做追问。"
            )
        )

        self.kernel.set(
            "child_status",
            {cid: h.status for cid, h in self.registry.items()},
        )
        self.kernel.set("received_messages", [m.content for m in all_msgs])
        self.kernel.set("auto_spawned_children", spawned)
        return final

    # ---------- compaction / refine ----------
    async def _maybe_compact(self) -> None:
        max_ctx = CONFIG["max_context"]
        if len(self.context) <= max_ctx:
            return

        print(f"[{self.name}] 触发 compaction...")
        keep = 4
        system_msg = (
            self.context[0]
            if self.context and self.context[0]["role"] == "system"
            else None
        )
        body = self.context[1:] if system_msg else list(self.context)
        if len(body) <= keep:
            return

        old_messages = body[:-keep]
        recent = body[-keep:]

        # 默认用确定性摘要，避免模型返回 " " " " 噪声
        summary = self._extractive_summary(old_messages)

        # 可选：尝试 LLM 摘要；若是垃圾文本则丢弃
        try:
            brief_src = "\n".join(
                f"{m.get('role')}: {(m.get('content') or '')[:200]}"
                for m in old_messages[-8:]
            )
            llm_summary = await self._chat(
                [
                    {
                        "role": "system",
                        "content": "用中文两三句话总结下列对话要点。只输出正文，不要引号堆砌，不要空行刷屏。",
                    },
                    {"role": "user", "content": brief_src[:3000]},
                ]
            )
            llm_summary = self._clean_text(llm_summary, fallback="")
            if llm_summary and not self._is_garbage_text(llm_summary):
                summary = llm_summary
            else:
                print(f"[{self.name}] LLM 摘要无效，使用 extractive fallback")
        except Exception as e:
            print(f"[{self.name}] LLM 摘要失败，使用 extractive fallback: {e}")

        summary = self._clean_text(
            summary,
            fallback="早期对话已压缩；关键结论见 kernel.received_messages / synthesis_evidence。",
        )
        self.kernel.set("last_compact_summary", summary)

        new_context: List[Dict[str, str]] = []
        if system_msg:
            new_context.append(system_msg)
        new_context.append(
            {
                "role": "user",
                "content": f"[历史上下文已压缩]\n{summary}",
            }
        )
        new_context.append(
            {
                "role": "assistant",
                "content": "已记住压缩后的历史结论，继续当前任务。",
            }
        )
        # recent 也过滤垃圾
        for msg in recent:
            content = self._clean_text(msg.get("content", ""), fallback="")
            if not content:
                continue
            new_context.append({"role": msg.get("role", "user"), "content": content})

        self.context = new_context
        print(f"[{self.name}] compaction 完成，kernel 状态已保留")
        print(f"[{self.name}] compaction 摘要预览: {summary[:160]}")

    async def refine(self, lesson: str) -> None:
        print(f"[{self.name}] 执行 /refine")
        harness = self.kernel.get("harness", [])
        if not isinstance(harness, list):
            harness = []
        harness.append(lesson)
        self.kernel.set("harness", harness)
        self.kernel.set("last_refine", lesson)
