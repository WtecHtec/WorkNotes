# MergeTable 组件完整总结

## 📦 组件概述

MergeTable 是基于 Ant Design Table 封装的增强表格组件，支持灵活的单元格合并和表头合并功能，**所有配置都可以通过后端接口返回**。

---

## 🎯 核心功能

### 1. **cellMerge** - 单元格行合并（纵向 ⬇️）
- 相同值的单元格自动纵向合并
- 支持列级联合并（`dependsOn`）
- 基于数据源顺序自动计算

### 2. **headerMerge** - 表头合并（多级表头 ↔️）
- 将多个列的表头合并成父表头
- 支持多级嵌套
- 自定义标题和对齐方式

### 3. **rowMerge** - 行内列合并（横向 ➡️）
- 某一行的单元格横向合并多列
- 灵活的条件配置（5 种类型）
- 适用于汇总行、标题行等场景

---

## 📁 文件结构

```
src/components/MergeTable/
├── types.ts                      # TypeScript 类型定义
├── utils.ts                      # 核心合并算法
├── hooks.ts                      # React Hook 封装
├── configParser.ts               # 后端配置解析器 ⭐ 新增
├── backend-types.d.ts            # 后端接口类型定义 ⭐ 新增
├── mockData.ts                   # Mock 数据和示例 ⭐ 新增
├── MergeTable.tsx                # 主组件
├── index.ts                      # 导出入口
├── example.tsx                   # 前端配置示例
├── BackendConfigExample.tsx      # 后端配置示例 ⭐ 新增
├── README.md                     # 完整 API 文档
├── USAGE.md                      # 使用指南
├── BACKEND_CONFIG.md             # 后端配置指南 ⭐ 新增
└── SUMMARY.md                    # 本文件
```

---

## 🚀 快速开始

### 前端直接配置

```tsx
import { MergeTable } from '@/components/MergeTable';

<MergeTable
  dataSource={data}
  columns={columns}
  mergeConfig={{
    headerMerge: [
      { startColumn: 'ctrip', colSpan: 3, title: 'OTA渠道' }
    ],
    cellMerge: [
      { field: 'date' },
      { field: 'hotel', dependsOn: ['date'] }
    ],
    rowMerge: [
      {
        startColumn: 'date',
        colSpan: 2,
        condition: (record) => record.date === '汇总'
      }
    ]
  }}
  bordered
/>
```

### 使用后端配置（推荐）⭐

```tsx
import { MergeTable, parseMergeConfig } from '@/components/MergeTable';

function MyTable() {
  const [backendConfig, setBackendConfig] = useState();

  useEffect(() => {
    fetch('/api/table-merge-config')
      .then(res => res.json())
      .then(setBackendConfig);
  }, []);

  const mergeConfig = parseMergeConfig(backendConfig);

  return <MergeTable dataSource={data} columns={columns} mergeConfig={mergeConfig} />;
}
```

---

## 🔧 后端配置格式

### 完整示例

```json
{
  "headerMerge": [
    {
      "startColumn": "ctrip",
      "colSpan": 3,
      "title": "OTA渠道",
      "align": "center"
    }
  ],
  "cellMerge": [
    {
      "field": "date"
    },
    {
      "field": "hotel",
      "dependsOn": ["date"]
    }
  ],
  "rowMerge": [
    {
      "startColumn": "date",
      "colSpan": 2,
      "condition": {
        "type": "fieldEquals",
        "field": "date",
        "value": "汇总"
      }
    }
  ]
}
```

### 条件类型（rowMerge 的 condition）

| 类型 | 说明 | 示例 |
|------|------|------|
| **fieldEquals** | 字段等于某值 | `{"type": "fieldEquals", "field": "status", "value": "汇总"}` |
| **fieldIn** | 字段在数组中 | `{"type": "fieldIn", "field": "type", "values": ["header", "summary"]}` |
| **rowIndex** | 行号在数组中 | `{"type": "rowIndex", "indices": [0, 3, 6]}` |
| **rowIndexRange** | 行号在范围内 | `{"type": "rowIndexRange", "start": 0, "end": 2}` |
| **custom** | 自定义表达式 | `{"type": "custom", "expression": "record.value > 100"}` |

---

## 📚 核心 API

### parseMergeConfig()

解析后端返回的配置为前端可用格式

```typescript
function parseMergeConfig<T>(
  backendConfig?: BackendMergeConfig<T>
): TableMergeConfig<T> | undefined
```

### validateBackendConfig()

验证后端配置格式是否正确

