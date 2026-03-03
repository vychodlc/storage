'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { Button, Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { BOM, BambooSpec, ChopstickSpec } from '@/types';
import {
  getBOMList,
  createBOM,
  updateBOM,
  deleteBOM,
} from '@/app/actions/bomActions';
import { getBambooSpecs } from '@/app/actions/bambooSpecsActions';
import { getChopstickSpecs } from '@/app/actions/chopstickSpecsActions';

export default function BOMPage() {
  const [data, setData] = useState<BOM[]>([]);
  const [bambooSpecs, setBambooSpecs] = useState<BambooSpec[]>([]);
  const [chopstickSpecs, setChopstickSpecs] = useState<ChopstickSpec[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<BOM | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [bomList, bambooList, chopstickList] = await Promise.all([
        getBOMList(),
        getBambooSpecs(),
        getChopstickSpecs(),
      ]);
      setData(bomList);
      setBambooSpecs(bambooList);
      setChopstickSpecs(chopstickList);
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
              content: '确定要删除这条BOM对应关系吗？',
              onOk: async () => {
                try {
                  await deleteBOM(record.id);
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
      const selectedBamboo = bambooSpecs.find((s) => s.id === values.bambooSpecId);
      const selectedChopstick = chopstickSpecs.find((s) => s.id === values.chopstickSpecId);

      const submitData = {
        ...values,
        bambooSpecSize: selectedBamboo?.size || '',
        chopstickSpecSize: selectedChopstick?.size || '',
      };

      if (editingItem) {
        await updateBOM(editingItem.id, submitData);
        message.success('更新成功');
      } else {
        await createBOM(submitData);
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
        headerTitle="BOM对应关系管理"
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
