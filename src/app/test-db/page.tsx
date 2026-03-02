'use client';

import React, { useState, useEffect } from 'react';
import { Card, Typography, Alert, Spin } from 'antd';
import { testConnection } from '@/app/actions/dbActions';

const { Title, Paragraph } = Typography;

export default function TestDbPage() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    async function test() {
      try {
        const res = await testConnection();
        setResult(res);
      } catch (error) {
        setResult({ error: String(error) });
      } finally {
        setLoading(false);
      }
    }
    test();
  }, []);

  return (
    <Card>
      <Title level={3}>数据库连接测试</Title>
      <Spin spinning={loading}>
        {result ? (
          result.error ? (
            <Alert
              message="连接失败"
              description={result.error}
              type="error"
              showIcon
            />
          ) : (
            <Alert
              message="连接成功"
              description={`数据库已连接`}
              type="success"
              showIcon
            />
          )
        ) : (
          <Paragraph>正在测试连接...</Paragraph>
        )}
      </Spin>
    </Card>
  );
}
