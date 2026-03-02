'use client';

import React from 'react';
import { Card, Form, Input, Switch, Select, Button, message, Divider, Typography } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import { SaveOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

export default function SettingsPage() {
  const [form] = Form.useForm();

  const handleSave = () => {
    message.success('设置已保存');
  };

  return (
    <ProCard>
      <Title level={3}>系统设置</Title>

      <Card title="基本设置" style={{ marginBottom: 16 }}>
        <Form form={form} layout="vertical" initialValues={{ language: 'zh-CN', timezone: 'Asia/Shanghai' }}>
          <Form.Item label="系统名称" name="systemName">
            <Input placeholder="工厂生产管理系统" />
          </Form.Item>

          <Form.Item label="语言" name="language">
            <Select>
              <Option value="zh-CN">简体中文</Option>
              <Option value="en-US">English</Option>
            </Select>
          </Form.Item>

          <Form.Item label="时区" name="timezone">
            <Select>
              <Option value="Asia/Shanghai">中国标准时间 (Asia/Shanghai)</Option>
              <Option value="Asia/Tokyo">日本标准时间 (Asia/Tokyo)</Option>
              <Option value="UTC">UTC</Option>
            </Select>
          </Form.Item>
        </Form>
      </Card>

      <Card title="通知设置" style={{ marginBottom: 16 }}>
        <Form layout="vertical" initialValues={{ emailNotify: true, smsNotify: false, lowStockAlert: true }}>
          <Form.Item label="邮件通知" name="emailNotify" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item label="短信通知" name="smsNotify" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item label="低库存预警" name="lowStockAlert" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item label="设备维护提醒" name="maintenanceAlert" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Card>

      <Card title="邮箱配置">
        <Form layout="vertical">
          <Form.Item label="SMTP服务器" name="smtpServer">
            <Input placeholder="smtp.example.com" />
          </Form.Item>

          <Form.Item label="端口" name="port">
            <Input placeholder="587" />
          </Form.Item>

          <Form.Item label="用户名" name="username">
            <Input placeholder="your-email@example.com" />
          </Form.Item>

          <Form.Item label="密码" name="password">
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
        </Form>
      </Card>

      <Divider />

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} size="large">
          保存设置
        </Button>
      </div>
    </ProCard>
  );
}
