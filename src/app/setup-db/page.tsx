'use client';

import React, { useState } from 'react';
import { Card, Button, Alert, Typography, Spin, message, Divider } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { testConnection } from '@/app/actions/dbActions';
import { initAllData } from '@/app/actions/initDataActions';

const { Title, Paragraph } = Typography;

export default function SetupDbPage() {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [initDataResult, setInitDataResult] = useState<any>(null);

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      const result = await testConnection();
      setTestResult(result);
      if (result.success) {
        message.success('数据库连接成功！');
      } else {
        message.error('数据库连接失败');
      }
    } catch (error) {
      setTestResult({ success: false, error: String(error) });
      message.error('数据库连接失败');
    } finally {
      setLoading(false);
    }
  };

  const handleInitData = async () => {
    if (!confirm('确定要导入初始数据吗？这将导入竹丝规格、竹筷规格、供应商、客户、工人等基础数据。')) {
      return;
    }
    setLoading(true);
    try {
      const result = await initAllData();
      setInitDataResult(result);
      message.success('初始数据导入成功！');
    } catch (error) {
      setInitDataResult({ error: String(error) });
      message.error('数据导入失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <Title level={2}>数据库设置</Title>

      <Card title="步骤 1: 测试数据库连接" style={{ marginBottom: 16 }}>
        <Paragraph>
          点击下方按钮测试与 Neon Postgres 数据库的连接。
        </Paragraph>
        <Button
          type="primary"
          onClick={handleTestConnection}
          loading={loading}
        >
          测试连接
        </Button>

        {testResult && (
          <div style={{ marginTop: 16 }}>
            {testResult.error || !testResult.success ? (
              <Alert
                message="连接失败"
                description={testResult.error}
                type="error"
                icon={<ExclamationCircleOutlined />}
                showIcon
              />
            ) : (
              <Alert
                message="连接成功"
                description="数据库已正常连接"
                type="success"
                icon={<CheckCircleOutlined />}
                showIcon
              />
            )}
          </div>
        )}
      </Card>

      <Card title="步骤 2: 导入初始数据" style={{ marginBottom: 16 }}>
        <Paragraph>
          点击下方按钮导入模拟数据到数据库中。
        </Paragraph>
        <Paragraph type="secondary">
          包括：竹丝规格、竹筷规格、供应商、进货司机、客户、工人、库存等基础数据
        </Paragraph>
        <Button
          type="primary"
          onClick={handleInitData}
          loading={loading}
          disabled={testResult && !testResult.success}
        >
          导入初始数据
        </Button>

        {initDataResult && (
          <div style={{ marginTop: 16 }}>
            {initDataResult.error ? (
              <Alert
                message="导入失败"
                description={initDataResult.error}
                type="error"
                showIcon
              />
            ) : (
              <Alert
                message="导入成功"
                description={
                  <div>
                    <p>已导入数据：</p>
                    <ul>
                      <li>竹丝规格: {initDataResult.bambooSpecs?.count}</li>
                      <li>竹筷规格: {initDataResult.chopstickSpecs?.count}</li>
                      <li>供应商: {initDataResult.suppliers?.count}</li>
                      <li>进货司机: {initDataResult.inboundDrivers?.count}</li>
                      <li>客户: {initDataResult.customers?.count}</li>
                      <li>工人: {initDataResult.workers?.count}</li>
                    </ul>
                  </div>
                }
                type="success"
                showIcon
              />
            )}
          </div>
        )}
      </Card>

      <Divider />

      <Alert
        message="提示"
        description="Schema 已在 Neon SQL Editor 中执行完成。现在可以开始使用系统了！"
        type="info"
        showIcon
      />
    </div>
  );
}
