import type { ColumnType } from 'antd/es/table';
import type { ColumnMergeConfig, HeaderMergeConfig, MergeDataResult, RowMergeConfig } from './types';

/**
 * 计算多列的行合并配置
 * @param dataSource 数据源
 * @param configs 合并配置数组（按列顺序）
 * @returns 每列每行的 rowSpan 配置
 */
export function calculateMultiColumnMerge<T extends Record<string, any>>(
  dataSource: T[],
  configs: ColumnMergeConfig<T>[]
): MergeDataResult {
  const result: MergeDataResult = {};

  configs.forEach(({ field, dependsOn }) => {
    const rowSpans: number[] = [];

    for (let i = 0; i < dataSource.length; i++) {
      // 判断两行是否应该合并
      const shouldMerge = (prevIndex: number, currIndex: number): boolean => {
        const prev = dataSource[prevIndex];
        const curr = dataSource[currIndex];

        // 1. 当前字段必须相同
        if (prev[field] !== curr[field]) return false;

        // 2. 如果有依赖字段，依赖字段也必须相同
        if (dependsOn) {
          return dependsOn.every(key => prev[key] === curr[key]);
        }

        return true;
      };

      // 检查是否与上一行合并
      if (i > 0 && shouldMerge(i - 1, i)) {
        rowSpans[i] = 0;
        continue;
      }

      // 计算可以向下合并的行数
      let span = 1;
      for (let j = i + 1; j < dataSource.length; j++) {
        if (shouldMerge(i, j)) {
          span++;
        } else {
          break;
        }
      }

      rowSpans[i] = span;
    }

    result[String(field)] = rowSpans;
  });

  return result;
}

/**
 * 应用表头合并到 columns
 * @param columns 原始列配置
 * @param headerMergeConfigs 表头合并配置
 * @returns 处理后的列配置
 */
export function applyHeaderMerge<T extends Record<string, any>>(
  columns: ColumnType<T>[],
  headerMergeConfigs: HeaderMergeConfig[]
): ColumnType<T>[] {
  if (!headerMergeConfigs || headerMergeConfigs.length === 0) {
    return columns;
  }

  const result: ColumnType<T>[] = [];
  const processedColumns = new Set<string>();

  columns.forEach((col, index) => {
    const dataIndex = String(col.dataIndex);

    // 检查当前列是否是合并的起始列
    const mergeConfig = headerMergeConfigs.find(config => config.startColumn === dataIndex);

    if (mergeConfig && !processedColumns.has(dataIndex)) {
      // 收集需要合并的子列
      const childColumns: ColumnType<T>[] = [];

      for (let i = 0; i < mergeConfig.colSpan; i++) {
        const childCol = columns[index + i];
        if (childCol) {
          childColumns.push(childCol);
          processedColumns.add(String(childCol.dataIndex));
        }
      }

      // 如果 hideChildren 为 true，创建单层表头，但保持列结构
      if (mergeConfig.hideChildren) {
        // 为每个子列添加配置，但隐藏它们的表头
        const processedChildren = childColumns.map((child, idx) => ({
          ...child,
          // 只有第一个子列的表头会显示父标题，其他子列的表头被隐藏
          onHeaderCell: () => {
            if (idx === 0) {
              // 第一个子列的表头占据所有列
              return {
                colSpan: mergeConfig.colSpan,
              };
            } else {
              // 其他子列的表头被隐藏
              return {
                colSpan: 0,
              };
            }
          },
        }));

        // 修改第一个子列的标题为父标题
        processedChildren[0].title = mergeConfig.title;
        if (mergeConfig.align) {
          processedChildren[0].align = mergeConfig.align;
        }

        // 将处理后的子列直接添加到结果中（不使用 children 结构）
        processedChildren.forEach(child => {
          result.push(child);
        });
      } else {
        // 默认行为：创建多级表头
        result.push({
          title: mergeConfig.title,
          align: mergeConfig.align || 'center',
          children: childColumns,
        } as ColumnType<T>);
      }
    } else if (!processedColumns.has(dataIndex)) {
      // 不需要合并的列直接添加
      result.push(col);
      processedColumns.add(dataIndex);
    }
  });

  return result;
}

