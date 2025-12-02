# MergeTable 表格合并组件

支持单元格行合并和表头列合并的 Ant Design Table 增强组件。

## 功能特性

- ✅ **单元格行合并**（基于数据源自动计算 `rowSpan`）
- ✅ **列级联合并**（支持依赖关系）
- ✅ **表头列合并**（多级表头）
- ✅ **行内列合并**（横向合并单元格 `colSpan`）
- ✅ **后端配置支持**（所有合并配置可通过接口返回）
- ✅ TypeScript 类型安全
- ✅ 性能优化（useMemo 缓存）
- ✅ 配置验证

## 快速开始

### 基础用法

```tsx
import { MergeTable } from '@/components/MergeTable';

function MyTable() {
  const data = [
    { date: '1月1日', hotel: '希尔顿', revenue: 100 },
    { date: '1月1日', hotel: '万豪', revenue: 150 },
    { date: '1月2日', hotel: '希尔顿', revenue: 120 },
  ];

  const columns = [
    { title: '日期', dataIndex: 'date' },
    { title: '酒店', dataIndex: 'hotel' },
    { title: '收入', dataIndex: 'revenue' },
  ];

  return (
    <MergeTable
      dataSource={data}
      columns={columns}
      mergeConfig={{
        cellMerge: [
          { field: 'date' }, // 日期相同时合并
        ],
      }}
      bordered
    />
  );
}
```

### 列级联合并

第二列只在第一列相同的分组内合并：

```tsx
<MergeTable
  dataSource={data}
  columns={columns}
  mergeConfig={{
    cellMerge: [
      { field: 'date' }, // 独立合并
      { field: 'hotel', dependsOn: ['date'] }, // 在 date 相同时才合并
    ],
  }}
/>
```

### 表头合并

```tsx
const columns = [
  { title: '日期', dataIndex: 'date' },
  { title: '携程', dataIndex: 'ctrip' },
  { title: '美团', dataIndex: 'meituan' },
  { title: '飞猪', dataIndex: 'fliggy' },
];

<MergeTable
  dataSource={data}
  columns={columns}
  mergeConfig={{
    headerMerge: [
      {
        startColumn: 'ctrip',
        colSpan: 3,
        title: 'OTA渠道',
        align: 'center',
        hideChildren: false, // 默认 false，显示多级表头
      },
    ],
  }}
  bordered
/>;
```

**hideChildren 参数说明**：
- `false`（默认）：显示多级表头
- `true`：隐藏子表头，只显示合并后的标题

```tsx
// 隐藏子表头示例
headerMerge: [
  {
    startColumn: 'ctrip',
    colSpan: 3,
    title: 'OTA渠道',
    hideChildren: true, // 不显示 "携程"、"美团"、"飞猪" 子表头
  }
]
```

### 行内列合并（横向合并）

某一行的单元格横向合并多列：

```tsx
const data = [
  { type: 'summary', name: '总计', value1: 100, value2: 200 },
  { type: 'detail', name: '明细1', value1: 50, value2: 100 },
];

<MergeTable
  dataSource={data}
  columns={columns}
  mergeConfig={{
    rowMerge: [
      {
        startColumn: 'type',
        colSpan: 2, // 合并 type 和 name 列
        condition: (record) => record.type === 'summary', // 满足条件时才合并
      },
    ],
  }}
  bordered
/>;
```

### 组合使用

```tsx
<MergeTable
  dataSource={data}
  columns={columns}
  mergeConfig={{
    // 表头合并
    headerMerge: [
      { startColumn: 'ctrip', colSpan: 3, title: 'OTA渠道' },
      { startColumn: 'official', colSpan: 2, title: '直销渠道' },
    ],
    // 单元格行合并（纵向）
    cellMerge: [
      { field: 'date' },
      { field: 'hotel', dependsOn: ['date'] },
    ],
    // 行内列合并（横向）
    rowMerge: [
      {
        startColumn: 'date',
        colSpan: 2,
        condition: (record) => record.date === '汇总',
      },
    ],
  }}
  bordered
/>
```

### 使用后端配置

