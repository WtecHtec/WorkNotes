# MergeTable 使用指南

## 快速理解三种合并方式

### 1. 单元格行合并（cellMerge）- 纵向合并 ⬇️

**用途**：相同值的单元格自动纵向合并

```tsx
const data = [
  { date: '1月1日', hotel: '希尔顿', revenue: 100 },
  { date: '1月1日', hotel: '万豪', revenue: 150 },  // date 相同，会合并
  { date: '1月2日', hotel: '希尔顿', revenue: 120 },
];

mergeConfig={{
  cellMerge: [
    { field: 'date' }  // date 列相同值会纵向合并
  ]
}}
```

**渲染效果**：
```
┌────────┬────────┬─────────┐
│ 1月1日 │ 希尔顿 │  100    │
│        ├────────┼─────────┤
│        │  万豪  │  150    │
├────────┼────────┼─────────┤
│ 1月2日 │ 希尔顿 │  120    │
└────────┴────────┴─────────┘
```

---

### 2. 表头合并（headerMerge）- 多级表头 ↔️

**用途**：将多个列的表头合并成一个父表头

```tsx
const columns = [
  { title: '携程', dataIndex: 'ctrip' },
  { title: '美团', dataIndex: 'meituan' },
  { title: '飞猪', dataIndex: 'fliggy' },
];

mergeConfig={{
  headerMerge: [
    {
      startColumn: 'ctrip',
      colSpan: 3,
      title: 'OTA渠道'  // 将三列合并到一个父表头
    }
  ]
}}
```

**渲染效果**：
```
┌─────────────────────────┐
│       OTA渠道           │
├────────┬────────┬────────┤
│  携程  │  美团  │  飞猪  │
├────────┼────────┼────────┤
│   10   │   8    │   5    │
└────────┴────────┴────────┘
```

---

### 3. 行内列合并（rowMerge）- 横向合并 ➡️

**用途**：某一行的单元格横向合并多列（比如汇总行）

```tsx
const data = [
  { type: 'summary', name: '总计', value1: 100, value2: 200 },  // 第一行
  { type: 'detail', name: '明细1', value1: 50, value2: 100 },   // 第二行
];

mergeConfig={{
  rowMerge: [
    {
      startColumn: 'type',
      colSpan: 2,  // 合并 type 和 name 两列
      condition: (record) => record.type === 'summary'  // 只有 summary 类型才合并
    }
  ]
}}
```

**渲染效果**：
```
┌─────────────────┬────────┬────────┐
│      总计       │  100   │  200   │  ← type 和 name 列被合并
├────────┬────────┼────────┼────────┤
│ detail │ 明细1  │   50   │  100   │  ← 正常显示
└────────┴────────┴────────┴────────┘
```

---

## 实际场景示例

### 场景 1：OTA 月报表（组合使用）

```tsx
const data = [
  { date: '汇总', hotel: '全部', ctrip: 100, meituan: 80, official: 120 },
  { date: '1月1日', hotel: '希尔顿', ctrip: 10, meituan: 8, official: 12 },
  { date: '1月1日', hotel: '万豪', ctrip: 15, meituan: 10, official: 20 },
];

<MergeTable
  dataSource={data}
  columns={columns}
  mergeConfig={{
    // 1. 表头合并：将 OTA 渠道列合并
    headerMerge: [
      { startColumn: 'ctrip', colSpan: 2, title: 'OTA渠道' }
    ],

    // 2. 单元格行合并：相同日期的行合并
    cellMerge: [
      { field: 'date' },
      { field: 'hotel', dependsOn: ['date'] }  // 只在同一日期内合并酒店
    ],

    // 3. 行内列合并：第一行的汇总行，合并日期和酒店列
    rowMerge: [
      {
        startColumn: 'date',
        colSpan: 2,
        condition: (record) => record.date === '汇总'
      }
    ]
  }}
/>
```

**渲染效果**：
```
┌─────────────────┬──────────────┬─────────┐
│                 │   OTA渠道    │ 直销    │
│                 ├────────┬─────┤         │
│                 │  携程  │美团 │  官网   │
├─────────────────┼────────┼─────┼─────────┤
│   汇总 - 全部   │  100   │ 80  │  120    │  ← 前两列合并
├────────┬────────┼────────┼─────┼─────────┤
│ 1月1日 │ 希尔顿 │   10   │  8  │   12    │
│        ├────────┼────────┼─────┼─────────┤
│        │  万豪  │   15   │ 10  │   20    │
└────────┴────────┴────────┴─────┴─────────┘
```

---

## 配置技巧

### 1. cellMerge 的 dependsOn

```tsx
cellMerge: [
  { field: 'date' },                      // 日期独立合并
  { field: 'hotel', dependsOn: ['date'] } // 酒店只在相同日期内合并
]
```

**效果**：
- 如果没有 `dependsOn`，所有相同酒店名会合并（即使日期不同）
- 有了 `dependsOn: ['date']`，只有在**相同日期**下，相同酒店名才会合并

---

### 2. rowMerge 的 condition 函数

```tsx
rowMerge: [
  {
    startColumn: 'date',
    colSpan: 2,
    condition: (record, index) => {
      // 可以基于数据内容判断
      if (record.type === 'summary') return true;

      // 也可以基于行号判断
      if (index === 0) return true;

      // 或者更复杂的逻辑
      return record.date === '汇总' && record.hotel === '全部';
    }
  }
]
```

---

## 常见问题

### Q1: 为什么我的行合并没有生效？

**A**: 确保数据源中相同的值是**连续的**。合并是基于顺序计算的。

```tsx
// ❌ 错误：相同值不连续
[
  { date: '1月1日', ... },
  { date: '1月2日', ... },
  { date: '1月1日', ... },  // 不会和第一行合并！
]

// ✅ 正确：相同值连续
[
  { date: '1月1日', ... },
  { date: '1月1日', ... },  // 会合并
  { date: '1月2日', ... },
]
```

---

### Q2: cellMerge 和 rowMerge 有什么区别？

**A**:
- **cellMerge**：纵向合并（rowSpan），多行合并成一个单元格 ⬇️
- **rowMerge**：横向合并（colSpan），一行内多列合并成一个单元格 ➡️

---

### Q3: 可以同时使用多个合并配置吗？

**A**: 可以！三种合并方式可以同时使用：

```tsx
mergeConfig={{
  headerMerge: [...],  // 表头合并
  cellMerge: [...],    // 单元格行合并
  rowMerge: [...]      // 单元格列合并
}}
```

---

## 类型安全

所有配置都有完整的 TypeScript 类型支持：

```tsx
interface MyData {
  date: string;
  hotel: string;
  revenue: number;
}

const config: TableMergeConfig<MyData> = {
  cellMerge: [
    { field: 'date' },           // ✅ 正确
    { field: 'invalidField' }    // ❌ TypeScript 会报错
  ]
};
```

---

## 性能说明

- 所有合并计算都通过 `useMemo` 缓存
- 只有在 `dataSource` 或 `mergeConfig` 变化时才重新计算
- 适用于大数据量场景（已测试 1000+ 行）
