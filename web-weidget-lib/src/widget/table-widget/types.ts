export interface TableColumn {
  key: string; // 数据字段key
  title: string; // 表头标题
  minWidth?: string; // 最小宽度
  align?: 'left' | 'center' | 'right'; // 对齐方式
  className?: string; // 自定义样式类名
  render?: (value: any, row: any, index: number) => React.ReactNode; // 自定义渲染函数
  sort?: number;
  headRender?: (head: any) => React.ReactNode; // 自定义渲染函数
}

export interface TableRowData {
  [key: string]: any;
}

export interface ITableProp {
  fixedHeader?: boolean;
  columns: TableColumn[]; // 表头配置
  dataSource: TableRowData[]; // 表格数据
  rowKey?: string | ((record: TableRowData, index: number) => string); // 行key
  className?: string; // 表格容器样式
  headerClassName?: string; // 表头样式
  rowClassName?: string | ((record: TableRowData, index: number) => string); // 行样式
  maxHeightCls?: string;
  maxHeight?: number;
}
