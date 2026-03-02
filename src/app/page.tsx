'use client';

import React from 'react';
import { Card, Row, Col, Statistic, Table, Tag } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  WarningOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  dashboardStats,
  monthlyTrend,
  purchaseOrders,
  salesOrders,
  productionRecords,
} from '@/mock/data';

export default function Dashboard() {
  const pendingPurchaseOrders = purchaseOrders.filter((o) => o.status !== 'completed');
  const pendingSalesOrders = salesOrders.filter((o) => o.status !== 'completed');
  const recentProduction = productionRecords.slice(0, 5);

  const productionColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '操作人',
      dataIndex: 'workerName',
      key: 'workerName',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'consume' ? 'orange' : 'green'}>
          {type === 'consume' ? '消耗竹丝' : '生产竹筷'}
        </Tag>
      ),
    },
    {
      title: '明细',
      dataIndex: 'items',
      key: 'items',
      render: (items: any[]) => items.map((i) => `${i.size} × ${i.quantity}`).join(', '),
      ellipsis: true,
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
            title="今日消耗竹丝"
            value={dashboardStats.todayConsumeBundles}
            suffix="捆"
            prefix={<InboxOutlined />}
            valueStyle={{ color: '#fa8c16' }}
          />
          <div style={{ marginTop: 16, color: 'rgba(0, 0, 0, 0.45)', fontSize: 14 }}>
            今日生产竹筷: <span style={{ color: '#52c41a' }}>{dashboardStats.todayProduceBags}</span> 袋
          </div>
        </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
            title="本月收入"
            value={dashboardStats.monthIncome}
            precision={2}
            valueStyle={{ color: '#52c41a' }}
            prefix={<ArrowUpOutlined />}
            suffix="元"
          />
          <div style={{ marginTop: 16, color: 'rgba(0, 0, 0, 0.45)', fontSize: 14 }}>
            本月支出: <span style={{ color: '#ff4d4f' }}>{dashboardStats.monthExpense.toFixed(2)}</span> 元
          </div>
        </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
            title="待付款进货单"
            value={dashboardStats.pendingPurchaseCount}
            valueStyle={{ color: '#faad14' }}
            prefix={<InboxOutlined />}
          />
          <div style={{ marginTop: 16, color: 'rgba(0, 0, 0, 0.45)', fontSize: 14 }}>
            待收款出货单: <span style={{ color: '#faad14' }}>{dashboardStats.pendingSalesCount}</span> 单
          </div>
        </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
            title="低库存规格数"
            value={dashboardStats.lowStockBambooCount + dashboardStats.lowStockChopstickCount}
            valueStyle={{ color: '#ff4d4f' }}
            prefix={<WarningOutlined />}
          />
          <div style={{ marginTop: 16, color: 'rgba(0, 0, 0, 0.45)', fontSize: 14 }}>
            竹丝: {dashboardStats.lowStockBambooCount} · 竹筷: {dashboardStats.lowStockChopstickCount}
          </div>
        </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={24}>
          <Card title="月度生产趋势">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="consume" name="消耗竹丝(捆)" fill="#fa8c16" />
                <Bar dataKey="produce" name="生产竹筷(袋)" fill="#52c41a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="待付款订单" extra={<a href="/purchase/orders">查看全部</a>}>
            <Table
              columns={[
                { title: '订单号', dataIndex: 'orderNo' },
                { title: '供应商', dataIndex: 'supplierName' },
                { title: '总金额', dataIndex: 'totalAmount', render: (v: number) => v.toFixed(2) },
                { title: '状态', dataIndex: 'status', render: (s: string) => (
                  <Tag color={s === 'completed' ? 'green' : s === 'partial' ? 'blue' : 'orange'}>
                    {s === 'completed' ? '已完成' : s === 'partial' ? '部分付款' : '待付款'}
                  </Tag>
                )},
              ]}
              dataSource={pendingPurchaseOrders}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="近期生产记录" extra={<a href="/production/records">查看全部</a>}>
            <Table
              columns={productionColumns}
              dataSource={recentProduction}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
