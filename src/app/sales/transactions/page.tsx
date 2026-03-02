'use client';

import React, { useMemo } from 'react';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { Button, Tag } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { transactions } from '@/mock/data';

export default function SalesTransactionsPage() {
  const data = useMemo(() => {
    return transactions.filter((t) => t.type === 'sales' || t.type === 'driver_fee');
  }, []);

  const columns: ProColumns<any>[] = [
    {
      title: '日期',
      dataIndex: 'date',
      valueType: 'date',
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: (_, record) => {
        if (record.type === 'sales') {
          return <Tag color="green">销售</Tag>;
        }
        return <Tag color="orange">司机费用</Tag>;
      },
    },
    {
      title: '关联单号',
      dataIndex: 'referenceNo',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      valueType: 'money',
      render: (_, record) => (
        <span style={{ color: record.direction === 'in' ? '#52c41a' : '#ff4d4f' }}>
          {record.direction === 'in' ? '+' : '-'} {record.amount?.toFixed(2)}
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
    },
  ];

  return (
    <div>
      <ProTable
        headerTitle="出货流水记录"
        columns={columns}
        dataSource={data}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{ pageSize: 20 }}
        toolBarRender={() => [
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
