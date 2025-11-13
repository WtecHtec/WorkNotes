import { CSSProperties } from "react";
import styles from "./FlexTable.module.scss";

// 类型定义
type StyleOrFunction<T = any> = CSSProperties | ((params: T) => CSSProperties);

interface FlexTableProps {
  columns?: any[];
  dataSource?: any[];
  stickyHeader?: boolean;
  stickyFirstRow?: boolean;
  stickyRows?: number[];
  height?: number;
  rowKey?: string;
  // 样式定制 props
  containerStyle?: StyleOrFunction;
  scrollWrapperStyle?: StyleOrFunction;
  headerStyle?: StyleOrFunction;
  headerCellStyle?: StyleOrFunction<{ column: any; index: number }>;
  rowStyle?: StyleOrFunction<{ record: any; index: number; isFirstRow: boolean }>;
  cellStyle?: StyleOrFunction<{ record: any; column: any; rowIndex: number; colIndex: number }>;
}

const FlexTable = ({
  columns = [],
  dataSource = [],
  stickyHeader = true,
  stickyFirstRow = false,
  height = 600,
  rowKey = "key",
  // 样式定制
  containerStyle,
  scrollWrapperStyle,
  headerStyle,
  headerCellStyle,
  rowStyle,
  cellStyle,
  stickyRows,
}: FlexTableProps) => {
  // 工具函数:解析样式(支持对象或函数)
  const resolveStyle = <T,>(styleOrFn: StyleOrFunction<T> | undefined, params?: T): CSSProperties => {
    if (!styleOrFn) return {};
    return typeof styleOrFn === "function" ? styleOrFn(params as T) : styleOrFn;
  };

  // 计算固定列的左偏移量
  const calculateLeftOffset = (index: number): number => {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      if (columns[i].fixed === "left") {
        offset += columns[i].width || 120;
      }
    }
    return offset;
  };

  // 计算固定列的右偏移量
  const calculateRightOffset = (index: number): number => {
    let offset = 0;
    for (let i = index + 1; i < columns.length; i++) {
      if (columns[i].fixed === "right") {
        offset += columns[i].width || 120;
      }
    }
    return offset;
  };

  return (
    <div className={styles.tableContainer} style={resolveStyle(containerStyle)}>
      <div
        className={styles.scrollWrapper}
        style={{
          height: `${height}px`,
          ...resolveStyle(scrollWrapperStyle),
        }}
      >
        <div className={styles.tableContent}>
          {/* 表头 */}
          <div className={`${styles.tableHeader} ${stickyHeader ? styles.tableHeaderSticky : ""}`} style={resolveStyle(headerStyle)}>
            {columns.map((col, index) => {
              const isLeftFixed = col.fixed === "left";
              const isRightFixed = col.fixed === "right";
              const leftOffset = isLeftFixed ? calculateLeftOffset(index) : 0;
              const rightOffset = isRightFixed ? calculateRightOffset(index) : 0;
              const baseZIndex = stickyHeader ? 30 : 0;
              const fixedZIndex = isLeftFixed ? baseZIndex + 10 + index : isRightFixed ? baseZIndex + 5 : baseZIndex;

              // 构建类名
              const cellClasses = [
                styles.headerCell,
                isLeftFixed && styles.headerCellFixed,
                isLeftFixed && styles.headerCellFixedLeft,
                isRightFixed && styles.headerCellFixed,
                isRightFixed && styles.headerCellFixedRight,
              ]
                .filter(Boolean)
                .join(" ");

              // 只保留必要的计算样式
              const computedStyle: CSSProperties = {
                flex: col.width ? `0 0 ${col.width}px` : "1",
                minWidth: col.width || 120,
                ...(isLeftFixed && { left: `${leftOffset}px`, zIndex: fixedZIndex }),
                ...(isRightFixed && { right: `${rightOffset}px`, zIndex: fixedZIndex }),
              };

              return (
                <div
                  key={col.key || col.dataIndex}
                  className={cellClasses}
                  style={{
                    ...computedStyle,
                    ...resolveStyle(headerCellStyle, { column: col, index }),
                  }}
                >
                  {col.title}
                </div>
              );
            })}
          </div>

          {/* 数据行 */}
          {dataSource.map((record, rowIndex) => {
            const isFirstRow = (rowIndex === 0 && stickyFirstRow) || stickyRows?.includes(rowIndex) || false;
            const headerHeight = stickyHeader ? 50 : 0;

            // 构建行类名
            const rowClasses = [
              styles.tableRow,
              !isFirstRow && styles.tableRowHover,
              isFirstRow && styles.tableRowSticky,
              isFirstRow && styles.tableRowFirst,
            ]
              .filter(Boolean)
              .join(" ");

            // 只保留必要的计算样式
            const rowComputedStyle: CSSProperties = {
              ...(isFirstRow && { top: `${headerHeight}px` }),
            };

            return (
              <div
                key={record[rowKey] || rowIndex}
                className={rowClasses}
                style={{
                  ...rowComputedStyle,
                  ...resolveStyle(rowStyle, { record, index: rowIndex, isFirstRow }),
                }}
                onMouseEnter={(e) => {
                  if (!isFirstRow) {
                    e.currentTarget.style.background = "#fafafa";
                    // 更新固定列的背景色
                    const cells = e.currentTarget.children;
                    Array.from(cells).forEach((cell, index) => {
                      if (columns[index]?.fixed) {
                        (cell as HTMLElement).style.background = "#fafafa";
                      }
                    });
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isFirstRow) {
                    e.currentTarget.style.background = "white";
                    // 恢复固定列的背景色
                    const cells = e.currentTarget.children;
                    Array.from(cells).forEach((cell, index) => {
                      if (columns[index]?.fixed) {
                        (cell as HTMLElement).style.background = "white";
                      }
                    });
                  }
                }}
              >
                {columns.map((col, colIndex) => {
                  const value = record[col.dataIndex];
                  const content = col.render ? col.render(value, record, rowIndex) : value;

                  const isLeftFixed = col.fixed === "left";
                  const isRightFixed = col.fixed === "right";
                  const leftOffset = isLeftFixed ? calculateLeftOffset(colIndex) : 0;
                  const rightOffset = isRightFixed ? calculateRightOffset(colIndex) : 0;
                  const baseZIndex = isFirstRow ? 20 : 0;
                  const fixedZIndex = isLeftFixed ? baseZIndex + 10 + colIndex : isRightFixed ? baseZIndex + 5 : baseZIndex;

                  // 构建单元格类名
                  const cellClasses = [
                    styles.tableCell,
                    isLeftFixed && styles.tableCellFixed,
                    isLeftFixed && styles.tableCellFixedLeft,
                    isRightFixed && styles.tableCellFixed,
                    isRightFixed && styles.tableCellFixedRight,
                    isFirstRow && styles.tableCellFirstRow,
                  ]
                    .filter(Boolean)
                    .join(" ");

                  // 只保留必要的计算样式
                  const cellComputedStyle: CSSProperties = {
                    flex: col.width ? `0 0 ${col.width}px` : "1",
                    minWidth: col.width || 120,
                    ...(isLeftFixed && { left: `${leftOffset}px`, zIndex: fixedZIndex }),
                    ...(isRightFixed && { right: `${rightOffset}px`, zIndex: fixedZIndex }),
                  };

                  return (
                    <div
                      key={col.key || col.dataIndex}
                      className={cellClasses}
                      style={{
                        ...cellComputedStyle,
                        ...resolveStyle(cellStyle, { record, column: col, rowIndex, colIndex }),
                      }}
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FlexTable;
