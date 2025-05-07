import { t } from '@/i18n';import React, { useState } from 'react';
import { Button, Input, message } from 'antd';

interface User {
  name: string;
  age: number;
}

export const TestComponent: React.FC = () => {
  const [user, setUser] = useState<User>({ name: t("张三"), age: 25 });
  const [loading, setLoading] = useState(false);

  // 简单的中文字符串
  const title = t("用户信息管理");

  // 包含变量的模板字符串
  const welcomeText = t("欢迎 {}，您已年满 {} 岁", [user.name, user.age]);

  // JSX 中的中文文本
  const handleSubmit = () => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      setLoading(false);
      message.success(t("保存成功！"));
    }, 1000);
  };

  return (
    <div className="test-container">
      <h1 className="title">{t("测试组件")}</h1>
      <p className="description">{t("这是一个用于测试国际化处理的组件")}</p>

      <div className="user-info">
        <h2>{t("个人资料")}</h2>
        <div className="form-item">
          <label>{t("姓名：")}</label>
          <Input
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            placeholder={t("请输入姓名")} />

        </div>
        <div className="form-item">
          <label>{t("年龄：")}</label>
          <Input
            type="number"
            value={user.age}
            onChange={(e) => setUser({ ...user, age: parseInt(e.target.value) || 0 })}
            placeholder={t("请输入年龄")} />

        </div>

        <Button
          type="primary"
          loading={loading}
          onClick={handleSubmit}>{t("保存修改")}


        </Button>

        {/* 条件渲染中的中文 */}
        {loading ? <p>{t("正在保存...")}</p> : <p>{t("点击按钮保存信息")}</p>}
      </div>

      {/* 错误提示中的中文 */}
      <div className="error-examples">
        <Button onClick={() => message.error(t("操作失败，请重试！"))}>{t("触发错误")}

        </Button>
        <Button onClick={() => message.warning(t("请先完善个人信息"))}>{t("显示警告")}

        </Button>
      </div>
    </div>);

};