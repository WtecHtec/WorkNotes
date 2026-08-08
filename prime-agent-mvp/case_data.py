#!/usr/bin/env python3
"""真实 case 数据：一段有问题的认证代码，供父子 Agent 审查。"""

# 模拟项目中的认证模块（故意包含安全与可测试性问题）
AUTH_CODE = '''
# auth.py
import hashlib
import time

SECRET = "hardcoded-secret-123"  # 硬编码密钥
USERS = {"alice": "password123", "bob": "qwerty"}  # 明文密码

def login(username: str, password: str) -> str:
    """登录并返回 token。"""
    if username not in USERS:
        return ""
    if USERS[username] != password:
        return ""
    # 可预测 token
    raw = f"{username}:{password}:{SECRET}:{int(time.time()//3600)}"
    return hashlib.md5(raw.encode()).hexdigest()

def is_admin(token: str) -> bool:
    # 没有校验 token 是否伪造，只要包含 alice 就放行
    return "alice" in token or token.endswith("admin")
'''

TEST_CODE = '''
# test_auth.py
from auth import login

def test_login_ok():
    token = login("alice", "password123")
    assert token  # 只检查非空，不检查安全性

# 缺少：错误密码、不存在用户、token 伪造、权限提升等用例
'''

USER_TASK = """
请审查当前项目的认证模块，重点覆盖：
1. 安全问题（密钥、密码存储、token 设计、权限判断）
2. 测试覆盖是否足够

请输出一份可执行的审查结论，包含风险等级和修改建议。
"""

CASE_BUNDLE = f"""
## 待审查代码

### auth.py
```python
{AUTH_CODE}
```

### test_auth.py
```python
{TEST_CODE}
```
"""
