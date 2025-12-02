import React, { useState, useEffect } from "react";
import { Button, Space, message } from "antd";
import type { ColumnType } from "antd/es/table";
import { MergeTable } from "../index";
import { parseMergeConfig, validateBackendConfig } from "../configParser";
import type { BackendMergeConfig } from "../configParser";

/**
 * 使用后端配置的示例组件
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

/**
 * 模拟后端接口
 */
const mockBackendApi = {
  // 获取表格数据
  getTableData: (): Promise<ReportData[]> => {
    return Promise.resolve([
      { date: "汇总", hotel: "全部酒店", ctrip: 100, meituan: 80, fliggy: 50, official: 120, wechat: 60 },
      { date: "1月1日", hotel: "希尔顿", ctrip: 10, meituan: 8, fliggy: 5, official: 12, wechat: 6 },
      { date: "1月1日", hotel: "万豪", ctrip: 15, meituan: 10, fliggy: 7, official: 20, wechat: 9 },
      { date: "1月2日", hotel: "希尔顿", ctrip: 12, meituan: 9, fliggy: 6, official: 15, wechat: 8 },
    ]);
  },

  // 获取合并配置
  getMergeConfig: (): Promise<BackendMergeConfig<ReportData>> => {
    return Promise.resolve({
      // 表头合并配置
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

      // 单元格行合并配置
      cellMerge: [
        {
          field: "date",
        },
        {
          field: "hotel",
          dependsOn: ["date"],
        },
      ],

      // 行内列合并配置
      rowMerge: [
        {
          startColumn: "date",
          colSpan: 2,
          // 使用 fieldEquals 条件：date 字段等于 '汇总'
          condition: {
            type: "fieldEquals",
            field: "date",
            value: "汇总",
          },
        },
      ],
    });
  },
};

/**
 * 示例 1: 基础用法 - 从后端获取配置
 */
export function BasicBackendConfigExample() {
  const [data, setData] = useState<ReportData[]>([]);
  const [backendConfig, setBackendConfig] = useState<BackendMergeConfig<ReportData>>();
  const [loading, setLoading] = useState(false);

  // 加载数据和配置
  const loadData = async () => {
    setLoading(true);
    try {
      const [tableData, config] = await Promise.all([mockBackendApi.getTableData(), mockBackendApi.getMergeConfig()]);

      // 验证配置
      const validation = validateBackendConfig(config);
      if (!validation.valid) {
        message.error("配置格式错误：" + validation.errors.join(", "));
        return;
      }

      setData(tableData);
      setBackendConfig(config);
      message.success("数据加载成功");
    } catch (error) {
      message.error("加载失败");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns: ColumnType<ReportData>[] = [
    { title: "日期", dataIndex: "date", width: 100, fixed: "left" },
    { title: "酒店", dataIndex: "hotel", width: 120, fixed: "left" },
    { title: "携程", dataIndex: "ctrip", width: 80, align: "right" },
    { title: "美团", dataIndex: "meituan", width: 80, align: "right" },
    { title: "飞猪", dataIndex: "fliggy", width: 80, align: "right" },
    { title: "官网", dataIndex: "official", width: 80, align: "right" },
    { title: "微信", dataIndex: "wechat", width: 80, align: "right" },
  ];

  // 解析后端配置
  const mergeConfig = parseMergeConfig(backendConfig);

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={loadData} loading={loading}>
          重新加载
        </Button>
      </Space>

      <MergeTable dataSource={data} columns={columns} mergeConfig={mergeConfig} bordered scroll={{ x: 800 }} pagination={false} loading={loading} />
    </div>
  );
}

/**
 * 示例 2: 不同条件类型的配置
 */
export function DifferentConditionsExample() {
  // 配置 1: fieldEquals - 字段等于某值
  const config1: BackendMergeConfig = {
    rowMerge: [
      {
        startColumn: "date",
        colSpan: 2,
        condition: {
          type: "fieldEquals",
          field: "date",
          value: "汇总",
        },
      },
    ],
  };

  // 配置 2: fieldIn - 字段在数组中
  const config2: BackendMergeConfig = {
    rowMerge: [
      {
        startColumn: "date",
        colSpan: 2,
        condition: {
          type: "fieldIn",
          field: "date",
          values: ["汇总", "小计", "合计"],
        },
      },
    ],
  };

  // 配置 3: rowIndex - 行号在数组中
  const config3: BackendMergeConfig = {
    rowMerge: [
      {
        startColumn: "date",
        colSpan: 2,
        condition: {
          type: "rowIndex",
          indices: [0, 3, 6], // 第 0、3、6 行
        },
      },
    ],
  };

  // 配置 4: rowIndexRange - 行号在范围内
  const config4: BackendMergeConfig = {
    rowMerge: [
      {
        startColumn: "date",
        colSpan: 2,
        condition: {
          type: "rowIndexRange",
          start: 0,
          end: 2, // 前 3 行
        },
      },
    ],
  };

  // 配置 5: custom - 自定义表达式
  const config5: BackendMergeConfig = {
    rowMerge: [
      {
        startColumn: "date",
        colSpan: 2,
        condition: {
          type: "custom",
          expression: "record.date.includes('汇总') || index === 0",
        },
      },
    ],
  };

  return (
    <div>
      <h4>配置示例（用于后端接口返回）</h4>
      <pre style={{ background: "#f5f5f5", padding: 16, overflow: "auto" }}>
        {JSON.stringify(
          {
            "1. fieldEquals": config1,
            "2. fieldIn": config2,
            "3. rowIndex": config3,
            "4. rowIndexRange": config4,
            "5. custom": config5,
          },
          null,
          2,
        )}
      </pre>
    </div>
  );
}

/**
 * 完整示例页面
 */
export default function BackendConfigExamples() {
  return (
    <div style={{ padding: 24 }}>
      <h2>后端配置示例</h2>

      <div style={{ marginTop: 24 }}>
        <h3>1. 基础用法 - 从后端获取配置</h3>
        <BasicBackendConfigExample />
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>2. 不同条件类型的配置格式</h3>
        <DifferentConditionsExample />
      </div>
    </div>
  );
}
