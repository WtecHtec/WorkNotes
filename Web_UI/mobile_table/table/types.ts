import React from 'react'
import { BasicComponent } from '../utils/typings'

export interface BasicTableProps extends BasicComponent {
  columns: Array<TableColumnProps>
  data: Array<any>
  bordered: boolean
  summary?: React.ReactNode
  striped?: boolean
  noData?: React.ReactNode
  sorterIcon?: React.ReactNode
  onSort?: (column: TableColumnProps, sortedData: Array<any>) => void
  showHeader?: boolean
}

export interface TableColumnProps {
  key: string
  title?: string
  align?: string
  sorter?: ((a: any, b: any) => number) | boolean | string
  render?: (rowData: any, rowIndex: number) => string | React.ReactNode
  fixed?: 'left' | 'right'
  width?: number
  // 新增：单元格配置函数
  onCell?: (rowData: any, rowIndex: number) => CellConfig
}

// 单元格合并配置
export interface CellConfig {
  rowSpan?: number
  colSpan?: number
  style?: React.CSSProperties
  className?: string
}