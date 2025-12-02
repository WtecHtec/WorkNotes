/**
 * 后端接口类型定义
 * 供后端开发人员参考，确保接口返回格式正确
 */

/**
 * 表格合并配置（后端接口返回）
 */
export interface BackendMergeConfig {
  /** 表头合并配置 */
  headerMerge?: BackendHeaderMergeConfig[];
  /** 单元格行合并配置（纵向合并） */
  cellMerge?: BackendColumnMergeConfig[];
  /** 单元格列合并配置（横向合并） */
  rowMerge?: BackendRowMergeConfig[];
}

/**
 * 表头合并配置
 */
export interface BackendHeaderMergeConfig {
  /** 起始列的 dataIndex */
  startColumn: string;
  /** 合并的列数 */
  colSpan: number;
  /** 合并后显示的标题 */
  title: string;
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right';
  /** 是否隐藏子表头（默认 false） */
  hideChildren?: boolean;
}

/**
 * 单元格行合并配置
 */
export interface BackendColumnMergeConfig {
  /** 要合并的字段名 */
  field: string;
  /** 依赖的父列字段（可选）*/
  dependsOn?: string[];
}

/**
 * 单元格列合并配置
 */
export interface BackendRowMergeConfig {
  /** 起始列的 dataIndex */
  startColumn: string;
  /** 合并的列数 */
  colSpan: number;
  /** 判断条件配置 */
  condition: BackendCondition;
}

/**
 * 条件配置（支持多种类型）
 */
export type BackendCondition =
  | BackendFieldEqualsCondition
  | BackendFieldInCondition
  | BackendRowIndexCondition
  | BackendRowIndexRangeCondition
  | BackendCustomCondition;

/**
 * 字段等于某值
 */
export interface BackendFieldEqualsCondition {
  type: 'fieldEquals';
  /** 字段名 */
  field: string;
  /** 匹配值 */
  value: any;
}

/**
 * 字段在数组中
 */
export interface BackendFieldInCondition {
  type: 'fieldIn';
  /** 字段名 */
  field: string;
  /** 匹配值数组 */
  values: any[];
}

/**
 * 行号在数组中
 */
export interface BackendRowIndexCondition {
  type: 'rowIndex';
  /** 行号数组（从 0 开始）*/
  indices: number[];
}

/**
 * 行号在范围内
 */
export interface BackendRowIndexRangeCondition {
  type: 'rowIndexRange';
  /** 起始行号（包含）*/
  start: number;
  /** 结束行号（包含）*/
  end: number;
}

/**
 * 自定义表达式
 */
export interface BackendCustomCondition {
  type: 'custom';
  /** JavaScript 表达式字符串，可使用 record 和 index 变量 */
  expression: string;
}

/**
 * 完整的后端响应格式
 */
export interface TableConfigResponse<T = any> {
  /** 表格数据 */
  data: T[];
  /** 合并配置 */
  mergeConfig?: BackendMergeConfig;
  /** 其他字段... */
  [key: string]: any;
}

/**
 * 配置验证结果
 */
export interface ConfigValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误信息数组 */
  errors: string[];
}
