'use client';

import React, { useState } from 'react';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { Button, Modal, Form, Input, InputNumber, Switch, message, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ChopstickSpec } from '@/types';
import { chopstickSpecs as mockData } from '@/mock/data';

export default function ChopstickSpecsPage() {
  const [data, setData] = useState<ChopstickSpec[]>(mockData);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ChopstickSpec | null>(null);
  const [form] = Form.useForm();

  const parseSize = (size: string) => {
    const match = size.match(/(\d+(?:\.\d+)?)\s*mm\s*\*\s*(\d+(?:\.\d+)?)\s*mm/i);
    if (match) {
      return { diameter: parseFloat(match[1]), length: parseFloat(match[2]) };
    }
    return { diameter: undefined, length: undefined };
  };

  const formatSize = (diameter: number, length: number) => {
    return `${diameter}mm*${length}mm`;
  };

  const columns: ProColumns<ChopstickSpec>[] = [
    {
      title: '尺寸',
      dataIndex: 'size',
    },
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '是否启用',
      dataIndex: 'isActive',
      valueType: 'select',
      valueEnum: {
        true: { text: '启用', status: 'Success' },
        false: { text: '禁用', status: 'Default' },
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'date',
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setEditingItem(record);
            const { diameter, length } = parseSize(record.size);
            form.setFieldsValue({
              ...record,
              diameter,
              length,
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
              content: `确定要删除规格 "${record.size}" 吗？`,
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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const size = formatSize(values.diameter, values.length);
      const { diameter, length, ...restValues } = values;

      if (editingItem) {
        setData(
          data.map((item) =>
            item.id === editingItem.id
              ? { ...item, ...restValues, size, updatedAt: new Date().toISOString().split('T')[0] }
              : item
          )
        );
        message.success('更新成功');
      } else {
        const newItem: ChopstickSpec = {
          id: Date.now().toString(),
          ...restValues,
          size,
          isActive: restValues.isActive ?? true,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        };
        setData([...data, newItem]);
        message.success('创建成功');
      }
      setModalVisible(false);
      setEditingItem(null);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <div>
      <ProTable
        headerTitle="竹筷规格管理"
        columns={columns}
        dataSource={data}
        rowKey="id"
        search={false}
        pagination={{ pageSize: 10 }}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingItem(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新增规格
          </Button>,
        ]}
      />

      <Modal
        title={editingItem ? '编辑竹筷规格' : '新增竹筷规格'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          setEditingItem(null);
          form.resetFields();
        }}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="尺寸">
            <Space>
              <Form.Item
                name="diameter"
                noStyle
                rules={[{ required: true, message: '请输入直径' }]}
              >
                <InputNumber min={0} placeholder="直径" addonAfter="mm" style={{ width: 150 }} />
              </Form.Item>
              <span>×</span>
              <Form.Item
                name="length"
                noStyle
                rules={[{ required: true, message: '请输入长度' }]}
              >
                <InputNumber min={0} placeholder="长度" addonAfter="mm" style={{ width: 150 }} />
              </Form.Item>
            </Space>
          </Form.Item>
          <Form.Item label="名称" name="name">
            <Input placeholder="规格名称（可选）" />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} placeholder="备注信息" />
          </Form.Item>
          <Form.Item label="是否启用" name="isActive" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
