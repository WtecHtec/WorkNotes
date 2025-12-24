# Heatmap 组件

热力图组件，使用 Tailwind CSS 编写样式，可独立使用。

## 特性

- ✅ 使用 Tailwind CSS，无需外部样式文件
- ✅ 支持热力图列和普通文本列混合显示
- ✅ 完全可配置的颜色方案
- ✅ 支持动画和闪光效果
- ✅ 响应式设计，自适应布局
- ✅ 完整的 TypeScript 类型支持

## 基本用法

```tsx
import Heatmap from "./components/Heatmap";

const dataSource = [
  { label: "周一", h0: 50, h1: 30, h2: 40 },
  { label: "周二", h0: 20, h1: 50, h2: 30 },
];

const columns = [
  { title: "星期", dataIndex: "label", isHeat: false }, // 文本列
  { title: "00", dataIndex: "h0", isHeat: true },      // 热力图列
  { title: "01", dataIndex: "h1", isHeat: true },
  { title: "02", dataIndex: "h2", isHeat: true },
];

<Heatmap dataSource={dataSource} columns={columns} />
```

## Props

### 必填参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `dataSource` | `HeatmapRowData[]` | 数据源数组 |
| `columns` | `HeatmapColumn[]` | 列配置数组 |

### 可选参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `colorScheme` | `ColorSchemeItem[]` | 默认配色 | 颜色方案配置 |
| `maxValue` | `number` | `100` | 最大值，用于计算颜色 |
| `minCellSize` | `number` | `6` | 格子最小宽度（px） |
| `gap` | `number` | `0` | 格子间距（px） |
| `enableAnimation` | `boolean` | `true` | 是否启用动画 |
| `enableShimmer` | `boolean` | `true` | 是否启用闪光效果 |
| `onCellClick` | `function` | - | 单元格点击回调 |
| `onCellHover` | `function` | - | 单元格悬停回调 |
| `formatTooltip` | `function` | - | 自定义 tooltip 格式化 |

## 类型定义

### HeatmapRowData

```tsx
interface HeatmapRowData {
  [key: string]: number | string;
}
```

### HeatmapColumn

```tsx
interface HeatmapColumn {
  title: string;        // 列标题
  dataIndex: string;    // 数据字段名
  width?: number;       // 列宽度（可选）
  isHeat?: boolean;     // 是否为热力图列（默认 true）
}
```

### ColorSchemeItem

```tsx
interface ColorSchemeItem {
  threshold: number;    // 阈值（0-100）
  color: string;        // 颜色值
}
```

## 完整示例

```tsx
import Heatmap from "./components/Heatmap";

const Example = () => {
  const dataSource = [
    { day: "周一", h0: 10, h1: 20, h2: 30 },
    { day: "周二", h0: 40, h1: 50, h2: 60 },
    { day: "周三", h0: 70, h1: 80, h2: 90 },
  ];

  const columns = [
    { title: "日期", dataIndex: "day", isHeat: false },
    { title: "00:00", dataIndex: "h0", isHeat: true },
    { title: "01:00", dataIndex: "h1", isHeat: true },
    { title: "02:00", dataIndex: "h2", isHeat: true },
  ];

  const handleCellClick = (row, dataIndex, value) => {
    console.log("点击了：", row, dataIndex, value);
  };

  return (
    <Heatmap
      dataSource={dataSource}
      columns={columns}
      colorScheme={[
        { threshold: 0, color: "#ebedf0" },
        { threshold: 25, color: "#c6e48b" },
        { threshold: 50, color: "#7bc96f" },
        { threshold: 75, color: "#239a3b" },
      ]}
      maxValue={100}
      minCellSize={10}
      gap={2}
      enableAnimation={true}
      enableShimmer={true}
      onCellClick={handleCellClick}
    />
  );
};
```

## 注意事项

1. **Tailwind CSS 配置**：确保项目已正确配置 Tailwind CSS
2. **isHeat 字段**：
   - `isHeat: false` - 显示为普通文本列
   - `isHeat: true` 或不设置 - 显示为热力图列
3. **数据格式**：dataSource 中的字段名必须与 columns 中的 dataIndex 对应
4. **颜色方案**：threshold 值为 0-100 的百分比，会根据 maxValue 自动计算
