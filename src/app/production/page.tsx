'use client';

import React, { useState } from 'react';
import {
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Progress,
  message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ProTable, ProCard } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import dayjs from 'dayjs';
import { productionPlans } from '@/mock/data';
import type { ProductionPlan } from '@/types';

const { Option } = Select;

const STATUS_COLORS: Record<string, string> = {
  pending: 'orange',
  in_progress: 'blue',
  completed: 'green',
  cancelled: 'red',
};

const STATUS_MAP: Record<string, string> = {
  pending: '待生产',
  in_progress: '生产中',
  completed: '已完成',
  cancelled: '已取消',
};

const PRIORITY_MAP: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'green',
  medium: 'orange',
  high: 'red',
};

export default function ProductionPage() {
  const [data, setData] = useState<ProductionPlan[]>(productionPlans);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: ProductionPlan) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      startDate: dayjs(record.startDate),
      endDate: dayjs(record.endDate),
    });
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个生产计划吗？',
      onOk: () => {
        setData(data.filter(item => item.id !== id));
        message.success('删除成功');
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
      };

      if (editingId) {
        setData(data.map(item =>
          item.id === editingId ? { ...item, ...formattedValues } : item
        ));
        message.success('更新成功');
      } else {
        const newItem: ProductionPlan = {
          ...formattedValues,
          id: String(Date.now()),
          progress: formattedValues.status === 'completed' ? 100 : 0,
        };
        setData([...data, newItem]);
        message.success('添加成功');
      }
      setModalVisible(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const columns: ProColumns<ProductionPlan>[] = [
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
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={PRIORITY_COLORS[priority]}>{PRIORITY_MAP[priority]}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={STATUS_COLORS[status]}>{STATUS_MAP[status]}</Tag>
      ),
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => <Progress percent={progress} size="small" />,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <ProCard>
      <ProTable<ProductionPlan>
        columns={columns}
        dataSource={data}
        rowKey="id"
        headerTitle="生产计划"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Button type="primary" key="add" icon={<PlusOutlined />} onClick={handleAdd}>
            新建计划
          </Button>,
        ]}
        pagination={{
          pageSize: 10,
        }}
      />

      <Modal
        title={editingId ? '编辑生产计划' : '新建生产计划'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="orderNo"
            label="订单号"
            rules={[{ required: true, message: '请输入订单号' }]}
          >
            <Input placeholder="请输入订单号" />
          </Form.Item>

          <Form.Item
            name="productName"
            label="产品名称"
            rules={[{ required: true, message: '请输入产品名称' }]}
          >
            <Input placeholder="请输入产品名称" />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="数量"
            rules={[{ required: true, message: '请输入数量' }]}
          >
            <InputNumber min={1} placeholder="请输入数量" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select placeholder="请选择优先级">
              <Option value="low">低</Option>
              <Option value="medium">中</Option>
              <Option value="high">高</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="pending">待生产</Option>
              <Option value="in_progress">生产中</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="startDate"
            label="开始日期"
            rules={[{ required: true, message: '请选择开始日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="结束日期"
            rules={[{ required: true, message: '请选择结束日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          {editingId && (
            <Form.Item
              name="progress"
              label="进度 (%)"
              rules={[{ required: true, message: '请输入进度' }]}
            >
              <InputNumber min={0} max={100} placeholder="请输入进度" style={{ width: '100%' }} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </ProCard>
  );
}
