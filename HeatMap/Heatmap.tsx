import React from 'react';
import './heatmap.moudle.css';
// 类型定义
export interface HeatmapRowData {
  [key: string]: number | string; // 支持任意列名（包括文本和数值）
}

export interface HeatmapColumn {
  title: string; // 列标题（表头显示）
  dataIndex: string; // 数据字段名（对应 dataSource 中的字段）
  width?: number; // 列宽度
  isHeat?: boolean; // 是否为热力图列（true: 显示热力颜色，false: 显示普通文本）
}

interface ColorSchemeItem {
  threshold: number;
  color: string;
}

interface HeatmapProps {
  dataSource: HeatmapRowData[]; // 数据源
  columns: HeatmapColumn[]; // 列配置
  colorScheme?: ColorSchemeItem[]; // 颜色方案
  maxValue?: number; // 最大值
  minCellSize?: number; // 格子最小宽度
  gap?: number; // 格子间距
  enableAnimation?: boolean; // 是否启用动画
  enableShimmer?: boolean; // 是否启用闪光效果
  shimmerValue?: number; // 闪光阈值
  onCellClick?: (
    row: HeatmapRowData,
    dataIndex: string,
    value: number | string,
    rowIndex: number,
    columnIndex: number,
  ) => void;
  onCellHover?: (
    row: HeatmapRowData,
    dataIndex: string,
    value: number | string,
    rowIndex: number,
    columnIndex: number,
  ) => void;
  formatTooltip?: (row: HeatmapRowData, column: HeatmapColumn, value: number | string) => string;
}

/**
 * Heatmap - 热力图组件
 * 使用 Tailwind CSS 和 flex 布局实现
 */
const Heatmap: React.FC<HeatmapProps> = ({
  dataSource,
  columns,
  colorScheme = [
    { threshold: 0, color: '#1a1a2e' },
    { threshold: 20, color: '#16213e' },
    { threshold: 40, color: '#0f3460' },
    { threshold: 60, color: '#533483' },
    { threshold: 80, color: '#e94560' },
    { threshold: 100, color: '#ff6b9d' },
  ],
  maxValue = 100,
  minCellSize = 6,
  gap = 1,
  enableAnimation = true,
  enableShimmer = true,
  shimmerValue = 60,
  onCellClick,
  onCellHover,
  formatTooltip,
}) => {
  // 根据阈值获取颜色
  const getColor = (value: number): string => {
    const normalizedValue = (value / maxValue) * 100;
    for (let i = colorScheme.length - 1; i >= 0; i--) {
      if (normalizedValue >= colorScheme[i].threshold) {
        return colorScheme[i].color;
      }
    }
    return colorScheme[0].color;
  };

  // 获取特定单元格的值
  const getValue = (row: HeatmapRowData, dataIndex: string): number | string => {
    const value = row[dataIndex];
    return value ?? 0;
  };

  // 处理格子点击
  const handleCellClick = (row: HeatmapRowData, dataIndex: string, rowIndex: number, columnIndex: number) => {
    const value = getValue(row, dataIndex);
    if (onCellClick) {
      onCellClick(row, dataIndex, value, rowIndex, columnIndex);
    }
  };

  // 处理格子悬停
  const handleCellHover = (row: HeatmapRowData, dataIndex: string, rowIndex: number, columnIndex: number) => {
    if (onCellHover) {
      const value = getValue(row, dataIndex);
      onCellHover(row, dataIndex, value, rowIndex, columnIndex);
    }
  };

  // 格式化提示信息
  const getTooltip = (row: HeatmapRowData, column: HeatmapColumn): string => {
    const value = getValue(row, column.dataIndex);

    if (formatTooltip) {
      return formatTooltip(row, column, value);
    }

    // 获取第一个非热力图列的值作为 label
    const labelColumn = columns.find(col => col.isHeat === false);
    const label = labelColumn ? String(row[labelColumn.dataIndex]) : '';

    if (typeof value === 'number') {
      return `${label} ${column.title} - 活动度: ${value}%`;
    }

    return `${column.title}: ${value}`;
  };

  // 数据验证
  if (!dataSource || dataSource.length === 0 || !columns || columns.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-gray-400">
        <div className="text-center">
          <p>暂无数据</p>
          <p className="mt-2 text-xs">请提供 dataSource 和 columns 参数</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-[300px] overflow-x-auto overflow-y-hidden">
      {/* 列标签行 */}
      <div className="flex" style={gap ? { gap: `${gap}px`, marginBottom: `${gap}px` } : {}}>
        {columns.map(column => (
          <div
            key={column.dataIndex}
            className="text-center font-semibold text-gray-400"
            style={{
              minWidth: column.isHeat === false ? '40px' : `${minCellSize}px`,
              width: column.isHeat === false ? '40px' : undefined,
              flex: column.isHeat === false ? '0 0 auto' : 1,
              fontSize: 'clamp(7px, 1.2vw, 10px)',
              padding: '4px 0',
              lineHeight: '1',
            }}>
            {column.title}
          </div>
        ))}
      </div>

      {/* 热力图主体 */}
      {dataSource.map((row, rowIndex) => (
        <div key={rowIndex} className="flex" style={gap ? { gap: `${gap}px`, marginBottom: `${gap}px` } : {}}>
          {/* 渲染所有列 */}
          {columns.map((column, columnIndex) => {
            const value = getValue(row, column.dataIndex);
            const isHeatColumn = column.isHeat !== false;

            // 非热力图列：显示文本
            if (!isHeatColumn) {
              return (
                <div
                  key={`${rowIndex}-${column.dataIndex}`}
                  className="flex items-center justify-center font-bold text-[#333333]"
                  style={{
                    minWidth: '40px',
                    width: '40px',
                    flexShrink: 0,
                    fontSize: 'clamp(9px, 1.5vw, 12px)',
                    lineHeight: '1',
                    padding: '0 4px',
                  }}>
                  {String(value)}
                </div>
              );
            }

            // 热力图列：显示热力格子
            const numValue = typeof value === 'number' ? value : 0;
            return (
              <div
                key={`${rowIndex}-${column.dataIndex}`}
                onClick={() => handleCellClick(row, column.dataIndex, rowIndex, columnIndex)}
                onMouseEnter={() => handleCellHover(row, column.dataIndex, rowIndex, columnIndex)}
                className={`relative overflow-hidden border border-white/5 ${enableAnimation ? 'cursor-pointer transition-all duration-200 ease-out' : ''}`}
                style={{
                  minWidth: `${minCellSize}px`,
                  maxHeight: 'clamp(9px, 1.5vw, 12px)',
                  flex: 1,
                  backgroundColor: getColor(numValue),
                }}
                onMouseLeave={e => {
                  if (enableAnimation) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.zIndex = '1';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
                title={getTooltip(row, column)}>
                {/* 闪光效果 */}
                {enableShimmer && numValue > shimmerValue && (
                  <div
                    className="animate-shimmer pointer-events-none absolute -left-1/2 -top-1/2 h-[200%] w-[200%]"
                    style={{
                      background:
                        'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Heatmap;
