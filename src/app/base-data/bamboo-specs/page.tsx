'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { Button, Modal, Form, Input, InputNumber, Switch, message, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { BambooSpec } from '@/types';
import {
  getBambooSpecs,
  createBambooSpec,
  updateBambooSpec,
  deleteBambooSpec,
} from '@/app/actions/bambooSpecsActions';

export default function BambooSpecsPage() {
  const [data, setData] = useState<BambooSpec[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<BambooSpec | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getBambooSpecs();
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

  const columns: ProColumns<BambooSpec>[] = [
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
              onOk: async () => {
                try {
                  await deleteBambooSpec(record.id);
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
      const size = formatSize(values.diameter, values.length);
      const { diameter, length, ...restValues } = values;

      if (editingItem) {
        await updateBambooSpec(editingItem.id, { ...restValues, size });
        message.success('更新成功');
      } else {
        await createBambooSpec({
          ...restValues,
          size,
          isActive: restValues.isActive ?? true,
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
        headerTitle="竹丝规格管理"
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
            新增规格
          </Button>,
        ]}
      />

      <Modal
        title={editingItem ? '编辑竹丝规格' : '新增竹丝规格'}
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
                <InputNumber min={0} placeholder="直径" style={{ width: 120 }} />
              </Form.Item>
              <span>mm ×</span>
              <Form.Item
                name="length"
                noStyle
                rules={[{ required: true, message: '请输入长度' }]}
              >
                <InputNumber min={0} placeholder="长度" style={{ width: 120 }} />
              </Form.Item>
              <span>mm</span>
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
