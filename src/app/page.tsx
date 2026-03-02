'use client';

import React from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Tag } from 'antd';
import {
  ArrowUpOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  InboxOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { dashboardStats, productionPlans, equipmentList } from '@/mock/data';

const STATUS_COLORS = {
  pending: '#faad14',
  in_progress: '#1890ff',
  completed: '#52c41a',
  cancelled: '#ff4d4f',
};

const EQUIPMENT_STATUS_COLORS = {
  running: '#52c41a',
  maintenance: '#faad14',
  idle: '#1890ff',
  fault: '#ff4d4f',
};

const STATUS_MAP: Record<string, string> = {
  pending: '待生产',
  in_progress: '生产中',
  completed: '已完成',
  cancelled: '已取消',
};

const EQUIPMENT_STATUS_MAP: Record<string, string> = {
  running: '运行中',
  maintenance: '维护中',
  idle: '空闲',
  fault: '故障',
};

const productionData = [
  { name: '1月', value: 4000 },
  { name: '2月', value: 3000 },
  { name: '3月', value: 5000 },
  { name: '4月', value: 2780 },
  { name: '5月', value: 1890 },
  { name: '6月', value: 2390 },
];

const inventoryData = [
  { name: '电子元器件', value: 400 },
  { name: '结构件', value: 300 },
  { name: '紧固件', value: 300 },
  { name: '线缆', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Dashboard() {
  const planColumns = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={STATUS_COLORS[status as keyof typeof STATUS_COLORS]}>
          {STATUS_MAP[status]}
        </Tag>
      ),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress percent={progress} size="small" />
      ),
    },
  ];

  const equipmentColumns = [
    {
      title: '设备编号',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={EQUIPMENT_STATUS_COLORS[status as keyof typeof EQUIPMENT_STATUS_COLORS]}>
          {EQUIPMENT_STATUS_MAP[status]}
        </Tag>
      ),
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
    },
  ];

  return (
    <ProCard>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总订单数"
              value={dashboardStats.totalOrders}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
            <div style={{ marginTop: 16, color: 'rgba(0, 0, 0, 0.45)', fontSize: 14 }}>
              已完成: {dashboardStats.completedOrders}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="生产中"
              value={dashboardStats.inProgressOrders}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 16, color: 'rgba(0, 0, 0, 0.45)', fontSize: 14 }}>
              待生产: {dashboardStats.pendingOrders}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="库存总量"
              value={dashboardStats.totalInventory}
              prefix={<InboxOutlined />}
              suffix="件"
            />
            <div style={{ marginTop: 16, color: 'rgba(0, 0, 0, 0.45)', fontSize: 14 }}>
              <WarningOutlined style={{ color: '#faad14', marginRight: 4 }} />
              低库存: {dashboardStats.lowStockItems} 项
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="设备利用率"
              value={dashboardStats.equipmentUtilization}
              suffix="%"
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 16, color: 'rgba(0, 0, 0, 0.45)', fontSize: 14 }}>
              今日产量: {dashboardStats.todayProduction} 件
              <ArrowUpOutlined style={{ color: '#52c41a', marginLeft: 4 }} />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="月度生产趋势">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1890ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="库存分类">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={inventoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {inventoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="生产计划" extra={<a href="/production">查看全部</a>}>
            <Table
              columns={planColumns}
              dataSource={productionPlans}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="设备状态" extra={<a href="/equipment">查看全部</a>}>
            <Table
              columns={equipmentColumns}
              dataSource={equipmentList}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </ProCard>
  );
}
