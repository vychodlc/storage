'use client';

import React, { useState, useMemo } from 'react';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Table,
  InputNumber,
  message,
  Tag,
  Drawer,
  Divider,
} from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { SalesOrder, SalesItem, Payment } from '@/types';
import { salesOrders as mockData, customers, chopstickSpecs } from '@/mock/data';

const statusMap = {
  shipped: { text: '已发货', color: 'orange' },
  partial: { text: '部分付款', color: 'blue' },
  completed: { text: '已完成', color: 'green' },
};

export default function SalesOrdersPage() {
  const [data, setData] = useState<SalesOrder[]>(mockData);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<SalesOrder | null>(null);
  const [viewingItem, setViewingItem] = useState<SalesOrder | null>(null);
  const [form] = Form.useForm();
  const [items, setItems] = useState<SalesItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const columns: ProColumns<SalesOrder>[] = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
    },
    {
      title: '单据日期',
      dataIndex: 'orderDate',
      valueType: 'date',
    },
    {
      title: '客户',
      dataIndex: 'customerName',
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      valueType: 'money',
    },
    {
      title: '已付金额',
      dataIndex: 'paidAmount',
      valueType: 'money',
    },
    {
      title: '司机费用',
      dataIndex: 'driverFee',
      valueType: 'money',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (_, record) => (
        <Tag color={statusMap[record.status].color}>{statusMap[record.status].text}</Tag>
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
      valueType: 'date',
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="view"
          onClick={() => {
            setViewingItem(record);
            setDrawerVisible(true);
          }}
        >
          查看
        </a>,
        <a
          key="edit"
          onClick={() => {
            setEditingItem(record);
            setItems([...record.items]);
            setPayments([...record.payments]);
            form.setFieldsValue({
              ...record,
              orderDate: dayjs(record.orderDate),
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
              content: `确定要删除出货单 "${record.orderNo}" 吗？`,
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

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [items]);

  const paidAmount = useMemo(() => {
    return payments.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [payments]);

  const addItem = () => {
    const newItem: SalesItem = {
      id: Date.now().toString(),
      chopstickSpecId: '',
      size: '',
      bags: 0,
      unitPrice: 0,
      amount: 0,
      remark: '',
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const updateItem = (index: number, field: keyof SalesItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'bags' || field === 'unitPrice') {
      newItems[index].amount = (newItems[index].bags || 0) * (newItems[index].unitPrice || 0);
    }
    if (field === 'chopstickSpecId') {
      const spec = chopstickSpecs.find((s) => s.id === value);
      newItems[index].size = spec?.size || '';
    }
    setItems(newItems);
  };

  const addPayment = () => {
    const newPayment: Payment = {
      id: Date.now().toString(),
      orderId: '',
      orderType: 'sales',
      amount: 0,
      paymentDate: dayjs().format('YYYY-MM-DD'),
      remark: '',
      createdAt: dayjs().format('YYYY-MM-DD'),
    };
    setPayments([...payments, newPayment]);
  };

  const removePayment = (index: number) => {
    const newPayments = [...payments];
    newPayments.splice(index, 1);
    setPayments(newPayments);
  };

  const updatePayment = (index: number, field: keyof Payment, value: any) => {
    const newPayments = [...payments];
    newPayments[index] = { ...newPayments[index], [field]: value };
    setPayments(newPayments);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const selectedCustomer = customers.find((c) => c.id === values.customerId);

      let status: 'shipped' | 'partial' | 'completed' = 'shipped';
      if (paidAmount > 0 && paidAmount < totalAmount) {
        status = 'partial';
      } else if (paidAmount >= totalAmount && totalAmount > 0) {
        status = 'completed';
      }

      if (editingItem) {
        setData(
          data.map((item) =>
            item.id === editingItem.id
              ? {
                  ...item,
                  ...values,
                  orderDate: values.orderDate.format('YYYY-MM-DD'),
                  customerName: selectedCustomer?.name || '',
                  items,
                  payments,
                  totalAmount,
                  paidAmount,
                  status,
                  driverFee: values.driverFee || 0,
                  updatedAt: new Date().toISOString().split('T')[0],
                }
              : item
          )
        );
        message.success('更新成功');
      } else {
        const newItem: SalesOrder = {
          id: Date.now().toString(),
          orderNo: `SO${dayjs().format('YYYYMM')}${String(data.length + 1).padStart(3, '0')}`,
          ...values,
          orderDate: values.orderDate.format('YYYY-MM-DD'),
          customerName: selectedCustomer?.name || '',
          items,
          payments,
          totalAmount,
          paidAmount,
          status,
          driverFee: values.driverFee || 0,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        };
        setData([...data, newItem]);
        message.success('创建成功');
      }
      setModalVisible(false);
      setEditingItem(null);
      setItems([]);
      setPayments([]);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const itemColumns = [
    {
      title: '竹筷规格',
      dataIndex: 'chopstickSpecId',
      render: (_: any, __: any, index: number) => (
        <Select
          style={{ width: 200 }}
          placeholder="请选择"
          value={items[index].chopstickSpecId}
          onChange={(value) => updateItem(index, 'chopstickSpecId', value)}
        >
          {chopstickSpecs.map((spec) => (
            <Select.Option key={spec.id} value={spec.id}>
              {spec.size}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: '尺寸',
      dataIndex: 'size',
      render: (_: any, __: any, index: number) => items[index].size,
    },
    {
      title: '袋数',
      dataIndex: 'bags',
      render: (_: any, __: any, index: number) => (
        <InputNumber
          min={0}
          value={items[index].bags}
          onChange={(value) => updateItem(index, 'bags', value)}
        />
      ),
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      render: (_: any, __: any, index: number) => (
        <InputNumber
          min={0}
          precision={2}
          value={items[index].unitPrice}
          onChange={(value) => updateItem(index, 'unitPrice', value)}
        />
      ),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      render: (_: any, __: any, index: number) => items[index].amount?.toFixed(2) || '0.00',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      render: (_: any, __: any, index: number) => (
        <Input
          value={items[index].remark}
          onChange={(e) => updateItem(index, 'remark', e.target.value)}
        />
      ),
    },
    {
      title: '操作',
      render: (_: any, __: any, index: number) => (
        <a style={{ color: '#ff4d4f' }} onClick={() => removeItem(index)}>
          删除
        </a>
      ),
    },
  ];

  const paymentColumns = [
    {
      title: '付款金额',
      dataIndex: 'amount',
      render: (_: any, __: any, index: number) => (
        <InputNumber
          min={0}
          precision={2}
          value={payments[index].amount}
          onChange={(value) => updatePayment(index, 'amount', value)}
        />
      ),
    },
    {
      title: '付款日期',
      dataIndex: 'paymentDate',
      render: (_: any, __: any, index: number) => (
        <DatePicker
          value={dayjs(payments[index].paymentDate)}
          onChange={(date) => updatePayment(index, 'paymentDate', date?.format('YYYY-MM-DD'))}
        />
      ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      render: (_: any, __: any, index: number) => (
        <Input
          value={payments[index].remark}
          onChange={(e) => updatePayment(index, 'remark', e.target.value)}
        />
      ),
    },
    {
      title: '操作',
      render: (_: any, __: any, index: number) => (
        <a style={{ color: '#ff4d4f' }} onClick={() => removePayment(index)}>
          删除
        </a>
      ),
    },
  ];

  return (
    <div>
      <ProTable
        headerTitle="出货单管理"
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
              setItems([]);
              setPayments([]);
              form.resetFields();
              form.setFieldsValue({ orderDate: dayjs() });
              setModalVisible(true);
            }}
          >
            新建出货单
          </Button>,
        ]}
      />

      <Modal
        title={editingItem ? '编辑出货单' : '新建出货单'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          setEditingItem(null);
          setItems([]);
          setPayments([]);
          form.resetFields();
        }}
        okText="确定"
        cancelText="取消"
        width={1000}
        style={{ top: 20 }}
      >
        <Form form={form} layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="单据日期"
              name="orderDate"
              rules={[{ required: true, message: '请选择单据日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              label="客户"
              name="customerId"
              rules={[{ required: true, message: '请选择客户' }]}
            >
              <Select placeholder="请选择">
                {customers.map((c) => (
                  <Select.Option key={c.id} value={c.id}>
                    {c.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Divider orientation="left">司机信息</Divider>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item label="司机姓名" name="driverName">
              <Input placeholder="司机姓名" />
            </Form.Item>
            <Form.Item label="司机电话" name="driverPhone">
              <Input placeholder="司机电话" />
            </Form.Item>
            <Form.Item label="车牌号" name="plateNumber">
              <Input placeholder="车牌号" />
            </Form.Item>
          </div>

          <Divider orientation="left">出货明细</Divider>
          <Button type="dashed" onClick={addItem} icon={<PlusOutlined />} style={{ marginBottom: 16 }}>
            添加明细
          </Button>
          <Table
            columns={itemColumns}
            dataSource={items}
            rowKey="id"
            pagination={false}
            size="small"
          />
          <div style={{ textAlign: 'right', marginTop: 8, fontWeight: 'bold' }}>
            总金额：{totalAmount.toFixed(2)}
          </div>

          <Divider orientation="left">付款记录</Divider>
          <Button type="dashed" onClick={addPayment} icon={<PlusOutlined />} style={{ marginBottom: 16 }}>
            添加付款
          </Button>
          <Table
            columns={paymentColumns}
            dataSource={payments}
            rowKey="id"
            pagination={false}
            size="small"
          />
          <div style={{ textAlign: 'right', marginTop: 8, fontWeight: 'bold' }}>
            已付金额：{paidAmount.toFixed(2)}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
            <Form.Item label="司机费用" name="driverFee" initialValue={0}>
              <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="司机费用" />
            </Form.Item>
          </div>

          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} placeholder="备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="出货单详情"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={600}
      >
        {viewingItem && (
          <div>
            <p><strong>订单号：</strong>{viewingItem.orderNo}</p>
            <p><strong>单据日期：</strong>{viewingItem.orderDate}</p>
            <p><strong>客户：</strong>{viewingItem.customerName}</p>
            <p><strong>司机：</strong>{viewingItem.driverName}</p>
            <p><strong>司机电话：</strong>{viewingItem.driverPhone}</p>
            <p><strong>车牌号：</strong>{viewingItem.plateNumber}</p>
            <p><strong>总金额：</strong>{viewingItem.totalAmount.toFixed(2)}</p>
            <p><strong>已付金额：</strong>{viewingItem.paidAmount.toFixed(2)}</p>
            <p><strong>司机费用：</strong>{viewingItem.driverFee?.toFixed(2) || '0.00'}</p>
            <p>
              <strong>状态：</strong>
              <Tag color={statusMap[viewingItem.status].color}>
                {statusMap[viewingItem.status].text}
              </Tag>
            </p>

            <Divider>出货明细</Divider>
            <Table
              columns={[
                { title: '尺寸', dataIndex: 'size' },
                { title: '袋数', dataIndex: 'bags' },
                { title: '单价', dataIndex: 'unitPrice', render: (v: number) => v?.toFixed(2) },
                { title: '金额', dataIndex: 'amount', render: (v: number) => v?.toFixed(2) },
                { title: '备注', dataIndex: 'remark' },
              ]}
              dataSource={viewingItem.items}
              rowKey="id"
              pagination={false}
              size="small"
            />

            {viewingItem.payments.length > 0 && (
              <>
                <Divider>付款记录</Divider>
                <Table
                  columns={[
                    { title: '付款金额', dataIndex: 'amount', render: (v: number) => v?.toFixed(2) },
                    { title: '付款日期', dataIndex: 'paymentDate' },
                    { title: '备注', dataIndex: 'remark' },
                  ]}
                  dataSource={viewingItem.payments}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </>
            )}

            {viewingItem.remark && (
              <>
                <Divider />
                <p><strong>备注：</strong>{viewingItem.remark}</p>
              </>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
