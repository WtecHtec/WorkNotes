# 后端配置指南

MergeTable 支持通过后端接口返回配置，实现灵活的表格合并控制。

## 快速开始

### 1. 后端接口返回格式

```typescript
interface BackendMergeConfig {
  headerMerge?: HeaderMergeConfig[];
  cellMerge?: ColumnMergeConfig[];
  rowMerge?: RowMergeConfig[];
}
```

### 2. 前端使用

```tsx
import { MergeTable, parseMergeConfig } from '@/components/MergeTable';

function MyTable() {
  const [backendConfig, setBackendConfig] = useState();

  useEffect(() => {
    // 从后端获取配置
    fetch('/api/table-merge-config')
      .then(res => res.json())
      .then(config => setBackendConfig(config));
  }, []);

  // 解析后端配置
  const mergeConfig = parseMergeConfig(backendConfig);

  return (
    <MergeTable
      dataSource={data}
      columns={columns}
      mergeConfig={mergeConfig}
    />
  );
}
```

---

## 配置格式详解

### 1. headerMerge - 表头合并配置

**用途**：将多个列的表头合并成一个父表头

```json
{
  "headerMerge": [
    {
      "startColumn": "ctrip",
      "colSpan": 3,
      "title": "OTA渠道",
      "align": "center",
      "hideChildren": false
    }
  ]
}
```

**字段说明**：
- `startColumn` (string, 必填): 起始列的 dataIndex
- `colSpan` (number, 必填): 合并的列数
- `title` (string, 必填): 合并后显示的标题
- `align` (string, 可选): 对齐方式，可选值 `"left"` | `"center"` | `"right"`，默认 `"center"`
- `hideChildren` (boolean, 可选): 是否隐藏子表头，默认 `false`
  - `false`: 显示多级表头（父表头下方显示子表头）
  - `true`: 隐藏子表头，只显示合并后的标题

---

### 2. cellMerge - 单元格行合并配置

**用途**：相同值的单元格自动纵向合并

```json
{
  "cellMerge": [
    {
      "field": "date"
    },
    {
      "field": "hotel",
      "dependsOn": ["date"]
    }
  ]
}
```

**字段说明**：
- `field` (string, 必填): 要合并的字段名
- `dependsOn` (string[], 可选): 依赖的父列字段，只有在这些字段值相同时才合并

---

### 3. rowMerge - 行内列合并配置

**用途**：某一行的单元格横向合并多列

