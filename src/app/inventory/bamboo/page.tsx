'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { Button, Modal, Form, Select, InputNumber, Input, message, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { BambooInventory, BambooSpec } from '@/types';
import { getBambooInventory, adjustBambooInventory } from '@/app/actions/inventoryActions';
import { getBambooSpecs } from '@/app/actions/bambooSpecsActions';

const LOW_STOCK_THRESHOLD = 50;

export default function BambooInventoryPage() {
  const [data, setData] = useState<BambooInventory[]>([]);
  const [bambooSpecs, setBambooSpecs] = useState<BambooSpec[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [inventory, specs] = await Promise.all([
        getBambooInventory(),
        getBambooSpecs(),
      ]);
      setData(inventory);
      setBambooSpecs(specs);
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

  const columns: ProColumns<BambooInventory>[] = [
    {
      title: '竹丝规格',
      dataIndex: 'size',
    },
    {
      title: '当前库存（捆）',
      dataIndex: 'quantity',
      render: (_, record) => (
        <span style={{ color: record.quantity < LOW_STOCK_THRESHOLD ? '#ff4d4f' : undefined, fontWeight: 'bold' }}>
          {record.quantity}
          {record.quantity < LOW_STOCK_THRESHOLD && <Tag color="red" style={{ marginLeft: 8 }}>低库存</Tag>}
        </span>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="adjust"
          onClick={() => {
            form.setFieldsValue({ bambooSpecId: record.bambooSpecId, size: record.size });
            setModalVisible(true);
          }}
        >
          库存调整
        </a>,
      ],
    },
  ];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await adjustBambooInventory(values.bambooSpecId, values.adjustQuantity || 0);
      message.success('库存调整成功');
      setModalVisible(false);
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
        headerTitle="竹丝库存"
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        search={false}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="库存调整"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="竹丝规格" name="bambooSpecId">
            <Select placeholder="请选择" disabled>
              {bambooSpecs.map((spec) => (
                <Select.Option key={spec.id} value={spec.id}>
                  {spec.size}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="调整数量"
            name="adjustQuantity"
            rules={[{ required: true, message: '请输入调整数量' }]}
            extra="正数增加，负数减少"
          >
            <InputNumber style={{ width: '100%' }} placeholder="请输入调整数量" />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} placeholder="备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