/**
 * 应用单元格行合并到 columns
 * @param columns 原始列配置
 * @param cellMergeData 计算好的合并数据
 * @param configs 合并配置
 * @returns 处理后的列配置
 */
export function applyCellMerge<T extends Record<string, any>>(
  columns: ColumnType<T>[],
  cellMergeData: MergeDataResult,
  configs: ColumnMergeConfig<T>[]
): ColumnType<T>[] {
  return columns.map(col => {
    const mergeConfig = configs.find(c => c.field === col.dataIndex);
    if (mergeConfig) {
      return {
        ...col,
        onCell: (_: T, index?: number) => ({
          rowSpan: index !== undefined ? cellMergeData[String(mergeConfig.field)]?.[index] ?? 1 : 1,
        }),
      };
    }
    return col;
  });
}

/**
 * 递归处理嵌套 columns，应用单元格合并
 * @param columns 列配置（可能包含 children）
 * @param cellMergeData 计算好的合并数据
 * @param configs 合并配置
 * @returns 处理后的列配置
 */
export function applyCellMergeRecursive<T extends Record<string, any>>(
  columns: ColumnType<T>[],
  cellMergeData: MergeDataResult,
  configs: ColumnMergeConfig<T>[]
): ColumnType<T>[] {
  return columns.map(col => {
    // 如果有子列，递归处理
    if ((col as any).children) {
      return {
        ...col,
        children: applyCellMergeRecursive((col as any).children, cellMergeData, configs),
      } as ColumnType<T>;
    }

    // 处理叶子节点
    const mergeConfig = configs.find(c => c.field === col.dataIndex);
    if (mergeConfig) {
      return {
        ...col,
        onCell: (_: T, index?: number) => ({
          rowSpan: index !== undefined ? cellMergeData[String(mergeConfig.field)]?.[index] ?? 1 : 1,
        }),
      };
    }

    return col;
  });
}

/**
 * 应用行内列合并（横向合并）到 columns
 * @param columns 原始列配置
 * @param dataSource 数据源
 * @param rowMergeConfigs 行合并配置
 * @returns 处理后的列配置
 */
export function applyRowMerge<T extends Record<string, any>>(
  columns: ColumnType<T>[],
  dataSource: T[],
  rowMergeConfigs: RowMergeConfig<T>[]
): ColumnType<T>[] {
  if (!rowMergeConfigs || rowMergeConfigs.length === 0) {
    return columns;
  }

  // 为每个配置计算被隐藏的列
  const processedConfigs = rowMergeConfigs.map(config => {
    const startIndex = columns.findIndex(col => col.dataIndex === config.startColumn);
    const hiddenColumns: (keyof T)[] = [];

    if (startIndex !== -1) {
      for (let i = 1; i < config.colSpan; i++) {
        const hiddenCol = columns[startIndex + i];
        if (hiddenCol && hiddenCol.dataIndex) {
          hiddenColumns.push(hiddenCol.dataIndex as keyof T);
        }
      }
    }

    return { ...config, hiddenColumns };
  });

  // 应用合并配置到列
  return columns.map(col => {
    const dataIndex = col.dataIndex as keyof T;

    // 检查当前列是否是起始列
    const startConfig = processedConfigs.find(c => c.startColumn === dataIndex);
    if (startConfig) {
      return {
        ...col,
        onCell: (record: T, index?: number) => {
          const shouldMerge = index !== undefined && startConfig.condition(record, index);
          return {
            colSpan: shouldMerge ? startConfig.colSpan : 1,
          };
        },
      };
    }

    // 检查当前列是否是被隐藏的列
    const hideConfig = processedConfigs.find(c => c.hiddenColumns?.includes(dataIndex));
    if (hideConfig) {
      return {
        ...col,
        onCell: (record: T, index?: number) => {
          const shouldHide = index !== undefined && hideConfig.condition(record, index);
          return {
            colSpan: shouldHide ? 0 : 1,
          };
        },
      };
    }

    return col;
  });
}

/**
 * 递归处理嵌套 columns，应用行内列合并和单元格行合并
 * @param columns 列配置（可能包含 children）
 * @param dataSource 数据源
 * @param cellMergeData 计算好的单元格合并数据
 * @param cellMergeConfigs 单元格行合并配置
 * @param rowMergeConfigs 行内列合并配置
 * @returns 处理后的列配置
 */
