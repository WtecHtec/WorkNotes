import { useMemo } from 'react';
import type { ColumnType } from 'antd/es/table';
import type { TableMergeConfig, MergeDataResult } from './types';
import {
  calculateMultiColumnMerge,
  applyHeaderMerge,
  applyAllCellMerge,
  validateHeaderMergeConfig,
} from './utils';

/**
 * 表格合并 Hook
 * @param dataSource 数据源
 * @param config 合并配置
 * @returns 合并数据和处理函数
 */
export function useTableMerge<T extends Record<string, any>>(dataSource: T[], config?: TableMergeConfig<T>) {
  // 计算单元格行合并数据
  const cellMergeData = useMemo<MergeDataResult>(() => {
    if (!config?.cellMerge || config.cellMerge.length === 0) {
      return {};
    }
    return calculateMultiColumnMerge(dataSource, config.cellMerge);
  }, [dataSource, config?.cellMerge]);

  // 生成 onCell 函数（用于手动控制）
  const getOnCell = useMemo(() => {
    return (field: keyof T) => {
      return (_: T, index?: number) => ({
        rowSpan: index !== undefined ? cellMergeData[String(field)]?.[index] ?? 1 : 1,
      });
    };
  }, [cellMergeData]);

  // 应用所有合并配置到 columns
  const applyMergeToColumns = useMemo(() => {
    return (columns: ColumnType<T>[]): ColumnType<T>[] => {
      let result = [...columns];

      // 1. 验证表头合并配置
      if (config?.headerMerge && config.headerMerge.length > 0) {
        if (!validateHeaderMergeConfig(result, config.headerMerge)) {
          console.warn('[MergeTable] 表头合并配置验证失败，跳过表头合并');
        } else {
          // 2. 应用表头合并
          result = applyHeaderMerge(result, config.headerMerge);
        }
      }

      // 3. 应用单元格行合并和列合并（递归处理嵌套列）
      if (config?.cellMerge || config?.rowMerge) {
        result = applyAllCellMerge(
          result,
          dataSource,
          cellMergeData,
          config.cellMerge || [],
          config.rowMerge
        );
      }

      return result;
    };
  }, [config?.headerMerge, config?.cellMerge, config?.rowMerge, cellMergeData, dataSource]);

  return {
    cellMergeData,
    getOnCell,
    applyMergeToColumns,
  };
}
