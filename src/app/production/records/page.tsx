'use client';

import React, { useState } from 'react';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { Button, Modal, Form, Select, DatePicker, Table, InputNumber, Input, message, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ProductionRecord, ProductionItem } from '@/types';
import {
  productionRecords as mockData,
  workers,
  bambooSpecs,
  chopstickSpecs,
} from '@/mock/data';

const typeMap = {
  consume: { text: '消耗竹丝', color: 'orange' },
  produce: { text: '生产竹筷', color: 'green' },
};

export default function ProductionRecordsPage() {
  const [data, setData] = useState<ProductionRecord[]>(mockData);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductionRecord | null>(null);
  const [form] = Form.useForm();
  const [items, setItems] = useState<ProductionItem[]>([]);
  const [recordType, setRecordType] = useState<'consume' | 'produce'>('consume');

  const normalWorkers = workers.filter((w) => w.type === 'normal');

  const columns: ProColumns<ProductionRecord>[] = [
    {
      title: '日期',
      dataIndex: 'date',
      valueType: 'date',
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: '操作人',
      dataIndex: 'workerName',
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: (_, record) => (
        <Tag color={typeMap[record.type].color}>{typeMap[record.type].text}</Tag>
      ),
    },
    {
      title: '明细',
      dataIndex: 'items',
      render: (_, record) =>
        record.items.map((item) => `${item.size} × ${item.quantity}`).join(', '),
      ellipsis: true,
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
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setEditingItem(record);
            setRecordType(record.type);
            setItems([...record.items]);
            form.setFieldsValue({
              ...record,
              date: dayjs(record.date),
            });
            setModalVisible(true);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          style={{ color: '#ff4d4f' }}
          onClick={() => {
            Modal.confirm({
              title: '确认删除',
              content: '确定要删除这条生产记录吗？',
              onOk: () => {
                setData(data.filter((item) => item.id !== record.id));
                message.success('删除成功');
              },
            });
          }}
        >
          删除
        </a>,
      ],
    },
  ];

  const addItem = () => {
    const newItem: ProductionItem = {
      id: Date.now().toString(),
      specId: '',
      size: '',
      quantity: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const updateItem = (index: number, field: keyof ProductionItem, value: any) => {
    const specs = recordType === 'consume' ? bambooSpecs : chopstickSpecs;
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'specId') {
      const spec = specs.find((s) => s.id === value);
      newItems[index].size = spec?.size || '';
    }
    setItems(newItems);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const selectedWorker = normalWorkers.find((w) => w.id === values.workerId);
      const specs = recordType === 'consume' ? bambooSpecs : chopstickSpecs;

      const itemsWithSize = items.map((item) => {
        const spec = specs.find((s) => s.id === item.specId);
        return { ...item, size: spec?.size || item.size };
      });

      if (editingItem) {
        setData(
          data.map((item) =>
            item.id === editingItem.id
              ? {
                  ...item,
                  ...values,
                  date: values.date.format('YYYY-MM-DD'),
                  workerName: selectedWorker?.name || '',
                  type: recordType,
                  items: itemsWithSize,
                }
              : item
          )
        );
        message.success('更新成功');
      } else {
        const newItem: ProductionRecord = {
          id: Date.now().toString(),
          ...values,
          date: values.date.format('YYYY-MM-DD'),
          workerName: selectedWorker?.name || '',
          type: recordType,
          items: itemsWithSize,
          createdAt: new Date().toISOString().split('T')[0],
        };
        setData([...data, newItem]);
        message.success('创建成功');
      }
      setModalVisible(false);
      setEditingItem(null);
      setItems([]);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const specs = recordType === 'consume' ? bambooSpecs : chopstickSpecs;
  const unit = recordType === 'consume' ? '捆' : '袋';

  const itemColumns = [
    {
      title: recordType === 'consume' ? '竹丝规格' : '竹筷规格',
      dataIndex: 'specId',
      render: (_: any, __: any, index: number) => (
        <Select
          style={{ width: 200 }}
          placeholder="请选择"
          value={items[index].specId}
          onChange={(value) => updateItem(index, 'specId', value)}
        >
          {specs.map((spec) => (
            <Select.Option key={spec.id} value={spec.id}>
              {spec.size}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: '尺寸',
      dataIndex: 'size',
      render: (_: any, __: any, index: number) => items[index].size,
    },
    {
      title: `数量（${unit}）`,
      dataIndex: 'quantity',
      render: (_: any, __: any, index: number) => (
        <InputNumber
          min={0}
          value={items[index].quantity}
          onChange={(value) => updateItem(index, 'quantity', value)}
        />
      ),
    },
    {
      title: '操作',
      render: (_: any, __: any, index: number) => (
        <a style={{ color: '#ff4d4f' }} onClick={() => removeItem(index)}>
          删除
        </a>
      ),
    },
  ];

  return (
    <div>
      <ProTable
        headerTitle="生产记录"
        columns={columns}
        dataSource={data}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{ pageSize: 10 }}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingItem(null);
              setRecordType('consume');
              setItems([]);
              form.resetFields();
              form.setFieldsValue({ date: dayjs() });
              setModalVisible(true);
            }}
          >
            新建生产记录
          </Button>,
        ]}
      />

      <Modal
        title={editingItem ? '编辑生产记录' : '新建生产记录'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          setEditingItem(null);
          setItems([]);
          form.resetFields();
        }}
        okText="确定"
        cancelText="取消"
        width={800}
      >
        <Form form={form} layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="生产日期"
              name="date"
              rules={[{ required: true, message: '请选择生产日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              label="操作人"
              name="workerId"
              rules={[{ required: true, message: '请选择操作人' }]}
            >
              <Select placeholder="请选择">
                {normalWorkers.map((w) => (
                  <Select.Option key={w.id} value={w.id}>
                    {w.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          {!editingItem && (
            <Form.Item
              label="类型"
              rules={[{ required: true, message: '请选择类型' }]}
            >
              <Select
                value={recordType}
                onChange={(v) => {
                  setRecordType(v);
                  setItems([]);
                }}
                placeholder="请选择"
              >
                <Select.Option value="consume">消耗竹丝</Select.Option>
                <Select.Option value="produce">生产竹筷</Select.Option>
              </Select>
            </Form.Item>
          )}

          <Button type="dashed" onClick={addItem} icon={<PlusOutlined />} style={{ marginBottom: 16 }}>
            添加明细
          </Button>
          <Table
            columns={itemColumns}
            dataSource={items}
            rowKey="id"
            pagination={false}
            size="small"
          />

          <Form.Item label="备注" name="remark" style={{ marginTop: 16 }}>
            <Input.TextArea rows={3} placeholder="备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
