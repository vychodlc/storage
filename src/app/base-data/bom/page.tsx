'use client';

import React, { useState } from 'react';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { Button, Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { BOM } from '@/types';
import { bomList as mockData, bambooSpecs, chopstickSpecs } from '@/mock/data';

export default function BOMPage() {
  const [data, setData] = useState<BOM[]>(mockData);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<BOM | null>(null);
  const [form] = Form.useForm();

  const columns: ProColumns<BOM>[] = [
    {
      title: '竹筷规格',
      dataIndex: 'chopstickSpecSize',
    },
    {
      title: '竹丝规格',
      dataIndex: 'bambooSpecSize',
    },
    {
      title: '每袋耗丝量（捆）',
      dataIndex: 'bundlesPerBag',
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
            form.setFieldsValue(record);
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
              content: '确定要删除这条BOM对应关系吗？',
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
      const selectedBamboo = bambooSpecs.find((s) => s.id === values.bambooSpecId);
      const selectedChopstick = chopstickSpecs.find((s) => s.id === values.chopstickSpecId);

      if (editingItem) {
        setData(
          data.map((item) =>
            item.id === editingItem.id
              ? {
                  ...item,
                  ...values,
                  bambooSpecSize: selectedBamboo?.size || '',
                  chopstickSpecSize: selectedChopstick?.size || '',
                  updatedAt: new Date().toISOString().split('T')[0],
                }
              : item
          )
        );
        message.success('更新成功');
      } else {
        const newItem: BOM = {
          id: Date.now().toString(),
          ...values,
          bambooSpecSize: selectedBamboo?.size || '',
          chopstickSpecSize: selectedChopstick?.size || '',
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
        headerTitle="BOM对应关系管理"
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
            新增BOM
          </Button>,
        ]}
      />

      <Modal
        title={editingItem ? '编辑BOM对应关系' : '新增BOM对应关系'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          setEditingItem(null);
          form.resetFields();
        }}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="竹筷规格"
            name="chopstickSpecId"
            rules={[{ required: true, message: '请选择竹筷规格' }]}
          >
            <Select placeholder="请选择竹筷规格">
              {chopstickSpecs.map((spec) => (
                <Select.Option key={spec.id} value={spec.id}>
                  {spec.size} {spec.name ? `- ${spec.name}` : ''}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="竹丝规格"
            name="bambooSpecId"
            rules={[{ required: true, message: '请选择竹丝规格' }]}
          >
            <Select placeholder="请选择竹丝规格">
              {bambooSpecs.map((spec) => (
                <Select.Option key={spec.id} value={spec.id}>
                  {spec.size} {spec.name ? `- ${spec.name}` : ''}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="每袋耗丝量（捆）"
            name="bundlesPerBag"
            rules={[{ required: true, message: '请输入每袋耗丝量' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入" />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} placeholder="备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
