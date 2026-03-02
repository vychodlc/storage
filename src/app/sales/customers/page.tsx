'use client';

import React, { useState } from 'react';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { Button, Modal, Form, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { Customer } from '@/types';
import { customers as mockData } from '@/mock/data';

export default function CustomersPage() {
  const [data, setData] = useState<Customer[]>(mockData);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Customer | null>(null);
  const [form] = Form.useForm();

  const columns: ProColumns<Customer>[] = [
    {
      title: '客户名称',
      dataIndex: 'name',
    },
    {
      title: '负责人',
      dataIndex: 'contactPerson',
    },
    {
      title: '联系方式',
      dataIndex: 'contact',
    },
    {
      title: '地点',
      dataIndex: 'address',
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
              content: `确定要删除客户 "${record.name}" 吗？`,
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
      if (editingItem) {
        setData(
          data.map((item) =>
            item.id === editingItem.id
              ? { ...item, ...values, updatedAt: new Date().toISOString().split('T')[0] }
              : item
          )
        );
        message.success('更新成功');
      } else {
        const newItem: Customer = {
          id: Date.now().toString(),
          ...values,
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
        headerTitle="客户管理"
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
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新增客户
          </Button>,
        ]}
      />

      <Modal
        title={editingItem ? '编辑客户' : '新增客户'}
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
            label="客户名称"
            name="name"
            rules={[{ required: true, message: '请输入客户名称' }]}
          >
            <Input placeholder="请输入客户名称" />
          </Form.Item>
          <Form.Item label="负责人" name="contactPerson">
            <Input placeholder="负责人" />
          </Form.Item>
          <Form.Item label="联系方式" name="contact">
            <Input placeholder="联系方式" />
          </Form.Item>
          <Form.Item label="地点" name="address">
            <Input placeholder="地点" />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} placeholder="备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
