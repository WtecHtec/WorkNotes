#!/usr/bin/env python3
"""Prime Agent 最小 MVP 入口：真实父子 Agent 协作 case。"""

import asyncio

from agent import AgentSession
from case_data import CASE_BUNDLE, USER_TASK
from config import CONFIG


async def main() -> None:
    print("=== Prime Agent 父子协作 MVP ===")
    print(f"模型: {CONFIG['model']}")
    print(f"Base URL: {CONFIG['base_url']}")
    print()

    parent = AgentSession(name="RootAgent", role="root")

    print("用户任务:")
    print(USER_TASK.strip())
    print("\n--- 开始父子协作 ---\n")

    final = await parent.run_as_parent(USER_TASK.strip(), CASE_BUNDLE)

    print("\n=== 最终审查报告 ===")
    print(final if final and final.strip() else "（空报告，请检查模型返回）")

    print("\n=== 运行观察 ===")
    print("父Agent自动生成的子Agent:", parent.kernel.get("auto_spawned_children"))
    print("子 Agent 状态:", parent.kernel.get("child_status"))
    print("Harness:", parent.kernel.get("harness"))
    print("最近 compaction 摘要:", parent.kernel.get("last_compact_summary") or "（无）")
    print("子 Agent 数量:", len(parent.children))
    for cid, child in parent.children.items():
        print(
            f"- {child.name} ({cid}) | context轮次={len(child.context)} | "
            f"与父共享context? {child.context is parent.context}"
        )
    print("\n=== 结束 ===")


if __name__ == "__main__":
    asyncio.run(main())
