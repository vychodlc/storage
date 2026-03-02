'use client';

import React, { useState } from 'react';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { Button, Modal, Form, Select, DatePicker, InputNumber, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { TemporaryWorkRecord } from '@/types';
import { temporaryWorkRecords as mockData, workers } from '@/mock/data';

const temporaryWorkers = workers.filter((w) => w.type === 'temporary');

const workTypes = ['卸货', '上货', '其他'];

export default function TemporaryRecordsPage() {
  const [data, setData] = useState<TemporaryWorkRecord[]>(mockData);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<TemporaryWorkRecord | null>(null);
  const [form] = Form.useForm();

  const columns: ProColumns<TemporaryWorkRecord>[] = [
    {
      title: '工作日期',
      dataIndex: 'workDate',
      valueType: 'date',
      sorter: (a, b) => new Date(a.workDate).getTime() - new Date(b.workDate).getTime(),
    },
    {
      title: '临时工',
      dataIndex: 'workerName',
    },
    {
      title: '工作类型',
      dataIndex: 'workType',
    },
    {
      title: '工资',
      dataIndex: 'wage',
      valueType: 'money',
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
            form.setFieldsValue({
              ...record,
              workDate: dayjs(record.workDate),
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
              content: '确定要删除这条工作记录吗？',
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
      const selectedWorker = temporaryWorkers.find((w) => w.id === values.workerId);

      if (editingItem) {
        setData(
          data.map((item) =>
            item.id === editingItem.id
              ? {
                  ...item,
                  ...values,
                  workDate: values.workDate.format('YYYY-MM-DD'),
                  workerName: selectedWorker?.name || '',
                }
              : item
          )
        );
        message.success('更新成功');
      } else {
        const newItem: TemporaryWorkRecord = {
          id: Date.now().toString(),
          ...values,
          workDate: values.workDate.format('YYYY-MM-DD'),
          workerName: selectedWorker?.name || '',
          createdAt: new Date().toISOString().split('T')[0],
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
        headerTitle="临时工工作记录"
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
              form.setFieldsValue({ workDate: dayjs() });
              setModalVisible(true);
            }}
          >
            新建记录
          </Button>,
        ]}
      />

      <Modal
        title={editingItem ? '编辑工作记录' : '新建工作记录'}
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
            label="工作日期"
            name="workDate"
            rules={[{ required: true, message: '请选择工作日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="临时工"
            name="workerId"
            rules={[{ required: true, message: '请选择临时工' }]}
          >
            <Select placeholder="请选择">
              {temporaryWorkers.map((w) => (
                <Select.Option key={w.id} value={w.id}>
                  {w.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="工作类型"
            name="workType"
            rules={[{ required: true, message: '请选择工作类型' }]}
          >
            <Select placeholder="请选择">
              {workTypes.map((t) => (
                <Select.Option key={t} value={t}>
                  {t}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="工资"
            name="wage"
            rules={[{ required: true, message: '请输入工资' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="工资" />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} placeholder="备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
