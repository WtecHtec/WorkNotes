#!/usr/bin/env python3
"""配置：从 .env 和环境变量读取 LLM 设置。"""

import os
from pathlib import Path

from dotenv import load_dotenv

ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=ENV_PATH)

CONFIG = {
    "base_url": os.getenv("LLM_BASE_URL", "https://api.openai.com/v1"),
    "api_key": os.getenv("LLM_API_KEY", "your-api-key-here"),
    "model": os.getenv("LLM_MODEL", "gpt-4o-mini"),
    # 略放宽，减少过早压缩导致汇总丢信息
    "max_context": int(os.getenv("LLM_MAX_CONTEXT", "12")),
    "temperature": float(os.getenv("LLM_TEMPERATURE", "0.3")),
}
