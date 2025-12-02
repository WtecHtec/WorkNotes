# hideChildren 功能说明

## 功能概述

`hideChildren` 是 `headerMerge` 配置中的一个可选参数，用于控制是否隐藏被合并的子表头。

## 使用场景

### 场景 1：表头空间有限
当列数较多，表头空间有限时，可以隐藏子表头来节省垂直空间。

### 场景 2：子列含义明确
当子列的含义已经通过父表头明确表达时，可以隐藏子表头避免冗余。

### 场景 3：简化界面
当需要更简洁的表格界面时，可以只显示父级分类。

---

## 参数说明

```typescript
interface HeaderMergeConfig {
  startColumn: string;
  colSpan: number;
  title: string;
  align?: 'left' | 'center' | 'right';
  hideChildren?: boolean; // 新增参数
}
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| hideChildren | boolean | false | 是否隐藏子表头 |

---

## 效果对比

### hideChildren = false (默认)

显示多级表头，父表头下方显示子表头：

```
┌────────┬────────┬────────────────────────┬─────────────────────┐
│  日期  │  酒店  │       OTA渠道          │     直销渠道        │
│        │        ├────────┬────────┬──────┼──────────┬─────────┤
│        │        │  携程  │  美团  │ 飞猪 │   官网   │  微信   │
├────────┼────────┼────────┼────────┼──────┼──────────┼─────────┤
│ 1月1日 │ 希尔顿 │   10   │   8    │  5   │    12    │    6    │
└────────┴────────┴────────┴────────┴──────┴──────────┴─────────┘
```

### hideChildren = true

只显示父表头，但保持列结构（每列独立显示数据）：

```
┌────────┬────────┬──────────────────────┬──────────────────────┐
│  日期  │  酒店  │      OTA渠道         │     直销渠道         │
├────────┼────────┼────────┬────────┬────┼──────────┬──────────┤
│ 1月1日 │ 希尔顿 │   10   │   8    │ 5  │    12    │    6     │
└────────┴────────┴────────┴────────┴────┴──────────┴──────────┘
```

**说明**：
- 表头只显示合并后的标题（OTA渠道、直销渠道）
- 子列的表头被隐藏（通过 `onHeaderCell` 设置 `colSpan: 0`）
- 数据行保持多列结构，每列独立显示数据

---

## 前端使用示例

### 基础用法

```tsx
import { MergeTable } from '@/components/MergeTable';

<MergeTable
  dataSource={data}
  columns={columns}
  mergeConfig={{
    headerMerge: [
      {
        startColumn: 'ctrip',
        colSpan: 3,
        title: 'OTA渠道',
        hideChildren: true, // 隐藏子表头
      },
      {
        startColumn: 'official',
        colSpan: 2,
        title: '直销渠道',
        hideChildren: false, // 显示子表头
      }
    ]
  }}
/>
```

### 混合模式

可以为不同的表头组设置不同的 `hideChildren` 值：

```tsx
headerMerge: [
  {
    startColumn: 'ctrip',
    colSpan: 3,
    title: 'OTA渠道',
    hideChildren: false, // OTA 显示子表头
  },
  {
    startColumn: 'official',
    colSpan: 2,
    title: '直销渠道',
    hideChildren: true, // 直销隐藏子表头
  }
]
```

---

## 后端配置示例

### JSON 配置

```json
{
  "headerMerge": [
    {
      "startColumn": "ctrip",
      "colSpan": 3,
      "title": "OTA渠道",
      "align": "center",
      "hideChildren": true
    },
    {
      "startColumn": "official",
      "colSpan": 2,
      "title": "直销渠道",
      "align": "center",
      "hideChildren": false
    }
  ]
}
```

### 后端接口示例（Node.js）

```javascript
app.get('/api/merge-config/ota-report', (req, res) => {
  res.json({
    headerMerge: [
      {
        startColumn: 'ctrip',
        colSpan: 3,
        title: 'OTA渠道',
        align: 'center',
        hideChildren: true, // 根据业务需求配置
      }
    ]
  });
});
```

---

## 实现原理

### hideChildren = false (默认)

使用 Ant Design Table 的 `children` 属性创建多级表头：

```typescript
{
  title: '父表头',
  children: [
    { title: '子表头1', dataIndex: 'col1' },
    { title: '子表头2', dataIndex: 'col2' },
  ]
}
```

### hideChildren = true

使用 `onHeaderCell` 隐藏子列表头：

```typescript
[
  {
    title: '父表头', // 第一列显示父标题
    dataIndex: 'col1',
    onHeaderCell: () => ({ colSpan: 2 }), // 表头占据 2 列
  },
  {
    title: '子表头2',
    dataIndex: 'col2',
    onHeaderCell: () => ({ colSpan: 0 }), // 表头被隐藏
  }
]
```

**关键点**：
- 第一列的 `onHeaderCell` 返回 `colSpan: n`（表头占据 n 列）
- 其他列的 `onHeaderCell` 返回 `colSpan: 0`（表头被隐藏）
- 数据行保持多列结构，每列独立渲染

---

## 注意事项

1. **表头合并实现**：
   - 使用 Ant Design Table 的 `onHeaderCell` 返回 `colSpan` 来实现表头合并
   - 第一列的表头占据多列宽度，其他列的表头通过 `colSpan: 0` 隐藏

2. **数据显示**：
   - 每列独立显示各自的数据
   - 保持原有的列结构和 `render` 函数
   - 每列的宽度、对齐方式等配置都保持不变

3. **兼容性**：
   - 与 `cellMerge` 和 `rowMerge` 完全兼容
   - 可以在同一个表格中混合使用
   - 支持与单元格行合并（rowSpan）同时使用

4. **默认值**：
   - 如果不设置 `hideChildren`，默认为 `false`（显示多级表头）
   - 这是为了保持向后兼容性

5. **列宽和样式**：
   - 每列保持独立的宽度配置
   - 可以为每列设置不同的对齐方式和样式
   - 表头合并不影响列的数据展示

---

## 完整示例

```tsx
import React, { useEffect, useState } from 'react';
import { MergeTable, parseMergeConfig } from '@/components/MergeTable';

function OTAReportTable() {
  const [config, setConfig] = useState();

  useEffect(() => {
    // 从后端获取配置
    fetch('/api/merge-config/ota-report')
      .then(res => res.json())
      .then(setConfig);
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

  const data = [
    { date: '1月1日', hotel: '希尔顿', ctrip: 10, meituan: 8, fliggy: 5, official: 12, wechat: 6 },
    { date: '1月2日', hotel: '万豪', ctrip: 15, meituan: 10, fliggy: 7, official: 20, wechat: 9 },
  ];

  const mergeConfig = parseMergeConfig(config);

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

## 相关文档

- [完整 API 文档](./README.md)
- [后端配置指南](./BACKEND_CONFIG.md)
- [使用指南](./USAGE.md)
- [示例代码](./HideChildrenExample.tsx)
