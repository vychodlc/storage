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
  message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, WarningOutlined } from '@ant-design/icons';
import { ProTable, ProCard } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { inventoryItems } from '@/mock/data';
import type { Inventory } from '@/types';

const { Option } = Select;

const categories = ['电子元器件', '结构件', '紧固件', '线缆', '其他'];
const warehouses = ['A仓库', 'B仓库', 'C仓库'];

export default function InventoryPage() {
  const [data, setData] = useState<Inventory[]>(inventoryItems);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Inventory) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个库存项吗？',
      onOk: () => {
        setData(data.filter(item => item.id !== id));
        message.success('删除成功');
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingId) {
        setData(data.map(item =>
          item.id === editingId
            ? {
                ...item,
                ...values,
                lastUpdated: new Date().toLocaleString('zh-CN'),
              }
            : item
        ));
        message.success('更新成功');
      } else {
        const newItem: Inventory = {
          ...values,
          id: String(Date.now()),
          lastUpdated: new Date().toLocaleString('zh-CN'),
        };
        setData([...data, newItem]);
        message.success('添加成功');
      }
      setModalVisible(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const columns: ProColumns<Inventory>[] = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      valueType: 'select',
      valueEnum: categories.reduce((acc, cat) => ({ ...acc, [cat]: cat }), {}),
    },
    {
      title: '库存数量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: Inventory) => (
        <Space>
          <span>{quantity}</span>
          <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>{record.unit}</span>
          {quantity <= record.minStock && (
            <Tag color="warning" icon={<WarningOutlined />}>
              低库存
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '最小库存',
      dataIndex: 'minStock',
      key: 'minStock',
      hideInSearch: true,
    },
    {
      title: '仓库',
      dataIndex: 'warehouse',
      key: 'warehouse',
      valueType: 'select',
      valueEnum: warehouses.reduce((acc, wh) => ({ ...acc, [wh]: wh }), {}),
    },
    {
      title: '库位',
      dataIndex: 'location',
      key: 'location',
      hideInSearch: true,
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      hideInSearch: true,
      valueType: 'dateTime',
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
      <ProTable<Inventory>
        columns={columns}
        dataSource={data}
        rowKey="id"
        headerTitle="库存管理"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Button type="primary" key="add" icon={<PlusOutlined />} onClick={handleAdd}>
            新建库存
          </Button>,
        ]}
        pagination={{
          pageSize: 10,
        }}
      />

      <Modal
        title={editingId ? '编辑库存' : '新建库存'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="sku"
            label="SKU"
            rules={[{ required: true, message: '请输入SKU' }]}
          >
            <Input placeholder="请输入SKU" />
          </Form.Item>

          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="请输入名称" />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              {categories.map(cat => (
                <Option key={cat} value={cat}>
                  {cat}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="库存数量"
            rules={[{ required: true, message: '请输入库存数量' }]}
          >
            <InputNumber min={0} placeholder="请输入库存数量" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="unit"
            label="单位"
            rules={[{ required: true, message: '请输入单位' }]}
          >
            <Input placeholder="例如: 个、块、套、米" />
          </Form.Item>

          <Form.Item
            name="minStock"
            label="最小库存预警"
            rules={[{ required: true, message: '请输入最小库存' }]}
          >
            <InputNumber min={0} placeholder="请输入最小库存" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="warehouse"
            label="仓库"
            rules={[{ required: true, message: '请选择仓库' }]}
          >
            <Select placeholder="请选择仓库">
              {warehouses.map(wh => (
                <Option key={wh} value={wh}>
                  {wh}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="location"
            label="库位"
            rules={[{ required: true, message: '请输入库位' }]}
          >
            <Input placeholder="例如: A-01-01" />
          </Form.Item>
        </Form>
      </Modal>
    </ProCard>
  );
}
