import React, { useMemo } from "react";
import { Table } from "antd";
import type { MergeTableProps } from "./types";
import { useTableMerge } from "./hooks";

/**
 * 支持单元格合并和表头合并的表格组件
 *
 * @example
 * ```tsx
 * <MergeTable
 *   dataSource={data}
 *   columns={columns}
 *   mergeConfig={{
 *     headerMerge: [
 *       { startColumn: 'ctrip', colSpan: 3, title: 'OTA渠道' }
 *     ],
 *     cellMerge: [
 *       { field: 'date' },
 *       { field: 'hotel', dependsOn: ['date'] }
 *     ]
 *   }}
 *   bordered
 * />
 * ```
 */
function MergeTable<T extends Record<string, any>>({ dataSource, columns, mergeConfig, ...restProps }: MergeTableProps<T>) {
  // 使用合并 Hook
  const { applyMergeToColumns } = useTableMerge(dataSource, mergeConfig);

  // 应用合并配置到列
  const mergedColumns = useMemo(() => {
    return applyMergeToColumns(columns);
  }, [columns, applyMergeToColumns]);
  console.log("mergedColumns---", mergedColumns);

  return <Table<T> dataSource={dataSource} columns={mergedColumns} {...restProps} />;
}

export default MergeTable;
