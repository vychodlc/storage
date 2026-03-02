'use client';

import React, { useMemo, useState } from 'react';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { Card, Row, Col, Statistic, Tag, Button, DatePicker } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Transaction } from '@/types';
import { transactions as mockData } from '@/mock/data';

const typeMap: Record<string, { text: string; color: string }> = {
  purchase: { text: '进货订单', color: 'blue' },
  sales: { text: '出货订单', color: 'green' },
  wage: { text: '工人工资', color: 'orange' },
  temporary_wage: { text: '临时工工资', color: 'purple' },
  driver_fee: { text: '出货司机费用', color: 'cyan' },
};

export default function TransactionsPage() {
  const [data, setData] = useState<Transaction[]>(mockData);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [directionFilter, setDirectionFilter] = useState<string | undefined>();

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (dateRange) {
        const date = dayjs(item.date);
        if (date.isBefore(dateRange[0], 'day') || date.isAfter(dateRange[1], 'day')) {
          return false;
        }
      }
      if (typeFilter && item.type !== typeFilter) {
        return false;
      }
      if (directionFilter && item.direction !== directionFilter) {
        return false;
      }
      return true;
    });
  }, [data, dateRange, typeFilter, directionFilter]);

  const stats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    filteredData.forEach((item) => {
      if (item.direction === 'in') {
        totalIncome += item.amount;
      } else {
        totalExpense += item.amount;
      }
    });
    return {
      totalIncome,
      totalExpense,
      netIncome: totalIncome - totalExpense,
    };
  }, [filteredData]);

  const columns: ProColumns<Transaction>[] = [
    {
      title: '日期',
      dataIndex: 'date',
      valueType: 'date',
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: '类型',
      dataIndex: 'type',
      valueType: 'select',
      valueEnum: Object.keys(typeMap).reduce((acc, key) => {
        acc[key] = { text: typeMap[key].text };
        return acc;
      }, {} as any),
      render: (_, record) => (
        <Tag color={typeMap[record.type]?.color || 'default'}>
          {typeMap[record.type]?.text || record.type}
        </Tag>
      ),
    },
    {
      title: '关联单号',
      dataIndex: 'referenceNo',
    },
    {
      title: '收支方向',
      dataIndex: 'direction',
      valueType: 'select',
      valueEnum: {
        in: { text: '收入' },
        out: { text: '支出' },
      },
      render: (_, record) => (
        <span style={{ color: record.direction === 'in' ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
          {record.direction === 'in' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {' '}{record.direction === 'in' ? '收入' : '支出'}
        </span>
      ),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      valueType: 'money',
      sorter: (a, b) => a.amount - b.amount,
      render: (_, record) => (
        <span style={{ color: record.direction === 'in' ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
          {record.direction === 'in' ? '+' : '-'}{record.amount.toFixed(2)}
        </span>
      ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总收入"
              value={stats.totalIncome}
              precision={2}
              valueStyle={{ color: '#52c41a' }}
              prefix={<ArrowUpOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="总支出"
              value={stats.totalExpense}
              precision={2}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ArrowDownOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="净收入"
              value={stats.netIncome}
              precision={2}
              valueStyle={{ color: stats.netIncome >= 0 ? '#52c41a' : '#ff4d4f' }}
              suffix="元"
            />
          </Card>
        </Col>
      </Row>

      <ProTable
        headerTitle="流水总表"
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{ pageSize: 20 }}
        toolBarRender={() => [
          <DatePicker.RangePicker
            key="date"
            value={dateRange}
            onChange={(dates) => setDateRange(dates as any)}
            placeholder={['开始日期', '结束日期']}
          />,
          <Button
            key="export"
            icon={<DownloadOutlined />}
            onClick={() => {
              alert('导出功能开发中...');
            }}
          >
            导出
          </Button>,
        ]}
      />
    </div>
  );
}