```typescript
function validateBackendConfig(config: any): {
  valid: boolean;
  errors: string[];
}
```

### useTableMerge()

React Hook，处理合并逻辑

```typescript
function useTableMerge<T>(
  dataSource: T[],
  config?: TableMergeConfig<T>
): {
  cellMergeData: MergeDataResult;
  getOnCell: (field: keyof T) => Function;
  applyMergeToColumns: (columns: ColumnType<T>[]) => ColumnType<T>[];
}
```

---

## 💡 使用场景

### 1. OTA 月报表
- 表头合并：OTA 渠道、直销渠道
- 行合并：相同日期
- 列合并：汇总行

### 2. 财务报表
- 表头合并：季度数据
- 行合并：相同类别
- 列合并：特殊标题行

### 3. 项目进度表
- 列合并：标题行、小计行
- 条件：基于类型字段判断

### 4. 学生成绩表
- 表头合并：科目分组
- 行合并：年级、班级级联

---

## 🔄 工作流程

```
后端数据库/配置文件
         ↓
后端 API 返回 JSON 配置
         ↓
前端 parseMergeConfig() 解析
         ↓
前端 useTableMerge() 处理
         ↓
前端 MergeTable 渲染
```

---

## 📖 文档索引

| 文档 | 说明 | 适用人员 |
|------|------|----------|
| [README.md](./README.md) | 完整 API 文档 | 所有开发者 |
| [USAGE.md](./USAGE.md) | 使用指南和示例 | 前端开发者 |
| [BACKEND_CONFIG.md](./BACKEND_CONFIG.md) | 后端配置详细说明 | 后端开发者 |
| [backend-types.d.ts](./backend-types.d.ts) | 后端接口类型定义 | 后端开发者 |
| [example.tsx](./example.tsx) | 前端配置示例 | 前端开发者 |
| [BackendConfigExample.tsx](./BackendConfigExample.tsx) | 后端配置使用示例 | 前端开发者 |
| [mockData.ts](./mockData.ts) | Mock 数据 | 测试开发 |

---

## ✅ 特性总结

- ✅ 三种合并方式（行合并、表头合并、列合并）
- ✅ 完整的后端配置支持
- ✅ 5 种灵活的条件类型
- ✅ TypeScript 类型安全
- ✅ 性能优化（useMemo）
- ✅ 配置验证
- ✅ 完整的文档和示例
- ✅ Mock 数据支持

---

## 🎨 可视化效果

```
┌─────────────────┬──────────────┬─────────┐
│                 │   OTA渠道    │ 直销    │  ← headerMerge
│                 ├────────┬─────┤         │
│                 │  携程  │美团 │  官网   │
├─────────────────┼────────┼─────┼─────────┤
│   汇总 - 全部   │  100   │ 80  │  120    │  ← rowMerge (横向)
├────────┬────────┼────────┼─────┼─────────┤
│ 1月1日 │ 希尔顿 │   10   │  8  │   12    │  ← cellMerge (纵向)
│   ↓    ├────────┼────────┼─────┼─────────┤
│        │  万豪  │   15   │ 10  │   20    │
└────────┴────────┴────────┴─────┴─────────┘
```

---

## 🚦 下一步

1. **前端开发者**：
   - 阅读 [USAGE.md](./USAGE.md) 了解基本用法
   - 查看 [example.tsx](./example.tsx) 和 [BackendConfigExample.tsx](./BackendConfigExample.tsx)
   - 集成到项目中

2. **后端开发者**：
   - 阅读 [BACKEND_CONFIG.md](./BACKEND_CONFIG.md)
   - 参考 [backend-types.d.ts](./backend-types.d.ts) 实现接口
   - 使用 [mockData.ts](./mockData.ts) 中的示例数据测试

3. **测试开发**：
   - 使用 [mockData.ts](./mockData.ts) 编写测试用例
   - 验证各种配置场景

---

## 🔍 常见问题

### Q: 配置必须从后端返回吗？
A: 不是。可以在前端直接配置，也可以从后端获取，两种方式都支持。

### Q: 后端接口必须返回所有三种配置吗？
A: 不是。可以只返回需要的配置类型，未配置的不会应用合并。

### Q: 如何调试配置错误？
A: 使用 `validateBackendConfig()` 验证配置格式，会返回详细的错误信息。

### Q: 性能如何？
A: 所有计算都通过 useMemo 缓存，支持 1000+ 行数据。

---

## 📧 反馈和支持

遇到问题或有建议？欢迎反馈！
