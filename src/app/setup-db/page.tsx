'use client';

import React, { useState } from 'react';
import { Card, Button, Alert, Typography, Spin, message } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { testConnection, initializeDatabase } from '@/app/actions/dbActions';

const { Title, Paragraph } = Typography;

export default function SetupDbPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState<any>(null);
  const [initResult, setInitResult] = useState<any>(null);

  const handleTestConnection = async () => {
    setLoading(true);
    setStatus('testing');
    try {
      const result = await testConnection();
      setTestResult(result);
      setStatus('success');
      message.success('数据库连接成功！');
    } catch (error) {
      setTestResult({ error: String(error) });
      setStatus('error');
      message.error('数据库连接失败');
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    if (!confirm('确定要初始化数据库吗？这将创建所有表结构。')) {
      return;
    }
    setLoading(true);
    try {
      const result = await initializeDatabase();
      setInitResult(result);
      message.success('数据库初始化成功！');
    } catch (error) {
      setInitResult({ error: String(error) });
      message.error('数据库初始化失败');
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
          loading={loading && status === 'testing'}
          disabled={loading}
        >
          测试连接
        </Button>

        {testResult && (
          <div style={{ marginTop: 16 }}>
            {testResult.error ? (
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
                description={`数据库版本: ${testResult.version || '未知'}`}
                type="success"
                icon={<CheckCircleOutlined />}
                showIcon
              />
            )}
          </div>
        )}
      </Card>

      <Card title="步骤 2: 初始化数据库" style={{ marginBottom: 16 }}>
        <Paragraph>
          点击下方按钮创建所有数据库表结构。
        </Paragraph>
        <Paragraph type="secondary">
          注意：请先在 Neon SQL Editor 中手动执行 src/lib/schema.sql，因为 Neon 可能需要特殊权限。
        </Paragraph>
        <Button
          onClick={handleInitialize}
          loading={loading}
          disabled={status !== 'success'}
        >
          初始化数据库
        </Button>

        {initResult && (
          <div style={{ marginTop: 16 }}>
            {initResult.error ? (
              <Alert
                message="初始化失败"
                description={initResult.error}
                type="error"
                showIcon
              />
            ) : (
              <Alert
                message="初始化成功"
                description="数据库表已创建"
                type="success"
                showIcon
              />
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