```json
{
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

**字段说明**：
- `startColumn` (string, 必填): 起始列的 dataIndex
- `colSpan` (number, 必填): 合并的列数
- `condition` (object, 必填): 判断条件，返回 true 时进行合并

---

## 条件配置（condition）详解

### 1. fieldEquals - 字段等于某值

```json
{
  "condition": {
    "type": "fieldEquals",
    "field": "date",
    "value": "汇总"
  }
}
```

**含义**：当 `record.date === "汇总"` 时合并

---

### 2. fieldIn - 字段在数组中

```json
{
  "condition": {
    "type": "fieldIn",
    "field": "date",
    "values": ["汇总", "小计", "合计"]
  }
}
```

**含义**：当 `["汇总", "小计", "合计"].includes(record.date)` 时合并

---

### 3. rowIndex - 行号在数组中

```json
{
  "condition": {
    "type": "rowIndex",
    "indices": [0, 3, 6]
  }
}
```

**含义**：当 `index` 为 0、3 或 6 时合并

**适用场景**：固定的某几行需要合并（如第一行标题、每隔几行的小计行等）

---

### 4. rowIndexRange - 行号在范围内

```json
{
  "condition": {
    "type": "rowIndexRange",
    "start": 0,
    "end": 2
  }
}
```

**含义**：当 `index >= 0 && index <= 2` 时合并（前 3 行）

**适用场景**：连续的几行需要合并

---

### 5. custom - 自定义表达式

```json
{
  "condition": {
    "type": "custom",
    "expression": "record.date.includes('汇总') || index === 0"
  }
}
```

**含义**：执行自定义 JavaScript 表达式

**可用变量**：
- `record`: 当前行的数据对象
- `index`: 当前行的索引（从 0 开始）

**注意事项**：
- 表达式必须返回布尔值
- 不要使用复杂逻辑，保持简洁
- 建议优先使用前 4 种类型，只在必要时使用 custom

---

## 完整示例

### 后端接口返回

```json
{
  "headerMerge": [
    {
      "startColumn": "ctrip",
      "colSpan": 3,
      "title": "OTA渠道",
      "align": "center"
    },
    {
      "startColumn": "official",
      "colSpan": 2,
      "title": "直销渠道",
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

### 前端代码

```tsx
import { useEffect, useState } from 'react';
import { MergeTable, parseMergeConfig, validateBackendConfig } from '@/components/MergeTable';
import type { BackendMergeConfig } from '@/components/MergeTable';

function OTAReportTable() {
  const [data, setData] = useState([]);
  const [backendConfig, setBackendConfig] = useState<BackendMergeConfig>();

  useEffect(() => {
    // 加载数据和配置
    Promise.all([
      fetch('/api/report/data').then(res => res.json()),
      fetch('/api/report/merge-config').then(res => res.json())
    ]).then(([tableData, config]) => {
      // 验证配置格式
      const validation = validateBackendConfig(config);
      if (!validation.valid) {
        console.error('配置格式错误:', validation.errors);
        return;
      }

      setData(tableData);
      setBackendConfig(config);
    });
  }, []);

  const columns = [
    { title: '日期', dataIndex: 'date' },
    { title: '酒店', dataIndex: 'hotel' },
    { title: '携程', dataIndex: 'ctrip' },
    { title: '美团', dataIndex: 'meituan' },
    { title: '飞猪', dataIndex: 'fliggy' },
    { title: '官网', dataIndex: 'official' },
    { title: '微信', dataIndex: 'wechat' },
  ];

  // 解析后端配置
  const mergeConfig = parseMergeConfig(backendConfig);

  return (
    <MergeTable
      dataSource={data}
      columns={columns}
      mergeConfig={mergeConfig}
      bordered
    />
  );
}
```

---

## 后端实现参考（Node.js）

### 配置存储（数据库 or 配置文件）

```javascript
// config/table-merge-config.json
{
  "ota-report": {
    "headerMerge": [...],
    "cellMerge": [...],
    "rowMerge": [...]
  },
  "hotel-summary": {
    "headerMerge": [...],
    "cellMerge": [...]
  }
}
```

### API 接口

```javascript
// routes/merge-config.js
const express = require('express');
const router = express.Router();
const configs = require('../config/table-merge-config.json');

// 获取表格合并配置
router.get('/api/merge-config/:tableType', (req, res) => {
  const { tableType } = req.params;
  const config = configs[tableType];

  if (!config) {
    return res.status(404).json({ error: '配置不存在' });
  }

  res.json(config);
});

// 更新表格合并配置（管理后台使用）
router.post('/api/merge-config/:tableType', (req, res) => {
  const { tableType } = req.params;
  const newConfig = req.body;

  // 验证配置格式
  // ... 验证逻辑

  // 保存配置
  configs[tableType] = newConfig;

  res.json({ success: true });
});

module.exports = router;
```

---

## 配置验证

使用 `validateBackendConfig` 验证配置格式：

```tsx
import { validateBackendConfig } from '@/components/MergeTable';

const config = await fetch('/api/merge-config').then(res => res.json());

const validation = validateBackendConfig(config);
if (!validation.valid) {
  console.error('配置错误:', validation.errors);
  // 错误示例：
  // [
  //   "headerMerge[0] 缺少 startColumn",
  //   "cellMerge[1] dependsOn 必须是数组",
  //   "rowMerge[0] 缺少 condition"
  // ]
}
```

---

## 常见问题

### Q1: 后端配置是否需要和前端 columns 顺序一致？

**A**: 不需要。配置是基于 `dataIndex` 字段匹配的，和顺序无关。

---

### Q2: 如何动态切换不同的合并配置？

**A**: 直接更新 `backendConfig` 状态即可，`parseMergeConfig` 会自动重新解析。

```tsx
const [configType, setConfigType] = useState('default');
const [backendConfig, setBackendConfig] = useState();

useEffect(() => {
  fetch(`/api/merge-config/${configType}`)
    .then(res => res.json())
    .then(setBackendConfig);
}, [configType]);
```

---

### Q3: custom 条件表达式有什么限制？

**A**:
- 表达式会通过 `new Function()` 执行，比 `eval` 更安全
- 可用变量：`record`（当前行数据）、`index`（行索引）
- 必须返回布尔值
- 不建议在表达式中执行复杂逻辑

---

### Q4: 配置可以缓存吗？

**A**: 可以。建议在前端缓存配置，避免每次都请求：

```tsx
// 使用 localStorage 缓存
const cachedConfig = localStorage.getItem('merge-config');
if (cachedConfig) {
  setBackendConfig(JSON.parse(cachedConfig));
} else {
  fetch('/api/merge-config')
    .then(res => res.json())
    .then(config => {
      localStorage.setItem('merge-config', JSON.stringify(config));
      setBackendConfig(config);
    });
}
```

---

## TypeScript 类型定义

完整的类型定义请查看 [configParser.ts](./configParser.ts)

```typescript
import type { BackendMergeConfig } from '@/components/MergeTable';

// 后端接口返回类型
interface TableConfigResponse {
  data: any[];
  mergeConfig: BackendMergeConfig;
}
```
