/**
 * 后端实现参考示例（Node.js + Express）
 *
 * 安装依赖：
 * npm install express
 *
 * 运行：
 * node backend-example.js
 */

const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// 模拟配置数据库（实际项目中应该存储在数据库）
const configs = {
  'ota-report': {
    headerMerge: [
      {
        startColumn: 'ctrip',
        colSpan: 3,
        title: 'OTA渠道',
        align: 'center',
      },
      {
        startColumn: 'official',
        colSpan: 2,
        title: '直销渠道',
        align: 'center',
      },
    ],
    cellMerge: [
      {
        field: 'date',
      },
      {
        field: 'hotel',
        dependsOn: ['date'],
      },
    ],
    rowMerge: [
      {
        startColumn: 'date',
        colSpan: 2,
        condition: {
          type: 'fieldEquals',
          field: 'date',
          value: '汇总',
        },
      },
    ],
  },
  'financial-report': {
    headerMerge: [
      {
        startColumn: 'q1',
        colSpan: 4,
        title: '2024年季度数据',
        align: 'center',
      },
    ],
    cellMerge: [
      {
        field: 'category',
      },
    ],
    rowMerge: [
      {
        startColumn: 'category',
        colSpan: 2,
        condition: {
          type: 'fieldEquals',
          field: 'category',
          value: '利润',
        },
      },
    ],
  },
};

// 模拟表格数据
const tableData = {
  'ota-report': [
    { date: '汇总', hotel: '全部酒店', ctrip: 100, meituan: 80, fliggy: 50, official: 120, wechat: 60 },
    { date: '1月1日', hotel: '希尔顿', ctrip: 10, meituan: 8, fliggy: 5, official: 12, wechat: 6 },
    { date: '1月1日', hotel: '万豪', ctrip: 15, meituan: 10, fliggy: 7, official: 20, wechat: 9 },
    { date: '1月2日', hotel: '希尔顿', ctrip: 12, meituan: 9, fliggy: 6, official: 15, wechat: 8 },
  ],
  'financial-report': [
    { category: '收入', subCategory: '主营业务收入', q1: 1000, q2: 1200, q3: 1100, q4: 1300 },
    { category: '收入', subCategory: '其他业务收入', q1: 200, q2: 250, q3: 220, q4: 280 },
    { category: '成本', subCategory: '主营业务成本', q1: 600, q2: 700, q3: 650, q4: 750 },
    { category: '利润', subCategory: '净利润', q1: 500, q2: 630, q3: 560, q4: 700 },
  ],
};

// ==================== API 接口 ====================

/**
 * 获取表格数据和配置
 * GET /api/table/:tableType
 */
app.get('/api/table/:tableType', (req, res) => {
  const { tableType } = req.params;

  const data = tableData[tableType];
  const mergeConfig = configs[tableType];

  if (!data || !mergeConfig) {
    return res.status(404).json({
      error: '表格类型不存在',
      availableTypes: Object.keys(tableData),
    });
  }

  res.json({
    success: true,
    data,
    mergeConfig,
  });
});

/**
 * 仅获取合并配置
 * GET /api/merge-config/:tableType
 */
app.get('/api/merge-config/:tableType', (req, res) => {
  const { tableType } = req.params;
  const config = configs[tableType];

  if (!config) {
    return res.status(404).json({
      error: '配置不存在',
      availableTypes: Object.keys(configs),
    });
  }

  res.json(config);
});

/**
 * 更新合并配置（管理后台使用）
 * POST /api/merge-config/:tableType
 */
app.post('/api/merge-config/:tableType', (req, res) => {
  const { tableType } = req.params;
  const newConfig = req.body;

  // 验证配置格式
  const validation = validateMergeConfig(newConfig);
  if (!validation.valid) {
    return res.status(400).json({
      error: '配置格式错误',
      errors: validation.errors,
    });
  }

  // 保存配置（实际项目中应该保存到数据库）
  configs[tableType] = newConfig;

  res.json({
    success: true,
    message: '配置更新成功',
  });
});

/**
 * 获取所有可用的表格类型
 * GET /api/table-types
 */
app.get('/api/table-types', (req, res) => {
  res.json({
    success: true,
    types: Object.keys(tableData).map(key => ({
      key,
      hasData: !!tableData[key],
      hasConfig: !!configs[key],
    })),
  });
});

// ==================== 配置验证函数 ====================

