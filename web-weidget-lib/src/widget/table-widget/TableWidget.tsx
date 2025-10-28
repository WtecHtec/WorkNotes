import { ITableProp, TableRowData } from './types';

export default function HotelPricingTable({
  fixedHeader = false,
  columns = [],
  dataSource = [],
  rowKey = 'id',
  className = '',
  headerClassName = 'header-default',
  rowClassName = 'row-default',
  maxHeightCls = 'max-height-600px',
  maxHeight = 0,
}: ITableProp) {
  // 获取行key
  const getRowKey = (record: TableRowData, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record, index);
    }
    return record[rowKey] || index.toString();
  };

  // 获取行样式
  const getRowClassName = (record: TableRowData, index: number): string => {
    if (typeof rowClassName === 'function') {
      return rowClassName(record, index);
    }
    return rowClassName;
  };

  return (
    <div
      className={`table-container ${fixedHeader ? `${maxHeightCls} fixed-header` : ''} ${className}`}
      style={{ ...(maxHeight > 0 ? { maxHeight: `${maxHeight}px` } : {}) }}
    >
      <table className='table'>
        <thead className={fixedHeader ? 'sticky-header' : ''}>
          <tr className={headerClassName}>
            {columns.map((column) => {
              const cellContent = column.headRender
                ? column.headRender(column)
                : column.title;
              return (
                <th
                  key={column.key}
                  className={`table-header-cell ${column.className || ''}`}
                  style={{
                    textAlign: column.align || 'center',
                    minWidth: column.minWidth,
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: cellContent }}></div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {dataSource.map((row, index) => (
            <tr
              key={getRowKey(row, index)}
              className={getRowClassName(row, index)}
            >
              {columns.map((column) => {
                const value = row[column.key];
                const cellContent = column.render
                  ? column.render(value, row, index)
                  : value;

                return (
                  <td
                    key={column.key}
                    className={`table-cell ${column.align === 'left' ? 'text-left' : column.align === 'right' ? 'text-right' : 'text-center'} ${column.className || ''}`}
                  >
                    {/* {cellContent} */}
                    <div
                      dangerouslySetInnerHTML={{ __html: cellContent }}
                    ></div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
