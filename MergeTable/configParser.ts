import type { TableMergeConfig, HeaderMergeConfig, ColumnMergeConfig, RowMergeConfig } from './types';

/**
 * 后端返回的合并配置格式（JSON 可序列化）
 */
export interface BackendMergeConfig<T = any> {
  // 表头合并配置
  headerMerge?: BackendHeaderMergeConfig[];
  // 单元格行合并配置
  cellMerge?: BackendColumnMergeConfig[];
  // 行内列合并配置
  rowMerge?: BackendRowMergeConfig[];
}

/**
 * 后端表头合并配置
 */
export interface BackendHeaderMergeConfig {
  startColumn: string;
  colSpan: number;
  title: string;
  align?: 'left' | 'center' | 'right';
  hideChildren?: boolean;
}

/**
 * 后端单元格行合并配置
 */
export interface BackendColumnMergeConfig {
  field: string;
  dependsOn?: string[];
}

/**
 * 后端行内列合并配置
 */
export interface BackendRowMergeConfig {
  startColumn: string;
  colSpan: number;
  // 条件配置（支持多种条件类型）
  condition: BackendCondition;
}

/**
 * 后端条件配置
 */
export type BackendCondition =
  | { type: 'fieldEquals'; field: string; value: any } // 字段等于某值
  | { type: 'fieldIn'; field: string; values: any[] } // 字段在数组中
  | { type: 'rowIndex'; indices: number[] } // 行号在数组中
  | { type: 'rowIndexRange'; start: number; end: number } // 行号在范围内
  | { type: 'custom'; expression: string }; // 自定义表达式（eval）

/**
 * 解析后端返回的合并配置
 * @param backendConfig 后端返回的配置
 * @returns 前端可用的合并配置
 */
export function parseMergeConfig<T extends Record<string, any>>(
  backendConfig?: BackendMergeConfig<T>
): TableMergeConfig<T> | undefined {
  if (!backendConfig) return undefined;

  const result: TableMergeConfig<T> = {};

  // 解析表头合并配置
  if (backendConfig.headerMerge && backendConfig.headerMerge.length > 0) {
    result.headerMerge = parseHeaderMergeConfig(backendConfig.headerMerge);
  }

  // 解析单元格行合并配置
  if (backendConfig.cellMerge && backendConfig.cellMerge.length > 0) {
    result.cellMerge = parseColumnMergeConfig<T>(backendConfig.cellMerge);
  }

  // 解析行内列合并配置
  if (backendConfig.rowMerge && backendConfig.rowMerge.length > 0) {
    result.rowMerge = parseRowMergeConfig<T>(backendConfig.rowMerge);
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * 解析表头合并配置
 */
function parseHeaderMergeConfig(configs: BackendHeaderMergeConfig[]): HeaderMergeConfig[] {
  return configs.map(config => ({
    startColumn: config.startColumn,
    colSpan: config.colSpan,
    title: config.title,
    align: config.align || 'center',
    hideChildren: config.hideChildren || false,
  }));
}

/**
 * 解析单元格行合并配置
 */
function parseColumnMergeConfig<T extends Record<string, any>>(
  configs: BackendColumnMergeConfig[]
): ColumnMergeConfig<T>[] {
  return configs.map(config => ({
    field: config.field as keyof T,
    dependsOn: config.dependsOn ? (config.dependsOn as (keyof T)[]) : undefined,
  }));
}

/**
 * 解析行内列合并配置
 */
function parseRowMergeConfig<T extends Record<string, any>>(configs: BackendRowMergeConfig[]): RowMergeConfig<T>[] {
  return configs.map(config => ({
    startColumn: config.startColumn as keyof T,
    colSpan: config.colSpan,
    condition: createConditionFunction<T>(config.condition),
  }));
}

/**
 * 根据后端条件配置创建条件函数
 */
function createConditionFunction<T extends Record<string, any>>(
  condition: BackendCondition
): (record: T, index: number) => boolean {
  switch (condition.type) {
    case 'fieldEquals':
      // 字段等于某值
      return (record: T) => record[condition.field] === condition.value;

    case 'fieldIn':
      // 字段在数组中
      return (record: T) => condition.values.includes(record[condition.field]);

    case 'rowIndex':
      // 行号在数组中
      return (_: T, index: number) => condition.indices.includes(index);

    case 'rowIndexRange':
      // 行号在范围内
      return (_: T, index: number) => index >= condition.start && index <= condition.end;

    case 'custom':
      // 自定义表达式（使用 Function 构造器，比 eval 更安全）
      try {
        // 创建函数：new Function('record', 'index', 'return ' + expression)
        const func = new Function('record', 'index', `return ${condition.expression}`) as (
          record: T,
          index: number
        ) => boolean;
        return func;
      } catch (error) {
        console.error('[MergeTable] 自定义条件表达式解析失败:', error);
        return () => false;
      }

    default:
      console.warn('[MergeTable] 未知的条件类型:', (condition as any).type);
      return () => false;
  }
}

/**
 * 验证后端配置格式是否正确
 * @param config 后端配置
 * @returns 验证结果和错误信息
 */
export function validateBackendConfig(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config || typeof config !== 'object') {
    errors.push('配置必须是一个对象');
    return { valid: false, errors };
  }

  // 验证 headerMerge
  if (config.headerMerge) {
    if (!Array.isArray(config.headerMerge)) {
      errors.push('headerMerge 必须是数组');
    } else {
      config.headerMerge.forEach((item: any, index: number) => {
        if (!item.startColumn) errors.push(`headerMerge[${index}] 缺少 startColumn`);
        if (typeof item.colSpan !== 'number') errors.push(`headerMerge[${index}] colSpan 必须是数字`);
        if (!item.title) errors.push(`headerMerge[${index}] 缺少 title`);
      });
    }
  }

  // 验证 cellMerge
  if (config.cellMerge) {
    if (!Array.isArray(config.cellMerge)) {
      errors.push('cellMerge 必须是数组');
    } else {
      config.cellMerge.forEach((item: any, index: number) => {
        if (!item.field) errors.push(`cellMerge[${index}] 缺少 field`);
        if (item.dependsOn && !Array.isArray(item.dependsOn)) {
          errors.push(`cellMerge[${index}] dependsOn 必须是数组`);
        }
      });
    }
  }

  // 验证 rowMerge
  if (config.rowMerge) {
    if (!Array.isArray(config.rowMerge)) {
      errors.push('rowMerge 必须是数组');
    } else {
      config.rowMerge.forEach((item: any, index: number) => {
        if (!item.startColumn) errors.push(`rowMerge[${index}] 缺少 startColumn`);
        if (typeof item.colSpan !== 'number') errors.push(`rowMerge[${index}] colSpan 必须是数字`);
        if (!item.condition) errors.push(`rowMerge[${index}] 缺少 condition`);
        if (item.condition && !item.condition.type) {
          errors.push(`rowMerge[${index}] condition 缺少 type`);
        }
      });
    }
  }

  return { valid: errors.length === 0, errors };
}
