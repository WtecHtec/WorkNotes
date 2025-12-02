import type { BackendMergeConfig } from "../configParser";

/**
 * Mock 数据 - 用于测试和演示
 */

/**
 * OTA 月报数据
 */
export const otaReportData = [
  { date: "汇总", hotel: "全部酒店", ctrip: 100, meituan: 80, fliggy: 50, official: 120, wechat: 60 },
  { date: "1月1日", hotel: "希尔顿", ctrip: 10, meituan: 8, fliggy: 5, official: 12, wechat: 6 },
  { date: "1月1日", hotel: "万豪", ctrip: 15, meituan: 10, fliggy: 7, official: 20, wechat: 9 },
  { date: "1月2日", hotel: "希尔顿", ctrip: 12, meituan: 9, fliggy: 6, official: 15, wechat: 8 },
  { date: "1月2日", hotel: "万豪", ctrip: 18, meituan: 11, fliggy: 8, official: 25, wechat: 12 },
];

/**
 * OTA 月报合并配置
 */
export const otaReportMergeConfig: BackendMergeConfig = {
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
  cellMerge: [
    {
      field: "date",
    },
    {
      field: "hotel",
      dependsOn: ["date"],
    },
  ],
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

/**
 * 财务报表数据
 */
export const financialReportData = [
  { category: "收入", subCategory: "主营业务收入", q1: 1000, q2: 1200, q3: 1100, q4: 1300 },
  { category: "收入", subCategory: "其他业务收入", q1: 200, q2: 250, q3: 220, q4: 280 },
  { category: "成本", subCategory: "主营业务成本", q1: 600, q2: 700, q3: 650, q4: 750 },
  { category: "成本", subCategory: "管理费用", q1: 100, q2: 120, q3: 110, q4: 130 },
  { category: "利润", subCategory: "净利润", q1: 500, q2: 630, q3: 560, q4: 700 },
];

/**
 * 财务报表合并配置
 */
export const financialReportMergeConfig: BackendMergeConfig = {
  headerMerge: [
    {
      startColumn: "q1",
      colSpan: 4,
      title: "2024年季度数据",
      align: "center",
    },
  ],
  cellMerge: [
    {
      field: "category",
    },
  ],
  rowMerge: [
    {
      startColumn: "category",
      colSpan: 2,
      condition: {
        type: "fieldEquals",
        field: "category",
        value: "利润",
      },
    },
  ],
};

/**
 * 学生成绩表数据
 */
export const studentScoreData = [
  { grade: "高一", class: "1班", name: "张三", math: 90, english: 85, physics: 88 },
  { grade: "高一", class: "1班", name: "李四", math: 88, english: 90, physics: 85 },
  { grade: "高一", class: "2班", name: "王五", math: 92, english: 87, physics: 90 },
  { grade: "高二", class: "1班", name: "赵六", math: 85, english: 88, physics: 86 },
];

/**
 * 学生成绩表合并配置
 */
export const studentScoreMergeConfig: BackendMergeConfig = {
  headerMerge: [
    {
      startColumn: "math",
      colSpan: 3,
      title: "科目成绩",
      align: "center",
    },
  ],
  cellMerge: [
    {
      field: "grade",
    },
    {
      field: "class",
      dependsOn: ["grade"],
    },
  ],
};

/**
 * 项目进度表数据
 */
export const projectProgressData = [
  { type: "header", name: "项目总览", progress: "", owner: "", status: "" },
  { type: "project", name: "项目A", progress: "80%", owner: "张三", status: "进行中" },
  { type: "project", name: "项目B", progress: "60%", owner: "李四", status: "进行中" },
  { type: "summary", name: "阶段小计", progress: "", owner: "", status: "" },
  { type: "project", name: "项目C", progress: "100%", owner: "王五", status: "已完成" },
];

/**
 * 项目进度表合并配置（展示多种条件类型）
 */
export const projectProgressMergeConfig: BackendMergeConfig = {
  rowMerge: [
    {
      startColumn: "name",
      colSpan: 4,
      condition: {
        type: "fieldIn",
        field: "type",
        values: ["header", "summary"],
      },
    },
  ],
};

/**
 * 按行号合并示例数据
 */
export const rowIndexExampleData = [
  { col1: "标题行", col2: "", col3: "", col4: "" },
  { col1: "A1", col2: "B1", col3: "C1", col4: "D1" },
  { col1: "A2", col2: "B2", col3: "C2", col4: "D2" },
  { col1: "小计", col2: "", col3: "", col4: "" },
  { col1: "A3", col2: "B3", col3: "C3", col4: "D3" },
];

/**
 * 按行号合并配置
 */
export const rowIndexExampleMergeConfig: BackendMergeConfig = {
  rowMerge: [
    {
      startColumn: "col1",
      colSpan: 4,
      condition: {
        type: "rowIndex",
        indices: [0, 3], // 第 0 行和第 3 行
      },
    },
  ],
};

/**
 * 按行号范围合并示例配置
 */
export const rowRangeExampleMergeConfig: BackendMergeConfig = {
  rowMerge: [
    {
      startColumn: "col1",
      colSpan: 2,
      condition: {
        type: "rowIndexRange",
        start: 0,
        end: 2, // 前 3 行
      },
    },
  ],
};

/**
 * 自定义表达式示例配置
 */
export const customExpressionMergeConfig: BackendMergeConfig = {
  rowMerge: [
    {
      startColumn: "col1",
      colSpan: 4,
      condition: {
        type: "custom",
        expression: "record.col1.includes('标题') || record.col1.includes('小计')",
      },
    },
  ],
};

/**
 * 所有 Mock 数据集合
 */
export const mockDataSets = {
  otaReport: {
    data: otaReportData,
    config: otaReportMergeConfig,
    title: "OTA月报",
  },
  financialReport: {
    data: financialReportData,
    config: financialReportMergeConfig,
    title: "财务报表",
  },
  studentScore: {
    data: studentScoreData,
    config: studentScoreMergeConfig,
    title: "学生成绩表",
  },
  projectProgress: {
    data: projectProgressData,
    config: projectProgressMergeConfig,
    title: "项目进度表",
  },
  rowIndexExample: {
    data: rowIndexExampleData,
    config: rowIndexExampleMergeConfig,
    title: "行号合并示例",
  },
};

/**
 * 模拟后端 API
 */
export const mockApi = {
  /**
   * 获取数据集列表
   */
  getDataSetList: () => {
    return Promise.resolve(
      Object.keys(mockDataSets).map((key) => ({
        key,
        title: mockDataSets[key as keyof typeof mockDataSets].title,
      })),
    );
  },

  /**
   * 获取指定数据集
   */
  getDataSet: (key: keyof typeof mockDataSets) => {
    const dataSet = mockDataSets[key];
    if (!dataSet) {
      return Promise.reject(new Error("数据集不存在"));
    }
    return Promise.resolve(dataSet);
  },

  /**
   * 模拟延迟
   */
  delay: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

  /**
   * 获取数据（带延迟模拟）
   */
  getDataWithDelay: async (key: keyof typeof mockDataSets, delay: number = 500) => {
    await mockApi.delay(delay);
    return mockApi.getDataSet(key);
  },
};
