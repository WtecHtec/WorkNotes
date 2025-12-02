import React from "react";
import { MergeTable } from "../index";
import type { ColumnType } from "antd/es/table";

/**
 * MergeTable 使用示例
 */

// 示例数据类型
interface ReportData {
  date: string;
  hotel: string;
  ctrip: number;
  meituan: number;
  fliggy: number;
  official: number;
  wechat: number;
}

/**
 * 示例 1: 基础单元格行合并
 */
export function BasicMergeExample() {
  const data: ReportData[] = [
    { date: "1月1日", hotel: "希尔顿", ctrip: 10, meituan: 8, fliggy: 5, official: 12, wechat: 6 },
    { date: "1月1日", hotel: "万豪", ctrip: 15, meituan: 10, fliggy: 7, official: 20, wechat: 9 },
    { date: "1月2日", hotel: "希尔顿", ctrip: 12, meituan: 9, fliggy: 6, official: 15, wechat: 8 },
  ];

  const columns: ColumnType<ReportData>[] = [
    { title: "日期", dataIndex: "date", width: 100 },
    { title: "酒店", dataIndex: "hotel", width: 120 },
    { title: "携程", dataIndex: "ctrip", width: 80 },
    { title: "美团", dataIndex: "meituan", width: 80 },
  ];

  return (
    <MergeTable
      dataSource={data}
      columns={columns}
      mergeConfig={{
        cellMerge: [
          { field: "date" }, // 日期相同时合并行
        ],
      }}
      bordered
      pagination={false}
    />
  );
}

/**
 * 示例 2: 列级联合并
 */
export function CascadeMergeExample() {
  const data: ReportData[] = [
    { date: "1月1日", hotel: "希尔顿", ctrip: 10, meituan: 8, fliggy: 5, official: 12, wechat: 6 },
    { date: "1月1日", hotel: "希尔顿", ctrip: 15, meituan: 10, fliggy: 7, official: 20, wechat: 9 },
    { date: "1月1日", hotel: "万豪", ctrip: 12, meituan: 9, fliggy: 6, official: 15, wechat: 8 },
    { date: "1月2日", hotel: "希尔顿", ctrip: 18, meituan: 11, fliggy: 8, official: 22, wechat: 10 },
  ];

  const columns: ColumnType<ReportData>[] = [
    { title: "日期", dataIndex: "date", width: 100 },
    { title: "酒店", dataIndex: "hotel", width: 120 },
    { title: "携程", dataIndex: "ctrip", width: 80 },
  ];

  return (
    <MergeTable
      dataSource={data}
      columns={columns}
      mergeConfig={{
        cellMerge: [
          { field: "date" }, // 日期独立合并
          { field: "hotel", dependsOn: ["date"] }, // 酒店在日期相同时才合并
        ],
      }}
      bordered
      pagination={false}
    />
  );
}

/**
 * 示例 3: 表头列合并
 */
export function HeaderMergeExample() {
  const data: ReportData[] = [
    { date: "1月1日", hotel: "希尔顿", ctrip: 10, meituan: 8, fliggy: 5, official: 12, wechat: 6 },
    { date: "1月2日", hotel: "万豪", ctrip: 15, meituan: 10, fliggy: 7, official: 20, wechat: 9 },
  ];

  const columns: ColumnType<ReportData>[] = [
    { title: "日期", dataIndex: "date", width: 100 },
    { title: "酒店", dataIndex: "hotel", width: 120 },
    { title: "携程", dataIndex: "ctrip", width: 80 },
    { title: "美团", dataIndex: "meituan", width: 80 },
    { title: "飞猪", dataIndex: "fliggy", width: 80 },
    { title: "官网", dataIndex: "official", width: 80 },
    { title: "微信", dataIndex: "wechat", width: 80 },
  ];

  return (
    <MergeTable
      dataSource={data}
      columns={columns}
      mergeConfig={{
        headerMerge: [
          {
            startColumn: "ctrip",
            colSpan: 3,
            title: "OTA渠道",
            align: "center",
          },
          {
            startColumn: "official",
            colSpan: 2,
            title: "直销渠道",
            align: "center",
          },
        ],
      }}
      bordered
      pagination={false}
    />
  );
}

/**
 * 示例 4: 组合使用（表头合并 + 单元格合并）
 */