function validateMergeConfig(config) {
  const errors = [];

  if (!config || typeof config !== 'object') {
    errors.push('配置必须是一个对象');
    return { valid: false, errors };
  }

  // 验证 headerMerge
  if (config.headerMerge) {
    if (!Array.isArray(config.headerMerge)) {
      errors.push('headerMerge 必须是数组');
    } else {
      config.headerMerge.forEach((item, index) => {
        if (!item.startColumn) errors.push(`headerMerge[${index}] 缺少 startColumn`);
        if (typeof item.colSpan !== 'number') errors.push(`headerMerge[${index}] colSpan 必须是数字`);
        if (!item.title) errors.push(`headerMerge[${index}] 缺少 title`);
      });
    }
  }

  // 验证 cellMerge
  if (config.cellMerge) {
    if (!Array.isArray(config.cellMerge)) {
      errors.push('cellMerge 必须是数组');
    } else {
      config.cellMerge.forEach((item, index) => {
        if (!item.field) errors.push(`cellMerge[${index}] 缺少 field`);
        if (item.dependsOn && !Array.isArray(item.dependsOn)) {
          errors.push(`cellMerge[${index}] dependsOn 必须是数组`);
        }
      });
    }
  }

  // 验证 rowMerge
  if (config.rowMerge) {
    if (!Array.isArray(config.rowMerge)) {
      errors.push('rowMerge 必须是数组');
    } else {
      config.rowMerge.forEach((item, index) => {
        if (!item.startColumn) errors.push(`rowMerge[${index}] 缺少 startColumn`);
        if (typeof item.colSpan !== 'number') errors.push(`rowMerge[${index}] colSpan 必须是数字`);
        if (!item.condition) errors.push(`rowMerge[${index}] 缺少 condition`);
        if (item.condition && !item.condition.type) {
          errors.push(`rowMerge[${index}] condition 缺少 type`);
        }
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

// ==================== CORS 支持 ====================

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ==================== 启动服务器 ====================

app.listen(PORT, () => {
  console.log(`\n=================================`);
  console.log(`🚀 后端服务已启动`);
  console.log(`=================================`);
  console.log(`\n📡 API 地址：`);
  console.log(`  http://localhost:${PORT}/api/table/:tableType`);
  console.log(`  http://localhost:${PORT}/api/merge-config/:tableType`);
  console.log(`  http://localhost:${PORT}/api/table-types`);
  console.log(`\n📋 可用的表格类型：`);
  Object.keys(tableData).forEach(key => {
    console.log(`  - ${key}`);
  });
  console.log(`\n📝 测试命令：`);
  console.log(`  curl http://localhost:${PORT}/api/table/ota-report`);
  console.log(`  curl http://localhost:${PORT}/api/merge-config/ota-report`);
  console.log(`\n`);
});

// ==================== 数据库集成示例（MySQL）====================

/*
// 使用 MySQL 存储配置

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'your_database',
});

// 创建表
CREATE TABLE table_merge_configs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  table_type VARCHAR(50) UNIQUE NOT NULL,
  config JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

// 获取配置
app.get('/api/merge-config/:tableType', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT config FROM table_merge_configs WHERE table_type = ?',
      [req.params.tableType]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: '配置不存在' });
    }

    res.json(rows[0].config);
  } catch (error) {
    res.status(500).json({ error: '数据库错误' });
  }
});

// 保存配置
app.post('/api/merge-config/:tableType', async (req, res) => {
  try {
    const validation = validateMergeConfig(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: '配置格式错误', errors: validation.errors });
    }

    await pool.query(
      'INSERT INTO table_merge_configs (table_type, config) VALUES (?, ?) ON DUPLICATE KEY UPDATE config = ?',
      [req.params.tableType, JSON.stringify(req.body), JSON.stringify(req.body)]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '数据库错误' });
  }
});
*/

// ==================== MongoDB 集成示例 ====================

/*
const { MongoClient } = require('mongodb');

const client = new MongoClient('mongodb://localhost:27017');
const db = client.db('your_database');
const configsCollection = db.collection('table_merge_configs');

// 获取配置
app.get('/api/merge-config/:tableType', async (req, res) => {
  try {
    const config = await configsCollection.findOne({
      tableType: req.params.tableType
    });

    if (!config) {
      return res.status(404).json({ error: '配置不存在' });
    }

    res.json(config.mergeConfig);
  } catch (error) {
    res.status(500).json({ error: '数据库错误' });
  }
});

// 保存配置
app.post('/api/merge-config/:tableType', async (req, res) => {
  try {
    const validation = validateMergeConfig(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: '配置格式错误', errors: validation.errors });
    }

    await configsCollection.updateOne(
      { tableType: req.params.tableType },
      { $set: { mergeConfig: req.body, updatedAt: new Date() } },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '数据库错误' });
  }
});
*/
