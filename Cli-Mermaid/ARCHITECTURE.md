# 架构决策

## 目标

同一个 Mermaid 字符画核心必须同时服务 Node CLI 与 Web，任何 UI 或运行时能力都不能成为领域算法的前置条件。

## 依赖规则

1. `domain` 不允许导入 `application` 或 `adapters`。
2. `application` 可以编排 `domain`，但不访问 Node、DOM 或具体颜色库。
3. `adapters` 可以依赖 `application` 的结果，并转换为 ANSI、HTML 或未来的其他 UI 表示。
4. 公共 API 返回数据，不返回 UI 组件。

## 核心流程

```text
source
  → parser
  → Graph / Sequence
  → rank + ordering + track planning
  → coordinate placement
  → node painter + edge router
  → UnicodeCanvas
  → plainLines + styledLines
  → ANSI / HTML adapter
```

## 错误策略

解析器可以返回 `null`，领域模型和画布可以抛出容量异常。应用用例是统一的错误边界，负责把这些状态转换为源码框。外围适配器不捕获领域异常，也不猜测失败原因。

## 扩展方式

- 新图类型：新增独立 parser 和对应 layout，再注册到 `parsers/index.js`。
- 新输出平台：新增 adapter，消费 `plainLines`、`styledLines` 或后续公开的 Canvas DTO。
- 新节点形状：扩展领域常量与 node painter，不修改 CLI/Web。
- 新主题：扩展 adapter 的 role 映射，不修改领域算法。

## 函数注释规范

所有生产代码中的命名函数、局部算法函数和类方法必须拥有独立中文 JSDoc，至少说明该函数解决的问题、核心逻辑以及主要输出或副作用。匿名数组回调只表达局部数据变换，不强制添加重复注释。`test/function-comments.test.js` 会在 CI 中阻止未注释函数进入代码库。