export function CombinedMergeExample() {
  const data: ReportData[] = [
    { date: "1月1日", hotel: "希尔顿", ctrip: 10, meituan: 8, fliggy: 5, official: 12, wechat: 6 },
    { date: "1月1日", hotel: "万豪", ctrip: 15, meituan: 10, fliggy: 7, official: 20, wechat: 9 },
    { date: "1月2日", hotel: "希尔顿", ctrip: 12, meituan: 9, fliggy: 6, official: 15, wechat: 8 },
  ];

  const columns: ColumnType<ReportData>[] = [
    { title: "日期", dataIndex: "date", width: 100, fixed: "left" },
    { title: "酒店", dataIndex: "hotel", width: 120, fixed: "left" },
    { title: "携程", dataIndex: "ctrip", width: 80, align: "right" },
    { title: "美团", dataIndex: "meituan", width: 80, align: "right" },
    { title: "飞猪", dataIndex: "fliggy", width: 80, align: "right" },
    { title: "官网", dataIndex: "official", width: 80, align: "right" },
    { title: "微信", dataIndex: "wechat", width: 80, align: "right" },
  ];

  return (
    <MergeTable
      dataSource={data}
      columns={columns}
      mergeConfig={{
        // 表头合并
        headerMerge: [
          { startColumn: "ctrip", colSpan: 3, title: "OTA渠道", align: "center" },
          { startColumn: "official", colSpan: 2, title: "直销渠道", align: "center" },
        ],
        // 单元格行合并
        cellMerge: [{ field: "date" }, { field: "hotel", dependsOn: ["date"] }],
      }}
      bordered
      scroll={{ x: 800 }}
      pagination={false}
    />
  );
}

/**
 * 示例 5: 行内列合并（横向合并）
 */
export function RowMergeExample() {
  interface TableData {
    type: string;
    name: string;
    value1: number;
    value2: number;
    value3: number;
  }

  const data: TableData[] = [
    { type: "summary", name: "总计", value1: 100, value2: 200, value3: 300 },
    { type: "detail", name: "明细1", value1: 50, value2: 100, value3: 150 },
    { type: "detail", name: "明细2", value1: 50, value2: 100, value3: 150 },
    { type: "summary", name: "小计", value1: 80, value2: 160, value3: 240 },
  ];

  const columns: ColumnType<TableData>[] = [
    { title: "类型", dataIndex: "type", width: 100 },
    { title: "名称", dataIndex: "name", width: 120 },
    { title: "数值1", dataIndex: "value1", width: 100 },
    { title: "数值2", dataIndex: "value2", width: 100 },
    { title: "数值3", dataIndex: "value3", width: 100 },
  ];

  return (
    <MergeTable
      dataSource={data}
      columns={columns}
      mergeConfig={{
        rowMerge: [
          {
            startColumn: "type",
            colSpan: 2, // 合并 type 和 name 列
            condition: (record) => record.type === "summary", // 只有 summary 类型才合并
          },
        ],
      }}
      bordered
      pagination={false}
    />
  );
}

/**
 * 示例 6: 完整示例（行合并 + 列合并 + 表头合并）
 */
export function CompleteExample() {
  const data: ReportData[] = [
    { date: "汇总", hotel: "全部酒店", ctrip: 100, meituan: 80, fliggy: 50, official: 120, wechat: 60 },
    { date: "1月1日", hotel: "希尔顿", ctrip: 10, meituan: 8, fliggy: 5, official: 12, wechat: 6 },
    { date: "1月1日", hotel: "万豪", ctrip: 15, meituan: 10, fliggy: 7, official: 20, wechat: 9 },
    { date: "1月2日", hotel: "希尔顿", ctrip: 12, meituan: 9, fliggy: 6, official: 15, wechat: 8 },
  ];

  const columns: ColumnType<ReportData>[] = [
    { title: "日期", dataIndex: "date", width: 100, fixed: "left" },
    { title: "酒店", dataIndex: "hotel", width: 120, fixed: "left" },
    { title: "携程", dataIndex: "ctrip", width: 80, align: "right" },
    { title: "美团", dataIndex: "meituan", width: 80, align: "right" },
    { title: "飞猪", dataIndex: "fliggy", width: 80, align: "right" },
    { title: "官网", dataIndex: "official", width: 80, align: "right" },
    { title: "微信", dataIndex: "wechat", width: 80, align: "right" },
  ];

  return (
    <MergeTable
      dataSource={data}
      columns={columns}
      mergeConfig={{
        // 表头合并
        headerMerge: [
          { startColumn: "ctrip", colSpan: 3, title: "OTA渠道", align: "center" },
          { startColumn: "official", colSpan: 2, title: "直销渠道", align: "center" },
        ],
        // 单元格行合并（纵向）
        cellMerge: [{ field: "date" }, { field: "hotel", dependsOn: ["date"] }],
        // 行内列合并（横向）
        rowMerge: [
          {
            startColumn: "date",
            colSpan: 2, // 合并日期和酒店列
            condition: (record) => record.date === "汇总", // 第一行是汇总行，合并前两列
          },
        ],
      }}
      bordered
      scroll={{ x: 800 }}
      pagination={false}
    />
  );
}

/**
 * 完整示例页面
 */
export default function MergeTableExamples() {
  return (
    <div style={{ padding: 24 }}>
      <h2>MergeTable 组件示例</h2>

      <div style={{ marginTop: 24 }}>
        <h3>1. 基础单元格行合并</h3>
        <BasicMergeExample />
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>2. 列级联合并</h3>
        <CascadeMergeExample />
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>3. 表头列合并</h3>
        <HeaderMergeExample />
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>4. 组合使用</h3>
        <CombinedMergeExample />
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>5. 行内列合并（横向合并）</h3>
        <RowMergeExample />
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>6. 完整示例（所有功能组合）</h3>
        <CompleteExample />
      </div>
    </div>
  );
}
