'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { Button, Modal, Form, Input, Switch, message, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { InboundDriver } from '@/types';
import {
  getInboundDrivers,
  createInboundDriver,
  updateInboundDriver,
  deleteInboundDriver,
} from '@/app/actions/inboundDriversActions';

export default function InboundDriversPage() {
  const [data, setData] = useState<InboundDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<InboundDriver | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getInboundDrivers();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: ProColumns<InboundDriver>[] = [
    {
      title: '司机姓名',
      dataIndex: 'name',
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
    },
    {
      title: '是否物流',
      dataIndex: 'isLogistics',
      render: (_, record) => (
        <Tag color={record.isLogistics ? 'blue' : 'green'}>
          {record.isLogistics ? '物流' : '个人'}
        </Tag>
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
              content: `确定要删除司机 "${record.name}" 吗？`,
              onOk: async () => {
                try {
                  await deleteInboundDriver(record.id);
                  message.success('删除成功');
                  fetchData();
                } catch (error) {
                  console.error('Failed to delete:', error);
                  message.error('删除失败');
                }
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
        await updateInboundDriver(editingItem.id, values);
        message.success('更新成功');
      } else {
        await createInboundDriver({
          ...values,
          isLogistics: values.isLogistics ?? false,
        });
        message.success('创建成功');
      }
      setModalVisible(false);
      setEditingItem(null);
      form.resetFields();
      fetchData();
    } catch (error) {
      console.error('Submission failed:', error);
      message.error('操作失败');
    }
  };

  return (
    <div>
      <ProTable
        headerTitle="进货司机管理"
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
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
            新增司机
          </Button>,
        ]}
      />

      <Modal
        title={editingItem ? '编辑进货司机' : '新增进货司机'}
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
          <Form.Item
            label="司机姓名"
            name="name"
            rules={[{ required: true, message: '请输入司机姓名' }]}
          >
            <Input placeholder="请输入司机姓名" />
          </Form.Item>
          <Form.Item label="联系方式" name="phone">
            <Input placeholder="联系方式" />
          </Form.Item>
          <Form.Item label="是否物流" name="isLogistics" valuePropName="checked" initialValue={false}>
            <Switch />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} placeholder="备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
