import type { ColumnType } from 'antd/es/table';

/**
 * 单元格行合并配置（纵向合并 - rowSpan）
 */
export interface ColumnMergeConfig<T> {
  // 要合并的字段
  field: keyof T;
  // 依赖的父列字段（必须与父列值相同才能合并）
  dependsOn?: (keyof T)[];
}

/**
 * 单元格列合并配置（横向合并 - colSpan）
 */
export interface RowMergeConfig<T> {
  // 起始列字段
  startColumn: keyof T;
  // 合并的列数
  colSpan: number;
  // 判断条件：返回 true 时进行合并
  condition: (record: T, index: number) => boolean;
  // 合并后被隐藏的列字段（自动计算，无需配置）
  hiddenColumns?: (keyof T)[];
}

/**
 * 表头合并配置
 */
export interface HeaderMergeConfig {
  // 起始列的 dataIndex
  startColumn: string;
  // 合并的列数
  colSpan: number;
  // 合并后显示的标题
  title: string;
  // 对齐方式
  align?: 'left' | 'center' | 'right';
  // 是否隐藏子表头（默认 false，显示多级表头）
  hideChildren?: boolean;
}

/**
 * 完整的表格合并配置
 */
export interface TableMergeConfig<T> {
  // 表头合并配置
  headerMerge?: HeaderMergeConfig[];
  // 单元格行合并配置（纵向合并 - rowSpan）
  cellMerge?: ColumnMergeConfig<T>[];
  // 单元格列合并配置（横向合并 - colSpan）
  rowMerge?: RowMergeConfig<T>[];
}

/**
 * 单元格合并结果
 */
export interface MergeCell {
  rowSpan?: number;
  colSpan?: number;
}

/**
 * 合并数据计算结果
 */
export type MergeDataResult = Record<string, number[]>;

/**
 * MergeTable 组件 Props
 */
export interface MergeTableProps<T extends Record<string, any>> {
  // 表格数据源
  dataSource: T[];
  // 基础列配置
  columns: ColumnType<T>[];
  // 合并配置
  mergeConfig?: TableMergeConfig<T>;
  // 其他 antd Table 的 props
  [key: string]: any;
}
