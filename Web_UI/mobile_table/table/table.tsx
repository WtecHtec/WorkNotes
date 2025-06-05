import React, { FunctionComponent, useEffect, useRef } from 'react'
import classNames from 'classnames'
import { BasicTableProps, TableColumnProps, CellConfig } from './types'
import { useConfig, useRtl, usePropsValue } from '@nutui/nutui-react'
import { ComponentDefaults } from '../utils/typings'
// import { usePropsValue } from '@/utils/use-props-value'
import useTableSticky from './useTableSticky'
import './index.css'
export type TableProps = BasicTableProps

const defaultProps = {
  ...ComponentDefaults,
  columns: [],
  data: [],
  bordered: true,
  striped: false,
  noData: '',
  sorterIcon: null,
  showHeader: true,
} as TableProps

export const Table: FunctionComponent<
  Partial<TableProps> & React.HTMLAttributes<HTMLDivElement>
> = (props) => {
  const { locale } = useConfig()
  const rtl = useRtl()
  defaultProps.noData = locale.noData

  const {
    children,
    className,
    style,
    columns,
    data,
    bordered,
    summary,
    striped,
    noData,
    sorterIcon,
    showHeader,
    onSort,
    ...rest
  } = {
    ...defaultProps,
    ...props,
  }
  const sortedMapping = useRef<{ [key: string]: boolean }>({})
  const [innerValue, setValue] = usePropsValue({
    defaultValue: data,
    finalValue: [],
  })
  const {
    isSticky,
    stickyLeftWidth,
    stickyRightWidth,
    getStickyClass,
    getStickyStyle,
  } = useTableSticky(columns, rtl)

  useEffect(() => {
    setValue(data)
  }, [data])

  const classPrefix = 'nut-table'
  const headerClassPrefix = `${classPrefix}-main-head-tr`
  const bodyClassPrefix = `${classPrefix}-main-body-tr`
  const cls = classNames(classPrefix, className)

  const handleSorterClick = (item: TableColumnProps) => {
    if (item.sorter && !sortedMapping.current[item.key]) {
      const copied = [...innerValue]
      if (typeof item.sorter === 'function') {
        copied.sort(item.sorter as (a: any, b: any) => number)
      } else if (item.sorter === 'default') {
        copied.sort()
      }
      sortedMapping.current[item.key] = true
      setValue(copied, true)
      onSort && onSort(item, copied)
    } else {
      sortedMapping.current[item.key] = false
      setValue(data)
    }
  }

  const cellClasses = (item: TableColumnProps) => {
    return {
      [`${headerClassPrefix}-border`]: bordered,
      [`${headerClassPrefix}-align${item.align ? item.align : ''}`]: true,
    }
  }

  const getColumnItem = (value: string): TableColumnProps => {
    return columns.filter((item: TableColumnProps) => item.key === value)[0]
  }

  const renderHeadCells = () => {
    return columns.map((item, index) => {
      return (
        <th
          className={classNames(
            `${headerClassPrefix}-th`,
            cellClasses(item),
            getStickyClass(item.key)
          )}
          key={item.key}
          onClick={() => handleSorterClick(item)}
          style={getStickyStyle(item.key)}
        >
          {item.title}&nbsp;
          {item.sorter &&
            (sorterIcon || <label>↓</label>)}
        </th>
      )
    })
  }

  const sortDataItem = () => {
    return columns.map((column: any) => {
      return [column.key, column.render, column.onCell]
    })
  }

  const renderBodyTds = (item: any, rowIndex: number) => {
    const cells: React.ReactNode[] = []
    
    sortDataItem().forEach(([value, render, onCell], colIndex) => {
      // 获取单元格配置
      const cellConfig: CellConfig = onCell ? onCell(item, rowIndex) : {}
      const { rowSpan = 1, colSpan = 1, style: cellStyle = {}, className: cellClassName = '' } = cellConfig

      // 如果 rowSpan 或 colSpan 为 0，则不渲染此单元格（被合并）
      if (rowSpan === 0 || colSpan === 0) {
        return
      }

      const cellContent = typeof item[value] === 'function' || typeof render === 'function' ? (
        <div>{render ? render(item, rowIndex) : item[value](item)}</div>
      ) : (
        item[value]
      )

      cells.push(
        <td
          className={classNames(
            `${bodyClassPrefix}-td`,
            cellClasses(getColumnItem(value)),
            getStickyClass(value),
            cellClassName
          )}
          key={value}
          rowSpan={rowSpan > 1 ? rowSpan : undefined}
          colSpan={colSpan > 1 ? colSpan : undefined}
          style={{
            ...getStickyStyle(value),
            ...cellStyle,
          }}
        >
          {cellContent}
        </td>
      )
    })

    return cells
  }

  const renderBodyTrs = () => {
    const mergedCells = new Map<string, boolean>() // 记录已被合并的单元格位置 "rowIndex-colIndex"
    
    return innerValue.map((item, rowIndex) => {
      const cells: React.ReactNode[] = []
      
      sortDataItem().forEach(([value, render, onCell], colIndex) => {
        const cellKey = `${rowIndex}-${colIndex}`
        
        // 如果当前位置已被之前的合并单元格占用，则跳过
        if (mergedCells.has(cellKey)) {
          return
        }

        // 获取单元格配置
        const cellConfig: CellConfig = onCell ? onCell(item, rowIndex) : {}
        const { rowSpan = 1, colSpan = 1, style: cellStyle = {}, className: cellClassName = '' } = cellConfig

        // 如果 rowSpan 或 colSpan 为 0，则不渲染此单元格（被合并）
        if (rowSpan === 0 || colSpan === 0) {
          return
        }

        // 标记被当前合并单元格占用的所有位置
        if (rowSpan > 1 || colSpan > 1) {
          for (let r = 0; r < rowSpan; r++) {
            for (let c = 0; c < colSpan; c++) {
              if (r !== 0 || c !== 0) { // 排除当前单元格本身
                mergedCells.set(`${rowIndex + r}-${colIndex + c}`, true)
              }
            }
          }
        }

        const cellContent = typeof item[value] === 'function' || typeof render === 'function' ? (
          <div>{render ? render(item, rowIndex) : item[value](item)}</div>
        ) : (
          item[value]
        )

        cells.push(
          <td
            className={classNames(
              `${bodyClassPrefix}-td`,
              cellClasses(getColumnItem(value)),
              getStickyClass(value),
              cellClassName
            )}
            key={`${rowIndex}-${colIndex}-${value}`}
            rowSpan={rowSpan > 1 ? rowSpan : undefined}
            colSpan={colSpan > 1 ? colSpan : undefined}
            style={{
              ...getStickyStyle(value),
              ...cellStyle,
            }}
          >
            {cellContent}
          </td>
        )
      })

      const { rowRender } = item
      if (rowRender && typeof rowRender === 'function') {
        return rowRender(item, rowIndex, { inner: cells })
      }
      return (
        <tr className={bodyClassPrefix} key={rowIndex}>
          {cells}
        </tr>
      )
    })
  }

  return (
    <div className={cls} {...rest}>
      <div
        className={classNames(
          `${classPrefix}-wrapper ${
            isSticky ? `${classPrefix}-wrapper-sticky` : ''
          }`
        )}
        style={style}
      >
        <table
          className={classNames(`${classPrefix}-main`, {
            [`${classPrefix}-main-striped`]: striped,
          })}
        >
          {showHeader && (
            <thead className={`${classPrefix}-main-head`}>
              <tr className={headerClassPrefix}>{renderHeadCells()}</tr>
            </thead>
          )}
          <tbody className={`${classPrefix}-main-body`}>{renderBodyTrs()}</tbody>
        </table>
      </div>
      {isSticky ? (
        <>
          <div
            className={`${classPrefix}-sticky-left`}
            style={{ width: stickyLeftWidth }}
          />
          <div
            className={`${classPrefix}-sticky-right`}
            style={{ width: stickyRightWidth }}
          />
        </>
      ) : null}
      {(summary || innerValue.length === 0) && (
        <div className={`${classPrefix}-summary`}>{summary || noData}</div>
      )}
    </div>
  )
}

Table.displayName = 'NutTable'