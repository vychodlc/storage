'use client';

import React, { useState } from 'react';
import {
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Card,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { ProTable, ProCard } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import dayjs from 'dayjs';
import { equipmentList } from '@/mock/data';
import type { Equipment } from '@/types';

const { Option } = Select;

const STATUS_COLORS: Record<string, string> = {
  running: 'green',
  maintenance: 'orange',
  idle: 'blue',
  fault: 'red',
};

const STATUS_MAP: Record<string, string> = {
  running: '运行中',
  maintenance: '维护中',
  idle: '空闲',
  fault: '故障',
};

const EQUIPMENT_TYPES = ['加工设备', '电子设备', '成型设备', '检测设备', '机器人', '其他'];
const LOCATIONS = ['生产车间A', '生产车间B', '生产车间C', '质检区', '仓库'];

export default function EquipmentPage() {
  const [data, setData] = useState<Equipment[]>(equipmentList);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const stats = {
    total: data.length,
    running: data.filter(e => e.status === 'running').length,
    maintenance: data.filter(e => e.status === 'maintenance').length,
    fault: data.filter(e => e.status === 'fault').length,
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Equipment) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      lastMaintenance: dayjs(record.lastMaintenance),
      nextMaintenance: dayjs(record.nextMaintenance),
    });
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个设备吗？',
      onOk: () => {
        setData(data.filter(item => item.id !== id));
        message.success('删除成功');
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        lastMaintenance: values.lastMaintenance.format('YYYY-MM-DD'),
        nextMaintenance: values.nextMaintenance.format('YYYY-MM-DD'),
      };

      if (editingId) {
        setData(data.map(item =>
          item.id === editingId ? { ...item, ...formattedValues } : item
        ));
        message.success('更新成功');
      } else {
        const newItem: Equipment = {
          ...formattedValues,
          id: String(Date.now()),
        };
        setData([...data, newItem]);
        message.success('添加成功');
      }
      setModalVisible(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const columns: ProColumns<Equipment>[] = [
    {
      title: '设备编号',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      valueType: 'select',
      valueEnum: EQUIPMENT_TYPES.reduce((acc, t) => ({ ...acc, [t]: t }), {}),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={STATUS_COLORS[status]}>{STATUS_MAP[status]}</Tag>
      ),
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      valueType: 'select',
      valueEnum: LOCATIONS.reduce((acc, l) => ({ ...acc, [l]: l }), {}),
    },
    {
      title: '上次维护',
      dataIndex: 'lastMaintenance',
      key: 'lastMaintenance',
      valueType: 'date',
      hideInSearch: true,
    },
    {
      title: '下次维护',
      dataIndex: 'nextMaintenance',
      key: 'nextMaintenance',
      valueType: 'date',
      hideInSearch: true,
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
      hideInSearch: true,
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
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="设备总数"
              value={stats.total}
              prefix={<ToolOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="运行中"
              value={stats.running}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="维护中"
              value={stats.maintenance}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="故障"
              value={stats.fault}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <ProTable<Equipment>
          columns={columns}
          dataSource={data}
          rowKey="id"
          headerTitle="设备管理"
          search={{
            labelWidth: 'auto',
          }}
          toolBarRender={() => [
            <Button type="primary" key="add" icon={<PlusOutlined />} onClick={handleAdd}>
              新建设备
            </Button>,
          ]}
          pagination={{
            pageSize: 10,
          }}
        />
      </div>

      <Modal
        title={editingId ? '编辑设备' : '新建设备'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="code"
            label="设备编号"
            rules={[{ required: true, message: '请输入设备编号' }]}
          >
            <Input placeholder="例如: EQ-001" />
          </Form.Item>

          <Form.Item
            name="name"
            label="设备名称"
            rules={[{ required: true, message: '请输入设备名称' }]}
          >
            <Input placeholder="请输入设备名称" />
          </Form.Item>

          <Form.Item
            name="type"
            label="设备类型"
            rules={[{ required: true, message: '请选择设备类型' }]}
          >
            <Select placeholder="请选择设备类型">
              {EQUIPMENT_TYPES.map(type => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              {Object.entries(STATUS_MAP).map(([key, label]) => (
                <Option key={key} value={key}>
                  {label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="location"
            label="位置"
            rules={[{ required: true, message: '请选择位置' }]}
          >
            <Select placeholder="请选择位置">
              {LOCATIONS.map(loc => (
                <Option key={loc} value={loc}>
                  {loc}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="lastMaintenance"
            label="上次维护日期"
            rules={[{ required: true, message: '请选择上次维护日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="nextMaintenance"
            label="下次维护日期"
            rules={[{ required: true, message: '请选择下次维护日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="operator"
            label="操作员"
            rules={[{ required: true, message: '请输入操作员' }]}
          >
            <Input placeholder="请输入操作员姓名" />
          </Form.Item>
        </Form>
      </Modal>
    </ProCard>
  );
}
