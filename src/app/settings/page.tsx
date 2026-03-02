'use client';

import React from 'react';
import { Card, Form, Input, InputNumber, Switch, Button, message, Divider, Typography } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function SettingsPage() {
  const [form] = Form.useForm();

  const handleSave = () => {
    message.success('设置已保存');
  };

  return (
    <div>
      <Title level={3}>系统设置</Title>

      <Card title="基本设置" style={{ marginBottom: 16 }}>
        <Form form={form} layout="vertical" initialValues={{ lowStockThreshold: 50 }}>
          <Form.Item label="工厂名称" name="factoryName">
            <Input placeholder="古楼山竹筷厂" />
          </Form.Item>

          <Form.Item
            label="低库存预警阈值"
            name="lowStockThreshold"
            extra="库存低于此数量时显示预警"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Card>

      <Card title="库存设置" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Form.Item label="竹丝低库存阈值" name="bambooLowStock">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="50" />
          </Form.Item>

          <Form.Item label="竹筷低库存阈值" name="chopstickLowStock">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="50" />
          </Form.Item>
        </Form>
      </Card>

      <Card title="提醒设置">
        <Form layout="vertical" initialValues={{ lowStockAlert: true, pendingPaymentAlert: true }}>
          <Form.Item label="低库存预警" name="lowStockAlert" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item label="待付款提醒" name="pendingPaymentAlert" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Card>

      <Divider />

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} size="large">
          保存设置
        </Button>
      </div>
    </div>
  );
}