所有合并配置都可以通过后端接口返回：

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
      bordered
    />
  );
}
```

**后端返回格式示例**：

```json
{
  "headerMerge": [
    { "startColumn": "ctrip", "colSpan": 3, "title": "OTA渠道" }
  ],
  "cellMerge": [
    { "field": "date" },
    { "field": "hotel", "dependsOn": ["date"] }
  ],
  "rowMerge": [
    {
      "startColumn": "date",
      "colSpan": 2,
      "condition": { "type": "fieldEquals", "field": "date", "value": "汇总" }
    }
  ]
}
```

**详细文档**: 查看 [后端配置指南](./BACKEND_CONFIG.md)

## API

### MergeTable Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| dataSource | 数据源 | `T[]` | - |
| columns | 列配置 | `ColumnType<T>[]` | - |
| mergeConfig | 合并配置 | `TableMergeConfig<T>` | - |
| ...restProps | 其他 antd Table 属性 | - | - |

### TableMergeConfig

```typescript
interface TableMergeConfig<T> {
  // 表头合并配置
  headerMerge?: HeaderMergeConfig[];
  // 单元格行合并配置（纵向合并 - rowSpan）
  cellMerge?: ColumnMergeConfig<T>[];
  // 单元格列合并配置（横向合并 - colSpan）
  rowMerge?: RowMergeConfig<T>[];
}
```

### ColumnMergeConfig

```typescript
interface ColumnMergeConfig<T> {
  // 要合并的字段
  field: keyof T;
  // 依赖的父列字段（必须与父列值相同才能合并）
  dependsOn?: (keyof T)[];
}
```

### HeaderMergeConfig

```typescript
interface HeaderMergeConfig {
  // 起始列的 dataIndex
  startColumn: string;
  // 合并的列数
  colSpan: number;
  // 合并后显示的标题
  title: string;
  // 对齐方式
  align?: 'left' | 'center' | 'right';
}
```

### RowMergeConfig

```typescript
interface RowMergeConfig<T> {
  // 起始列字段
  startColumn: keyof T;
  // 合并的列数
  colSpan: number;
  // 判断条件：返回 true 时进行合并
  condition: (record: T, index: number) => boolean;
}
```

## Hooks

### useTableMerge

如果需要更灵活的控制，可以直接使用 Hook：

```tsx
import { useTableMerge } from '@/components/MergeTable';
import { Table } from 'antd';

function CustomTable() {
  const data = [...];
  const baseColumns = [...];

  const { applyMergeToColumns, getOnCell } = useTableMerge(data, {
    cellMerge: [{ field: 'date' }],
  });

  const columns = applyMergeToColumns(baseColumns);

  return <Table dataSource={data} columns={columns} />;
}
```

## 工具函数

### calculateMultiColumnMerge

计算多列的行合并配置：

```typescript
import { calculateMultiColumnMerge } from '@/components/MergeTable';

const mergeData = calculateMultiColumnMerge(dataSource, [
  { field: 'date' },
  { field: 'hotel', dependsOn: ['date'] },
]);
// 返回: { date: [2, 0, 1], hotel: [1, 1, 1] }
```

### applyHeaderMerge

应用表头合并到 columns：

```typescript
import { applyHeaderMerge } from '@/components/MergeTable';

const mergedColumns = applyHeaderMerge(columns, [
  { startColumn: 'ctrip', colSpan: 3, title: 'OTA渠道' },
]);
```

## 实际案例

### OTA月报表格

```tsx
function OTAReportTable() {
  const data = [
    { date: '1月1日', hotel: '希尔顿', ctrip: 10, meituan: 8, fliggy: 5, official: 12, wechat: 6 },
    { date: '1月1日', hotel: '万豪', ctrip: 15, meituan: 10, fliggy: 7, official: 20, wechat: 9 },
    { date: '1月2日', hotel: '希尔顿', ctrip: 12, meituan: 9, fliggy: 6, official: 15, wechat: 8 },
  ];

  const columns = [
    { title: '日期', dataIndex: 'date', width: 100, fixed: 'left' },
    { title: '酒店', dataIndex: 'hotel', width: 120, fixed: 'left' },
    { title: '携程', dataIndex: 'ctrip', width: 80 },
    { title: '美团', dataIndex: 'meituan', width: 80 },
    { title: '飞猪', dataIndex: 'fliggy', width: 80 },
    { title: '官网', dataIndex: 'official', width: 80 },
    { title: '微信', dataIndex: 'wechat', width: 80 },
  ];

  return (
    <MergeTable
      dataSource={data}
      columns={columns}
      mergeConfig={{
        headerMerge: [
          { startColumn: 'ctrip', colSpan: 3, title: 'OTA渠道', align: 'center' },
          { startColumn: 'official', colSpan: 2, title: '直销渠道', align: 'center' },
        ],
        cellMerge: [
          { field: 'date' },
          { field: 'hotel', dependsOn: ['date'] },
        ],
      }}
      bordered
      scroll={{ x: 800 }}
      pagination={false}
    />
  );
}
```

### 渲染效果

```
┌────────┬────────┬───────────────────────────┬─────────────────────┐
│  日期  │  酒店  │       OTA渠道             │     直销渠道        │
│        │        ├────────┬────────┬────────┼──────────┬─────────┤
│        │        │  携程  │  美团  │  飞猪  │   官网   │  微信   │
├────────┼────────┼────────┼────────┼────────┼──────────┼─────────┤
│ 1月1日 │ 希尔顿 │   10   │   8    │   5    │    12    │    6    │
│        ├────────┼────────┼────────┼────────┼──────────┼─────────┤
│        │  万豪  │   15   │   10   │   7    │    20    │    9    │
├────────┼────────┼────────┼────────┼────────┼──────────┼─────────┤
│ 1月2日 │ 希尔顿 │   12   │   9    │   6    │    15    │    8    │
└────────┴────────┴────────┴────────┴────────┴──────────┴─────────┘
```

## 注意事项

1. **数据源顺序**：合并计算依赖数据源的顺序，相同值必须连续
2. **依赖关系**：`dependsOn` 中的字段必须在前面的 `cellMerge` 配置中定义
3. **表头合并**：`startColumn` 必须是有效的 `dataIndex`，且合并列数不能超出范围
4. **性能优化**：大数据量时，合并计算会自动通过 `useMemo` 缓存

## 类型定义

完整的类型定义请查看 [types.ts](./types.ts)
