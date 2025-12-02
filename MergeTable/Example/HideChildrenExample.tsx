import React from "react";
import { Space, Button } from "antd";
import type { ColumnType } from "antd/es/table";
import { MergeTable } from "../index";

/**
 * hideChildren 参数使用示例
 */

interface ReportData {
  date: string;
  hotel: string;
  ctrip: number;
  meituan: number;
  fliggy: number;
  official: number;
  wechat: number;
}

const data: ReportData[] = [
  { date: "1月1日", hotel: "希尔顿", ctrip: 10, meituan: 8, fliggy: 5, official: 12, wechat: 6 },
  { date: "1月2日", hotel: "万豪", ctrip: 15, meituan: 10, fliggy: 7, official: 20, wechat: 9 },
  { date: "1月3日", hotel: "希尔顿", ctrip: 12, meituan: 9, fliggy: 6, official: 15, wechat: 8 },
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

/**
 * 示例 1: 默认行为 - 显示多级表头
 */
export function DefaultHeaderExample() {
  return (
    <div>
      <h4>默认行为：显示多级表头（hideChildren = false）</h4>
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
              hideChildren: false, // 默认值，显示子表头
            },
            {
              startColumn: "official",
              colSpan: 2,
              title: "直销渠道",
              align: "center",
              hideChildren: false,
            },
          ],
        }}
        bordered
        scroll={{ x: 800 }}
        pagination={false}
      />

      <div style={{ marginTop: 8, color: "#666", fontSize: 12 }}>
        <strong>效果</strong>：显示两级表头
        <pre style={{ background: "#f5f5f5", padding: 8, marginTop: 4 }}>
          {`
┌────────┬────────┬────────────────────────┬─────────────────────┐
│  日期  │  酒店  │       OTA渠道          │     直销渠道        │
│        │        ├────────┬────────┬──────┼──────────┬─────────┤
│        │        │  携程  │  美团  │ 飞猪 │   官网   │  微信   │
├────────┼────────┼────────┼────────┼──────┼──────────┼─────────┤
          `}
        </pre>
      </div>
    </div>
  );
}

/**
 * 示例 2: 隐藏子表头 - 只显示合并后的标题
 */
export function HideChildrenExample() {
  return (
    <div>
      <h4>隐藏子表头：只显示合并后的标题（hideChildren = true）</h4>
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
              hideChildren: true, // 隐藏子表头
            },
            {
              startColumn: "official",
              colSpan: 2,
              title: "直销渠道",
              align: "center",
              hideChildren: true, // 隐藏子表头
            },
          ],
        }}
        bordered
        scroll={{ x: 800 }}
        pagination={false}
      />

      <div style={{ marginTop: 8, color: "#666", fontSize: 12 }}>
        <strong>效果</strong>：只显示一级表头，第一列显示合并后的标题
        <pre style={{ background: "#f5f5f5", padding: 8, marginTop: 4 }}>
          {`
┌────────┬────────┬────────────┬────────┬──────┬──────────┬─────────┐
│  日期  │  酒店  │  OTA渠道   │  美团  │ 飞猪 │ 直销渠道 │  微信   │
├────────┼────────┼────────────┼────────┼──────┼──────────┼─────────┤
          `}
        </pre>
      </div>
    </div>
  );
}

/**
 * 示例 3: 混合模式
 */
export function MixedModeExample() {
  return (
    <div>
      <h4>混合模式：部分显示子表头，部分不显示</h4>
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
              hideChildren: false, // 显示子表头
            },
            {
              startColumn: "official",
              colSpan: 2,
              title: "直销渠道",
              align: "center",
              hideChildren: true, // 隐藏子表头
            },
          ],
        }}
        bordered
        scroll={{ x: 800 }}
        pagination={false}
      />

      <div style={{ marginTop: 8, color: "#666", fontSize: 12 }}>
        <strong>效果</strong>：OTA渠道显示子表头，直销渠道不显示
      </div>
    </div>
  );
}

/**
 * 示例 4: 后端配置示例
 */
export function BackendConfigExample() {
  const backendConfig = {
    headerMerge: [
      {
        startColumn: "ctrip",
        colSpan: 3,
        title: "OTA渠道",
        align: "center",
        hideChildren: true, // 后端返回的配置
      },
      {
        startColumn: "official",
        colSpan: 2,
        title: "直销渠道",
        align: "center",
        hideChildren: true,
      },
    ],
  };

  return (
    <div>
      <h4>后端配置示例</h4>
      <div style={{ marginBottom: 16 }}>
        <strong>后端接口返回的配置：</strong>
        <pre style={{ background: "#f5f5f5", padding: 16, overflow: "auto", fontSize: 12 }}>{JSON.stringify(backendConfig, null, 2)}</pre>
      </div>
    </div>
  );
}

/**
 * 对比示例页面
 */
export default function HideChildrenExamples() {
  const [currentMode, setCurrentMode] = React.useState<"default" | "hide" | "mixed">("default");

  return (
    <div style={{ padding: 24 }}>
      <h2>hideChildren 参数对比</h2>

      <Space style={{ marginBottom: 16 }}>
        <Button type={currentMode === "default" ? "primary" : "default"} onClick={() => setCurrentMode("default")}>
          默认模式（多级表头）
        </Button>
        <Button type={currentMode === "hide" ? "primary" : "default"} onClick={() => setCurrentMode("hide")}>
          隐藏子表头
        </Button>
        <Button type={currentMode === "mixed" ? "primary" : "default"} onClick={() => setCurrentMode("mixed")}>
          混合模式
        </Button>
      </Space>

      {currentMode === "default" && <DefaultHeaderExample />}
      {currentMode === "hide" && <HideChildrenExample />}
      {currentMode === "mixed" && <MixedModeExample />}

      <div style={{ marginTop: 48 }}>
        <BackendConfigExample />
      </div>

      <div style={{ marginTop: 24, padding: 16, background: "#f0f9ff", borderRadius: 4 }}>
        <h4>使用场景</h4>
        <ul>
          <li>
            <strong>hideChildren = false</strong>（默认）：适用于需要清晰展示每列含义的场景，如详细报表
          </li>
          <li>
            <strong>hideChildren = true</strong>：适用于列数较多、表头空间有限的场景，或者子列含义已经明确的情况
          </li>
        </ul>
      </div>
    </div>
  );
}
