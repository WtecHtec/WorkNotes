# FlexTable 组件使用文档

## 概述

FlexTable 是一个高性能的 React 表格组件,支持固定列、固定表头、固定首行等功能,并提供灵活的样式定制能力。

## 主要特性

- ✅ 使用 CSS 类名管理样式,性能更优
- ✅ 支持通过 props 传入样式(对象或函数形式)
- ✅ 仅必要的计算属性使用内联样式(如偏移量、宽度等)
- ✅ 支持固定列(左侧/右侧)
- ✅ 支持固定表头和固定首行
- ✅ 支持自定义渲染函数

## 基础用法

```tsx
import FlexTable from './flex-table/tablev1';

const columns = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
    width: 150
  },
  {
    title: '年龄',
    dataIndex: 'age',
    key: 'age',
    width: 100
  }
];

const dataSource = [
  { key: '1', name: '张三', age: 28 },
  { key: '2', name: '李四', age: 32 }
];

<FlexTable
  columns={columns}
  dataSource={dataSource}
  height={600}
/>
```

## Props API

### 基础属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| columns | 列配置数组 | Column[] | [] |
| dataSource | 数据源数组 | any[] | [] |
| stickyHeader | 是否固定表头 | boolean | true |
| stickyFirstRow | 是否固定第一行数据 | boolean | false |
| stickyRows | 固定行数组 | number[] | [] |
| height | 表格高度 | number | 600 |
| rowKey | 行的唯一标识字段 | string | 'key' |

### 样式定制属性

所有样式属性都支持两种形式:

1. **对象形式**: 直接传入 CSS 样式对象
2. **函数形式**: 传入函数,接收相关参数,返回 CSS 样式对象

| 属性 | 说明 | 函数参数 |
|------|------|----------|
| containerStyle | 容器样式 | - |
| scrollWrapperStyle | 滚动容器样式 | - |
| headerStyle | 表头样式 | - |
| headerCellStyle | 表头单元格样式 | { column, index } |
| rowStyle | 数据行样式 | { record, index, isFirstRow } |
| cellStyle | 数据单元格样式 | { record, column, rowIndex, colIndex } |

### Column 配置

| 属性 | 说明 | 类型 |
|------|------|------|
| title | 列标题 | ReactNode |
| dataIndex | 数据字段名 | string |
| key | 唯一标识 | string |
| width | 列宽度 | number |
| fixed | 固定列位置 | 'left' \| 'right' |
| render | 自定义渲染函数 | (value, record, index) => ReactNode |

## 样式定制示例

### 1. 对象形式 - 简单样式

```tsx
<FlexTable
  columns={columns}
  dataSource={dataSource}
  containerStyle={{ background: '#f5f5f5', borderRadius: '8px' }}
  headerStyle={{ background: '#52c41a', color: 'white' }}
/>
```

### 2. 函数形式 - 条件样式

```tsx
<FlexTable
  columns={columns}
  dataSource={dataSource}
  // 根据列索引设置不同的表头单元格样式
  headerCellStyle={({ column, index }) => ({
    background: index % 2 === 0 ? '#1890ff' : '#096dd9',
    fontWeight: column.fixed ? 700 : 600
  })}
  // 根据数据动态设置行样式
  rowStyle={({ record, isFirstRow }) => ({
    background: isFirstRow
      ? '#e6f7ff'
      : record.status === 'active'
        ? '#f6ffed'
        : 'white'
  })}
  // 根据数值设置单元格样式
  cellStyle={({ record, column }) => {
    if (column.dataIndex === 'price' && record.price > 1000) {
      return { color: '#ff4d4f', fontWeight: 'bold' };
    }
    return {};
  }}
/>
```

### 3. 复杂业务场景

```tsx
<FlexTable
  columns={columns}
  dataSource={dataSource}
  // 容器边距和阴影
  containerStyle={{
    margin: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    borderRadius: '8px'
  }}
  // 自定义表头颜色渐变
  headerStyle={{
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  }}
  // 根据列类型设置不同的对齐方式
  headerCellStyle={({ column }) => ({
    justifyContent: column.align === 'right' ? 'flex-end' :
                    column.align === 'center' ? 'center' : 'flex-start'
  })}
  // 斑马纹效果
  rowStyle={({ index, isFirstRow }) => {
    if (isFirstRow) return { background: '#fff7e6' };
    return { background: index % 2 === 0 ? '#fafafa' : 'white' };
  }}
  // 高亮特定单元格
  cellStyle={({ record, column, colIndex }) => {
    // 高亮价格列
    if (column.dataIndex === 'price') {
      return {
        background: '#fff1f0',
        color: '#cf1322',
        fontWeight: 600
      };
    }
    // 固定列使用不同的边框
    if (column.fixed) {
      return { borderRight: '2px solid #1890ff' };
    }
    return {};
  }}
/>
```

## 固定列示例

```tsx
const columns = [
  {
    title: '姓名',
    dataIndex: 'name',
    width: 150,
    fixed: 'left' // 固定在左侧
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 120,
    fixed: 'right', // 固定在右侧
    render: (_, record) => (
      <button onClick={() => handleEdit(record)}>编辑</button>
    )
  }
];
```

## 自定义渲染示例

```tsx
const columns = [
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (text) => (
      <span style={{
        padding: '4px 12px',
        borderRadius: '4px',
        background: text === '激活' ? '#f6ffed' : '#fff1f0',
        color: text === '激活' ? '#52c41a' : '#ff4d4f'
      }}>
        {text}
      </span>
    )
  },
  {
    title: '价格',
    dataIndex: 'price',
    key: 'price',
    render: (text) => <span style={{ color: '#ff4d4f' }}>¥{text}</span>
  }
];
```

## 注意事项

1. **性能优化**: 大部分样式使用 CSS 类名,仅计算属性(如偏移量、宽度)使用内联样式
2. **函数形式**: 函数会在每次渲染时调用,注意性能优化,避免复杂计算
3. **固定列**: 固定列会自动计算偏移量,无需手动设置
4. **响应式**: 建议使用 `containerStyle` 或 `scrollWrapperStyle` 来设置响应式宽度

## 最佳实践

### 1. 使用 CSS 类名优先

如果样式是静态的,建议创建自定义 CSS 模块:

```css
/* custom.module.css */
.myTableContainer {
  border: 2px solid #1890ff;
  border-radius: 12px;
}
```

```tsx
import customStyles from './custom.module.css';

<div className={customStyles.myTableContainer}>
  <FlexTable ... />
</div>
```

### 2. 函数形式用于动态样式

只在需要根据数据动态变化的场景使用函数形式:

```tsx
// ✅ 推荐: 需要动态计算
cellStyle={({ record }) => ({
  color: record.value > 100 ? 'red' : 'black'
})}

// ❌ 不推荐: 静态样式
cellStyle={() => ({ padding: '10px' })}

// ✅ 推荐: 静态样式直接用对象
cellStyle={{ padding: '10px' }}
```

### 3. 避免过度定制

合理使用默认样式,只定制必要的部分,保持代码简洁。
