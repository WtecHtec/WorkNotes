#!/usr/bin/env python3
"""模拟持久 IPython Kernel：跨轮次保留变量/状态。"""

from typing import Any, Dict


class PersistentKernel:
    def __init__(self) -> None:
        self.state: Dict[str, Any] = {}

    def set(self, key: str, value: Any) -> None:
        self.state[key] = value

    def get(self, key: str, default: Any = None) -> Any:
        return self.state.get(key, default)

    def snapshot(self) -> Dict[str, Any]:
        return dict(self.state)