export function applyAllCellMerge<T extends Record<string, any>>(
  columns: ColumnType<T>[],
  dataSource: T[],
  cellMergeData: MergeDataResult,
  cellMergeConfigs: ColumnMergeConfig<T>[],
  rowMergeConfigs?: RowMergeConfig<T>[]
): ColumnType<T>[] {
  return columns.map(col => {
    // 如果有子列，递归处理
    if ((col as any).children) {
      return {
        ...col,
        children: applyAllCellMerge(
          (col as any).children,
          dataSource,
          cellMergeData,
          cellMergeConfigs,
          rowMergeConfigs
        ),
      } as ColumnType<T>;
    }

    const dataIndex = col.dataIndex as keyof T;
    let onCellFunc = col.onCell;

    // 1. 应用单元格行合并（rowSpan）
    const cellMergeConfig = cellMergeConfigs.find(c => c.field === dataIndex);
    if (cellMergeConfig) {
      const originalOnCell = onCellFunc;
      onCellFunc = (record: T, index?: number) => {
        const baseProps = originalOnCell ? originalOnCell(record, index) : {};
        return {
          ...baseProps,
          rowSpan: index !== undefined ? cellMergeData[String(dataIndex)]?.[index] ?? 1 : 1,
        };
      };
    }

    // 2. 应用行内列合并（colSpan）
    if (rowMergeConfigs && rowMergeConfigs.length > 0) {
      // 检查是否是起始列
      const startConfig = rowMergeConfigs.find(c => c.startColumn === dataIndex);
      if (startConfig) {
        // 计算被隐藏的列
        const columnIndex = columns.findIndex(c => c.dataIndex === dataIndex);
        const hiddenColumns: (keyof T)[] = [];
        for (let i = 1; i < startConfig.colSpan; i++) {
          const hiddenCol = columns[columnIndex + i];
          if (hiddenCol && hiddenCol.dataIndex) {
            hiddenColumns.push(hiddenCol.dataIndex as keyof T);
          }
        }

        const originalOnCell = onCellFunc;
        onCellFunc = (record: T, index?: number) => {
          const baseProps = originalOnCell ? originalOnCell(record, index) : {};
          const shouldMerge = index !== undefined && startConfig.condition(record, index);
          return {
            ...baseProps,
            colSpan: shouldMerge ? startConfig.colSpan : (baseProps as any).colSpan ?? 1,
          };
        };
      }

      // 检查是否是被隐藏的列
      const hideConfig = rowMergeConfigs.find(c => {
        const startIndex = columns.findIndex(col => col.dataIndex === c.startColumn);
        if (startIndex === -1) return false;

        for (let i = 1; i < c.colSpan; i++) {
          const col = columns[startIndex + i];
          if (col && col.dataIndex === dataIndex) {
            return true;
          }
        }
        return false;
      });

      if (hideConfig) {
        const originalOnCell = onCellFunc;
        onCellFunc = (record: T, index?: number) => {
          const baseProps = originalOnCell ? originalOnCell(record, index) : {};
          const shouldHide = index !== undefined && hideConfig.condition(record, index);
          return {
            ...baseProps,
            colSpan: shouldHide ? 0 : (baseProps as any).colSpan ?? 1,
          };
        };
      }
    }

    if (onCellFunc !== col.onCell) {
      return { ...col, onCell: onCellFunc };
    }

    return col;
  });
}

/**
 * 验证表头合并配置是否合法
 * @param columns 列配置
 * @param configs 表头合并配置
 * @returns 是否合法
 */
export function validateHeaderMergeConfig<T extends Record<string, any>>(
  columns: ColumnType<T>[],
  configs: HeaderMergeConfig[]
): boolean {
  for (const config of configs) {
    const startIndex = columns.findIndex(col => String(col.dataIndex) === config.startColumn);

    if (startIndex === -1) {
      console.error(`[MergeTable] 找不到起始列: ${config.startColumn}`);
      return false;
    }

    if (startIndex + config.colSpan > columns.length) {
      console.error(`[MergeTable] 合并列数超出范围: ${config.startColumn}, 需要 ${config.colSpan} 列`);
      return false;
    }
  }

  return true;
}
