# @wtechtec/mobile-table

一个专为移动端设计的React表格组件，基于NutUI构建，支持固定列、排序、单元格合并等功能。


## 安装

```bash
npm install @wtechtec/mobile-table
# 或
yarn add @wtechtec/mobile-table
# 或
pnpm add @wtechtec/mobile-table
```



## 基础用法
[NutUI-React](https://nutui.jd.com/h5/react/2x/#/zh-CN/guide/intro-react)

### 单元格合并

```tsx
const columns = [
  {
    key: 'category',
    title: '分类',
    onCell: (rowData, rowIndex) => {
      // 合并相同分类的单元格
      if (rowIndex === 0) {
        return { rowSpan: 2 };
      }
      if (rowIndex === 1) {
        return { rowSpan: 0 }; // 被合并的单元格
      }
      return {};
    }
  },
  {
    key: 'name',
    title: '名称'
  }
];
```


### 合并工具函数

#### `createMultiRowColumnMergeCellConfig`

创建多行多列合并配置映射表

**参数：**
- `data: any[]` - 表格数据数组
- `columns: string[]` - 需要参与合并的列名数组

**返回值：**
- `Map<string, MergeInfo>` - 合并配置映射表

**示例：**
```tsx
const mergeCellMap = createMultiRowColumnMergeCellConfig(data, ['gender', 'age', 'class']);
```
#### `createMultiMergeOnCellFunction`

基于合并配置生成列的 onCell 函数

**参数：**
- `mergeCellMap: Map<string, any>` - 合并配置映射表
- `columnKey: string` - 当前列的key
- `emptyCellStyle?: (data: any, rowIndex: number) => { style: CSSProperties }` - 空单元格样式函数（可选）
- `mergeCellStyle?: (data: any, rowIndex: number) => { style: CSSProperties }` - 合并单元格样式函数（可选）

**返回值：**
- `(rowData: any, rowIndex: number) => CellConfig` - onCell函数

**示例：**
```tsx
const onCellFunction = createMultiMergeOnCellFunction(
  mergeCellMap, 
  'gender', 
  emptyCellStyle, 
  mergeCellStyle
);
```

### 使用
```
import { createMultiMergeOnCellFunction, createMultiRowColumnMergeCellConfig } from '@wtechtec/mobile-table';


 // 指定要参与合并的列
const mergeColumns = ['gender', 'age', 'class', 'address', 'phone']
  
  // 创建多行多列合并配置
const multiMergeCellMap = createMultiRowColumnMergeCellConfig(data, mergeColumns)

```



