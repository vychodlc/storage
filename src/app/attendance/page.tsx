'use client';

import React, { useState, useMemo } from 'react';
import { Card, Select, Table, Tag, Modal, Button, Form, InputNumber, message, Space } from 'antd';
import dayjs from 'dayjs';
import type { Attendance, AttendanceStatus, Worker } from '@/types';
import { attendances as mockData, workers } from '@/mock/data';

const normalWorkers = workers.filter((w) => w.type === 'normal');
const currentYear = dayjs().year();
const currentMonth = dayjs().month() + 1;

const statusColors: Record<AttendanceStatus, string> = {
  none: '#f0f0f0',
  half: '#ffe58f',
  full: '#b7eb8f',
};

const statusLabels: Record<AttendanceStatus, string> = {
  none: '未上工',
  half: '半天',
  full: '全天',
};

const cycle: AttendanceStatus[] = ['none', 'full', 'half'];

export default function AttendancePage() {
  const [data, setData] = useState<Attendance[]>(mockData);
  const [year, setYear] = useState<number>(currentYear);
  const [month, setMonth] = useState<number>(currentMonth);
  const [salaryModalVisible, setSalaryModalVisible] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [form] = Form.useForm();

  const daysInMonth = useMemo(() => {
    return dayjs(`${year}-${month}`).daysInMonth();
  }, [year, month]);

  const getAttendanceStatus = (workerId: string, day: number): AttendanceStatus => {
    const record = data.find((a) => a.workerId === workerId && a.year === year && a.month === month);
    return record?.days[day] || 'none';
  };

  const toggleStatus = (workerId: string, workerName: string, day: number) => {
    const currentStatus = getAttendanceStatus(workerId, day);
    const currentIndex = cycle.indexOf(currentStatus);
    const nextStatus = cycle[(currentIndex + 1) % cycle.length];

    setData((prev) => {
      let updated = false;
      const newData = prev.map((record) => {
        if (record.workerId === workerId && record.year === year && record.month === month) {
          updated = true;
          return {
            ...record,
            days: { ...record.days, [day]: nextStatus },
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return record;
      });

      if (!updated) {
        newData.push({
          id: Date.now().toString(),
          workerId,
          workerName,
          year,
          month,
          days: { [day]: nextStatus },
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        });
      }

      return newData;
    });
  };

  const calculateDays = (workerId: string) => {
    let fullDays = 0;
    let halfDays = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const status = getAttendanceStatus(workerId, day);
      if (status === 'full') fullDays++;
      if (status === 'half') halfDays++;
    }
    return { fullDays, halfDays, total: fullDays + halfDays * 0.5 };
  };

  const openSalaryModal = (worker: Worker) => {
    const { fullDays, halfDays, total } = calculateDays(worker.id);
    setSelectedWorker(worker);
    form.setFieldsValue({
      fullDays,
      halfDays,
      totalDays: total.toFixed(1),
      dailyWage: worker.dailyWage,
      totalSalary: (total * worker.dailyWage).toFixed(2),
    });
    setSalaryModalVisible(true);
  };

  const handleSalarySubmit = () => {
    message.success('工资记录已保存');
    setSalaryModalVisible(false);
  };

  const columns = [
    {
      title: '工人',
      dataIndex: 'name',
      fixed: 'left' as const,
      width: 120,
      render: (name: string, record: Worker) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{name}</div>
          <Button
            type="link"
            size="small"
            onClick={() => openSalaryModal(record)}
          >
            计算工资
          </Button>
        </div>
      ),
    },
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return {
        title: `${day}日`,
        dataIndex: `day${day}`,
        width: 60,
        align: 'center' as const,
        render: (_: any, record: Worker) => {
          const status = getAttendanceStatus(record.id, day);
          return (
            <div
              style={{
                padding: '4px 8px',
                backgroundColor: statusColors[status],
                borderRadius: 4,
                cursor: 'pointer',
              }}
              onClick={() => toggleStatus(record.id, record.name, day)}
            >
              {status === 'full' ? '全' : status === 'half' ? '半' : '-'}
            </div>
          );
        },
      };
    }),
  ];

  const tableData = normalWorkers.map((worker) => ({
    ...worker,
    key: worker.id,
  }));

  return (
    <div>
      <Card
        title="月出勤统计表"
        extra={
          <Space>
            <Select
              value={year}
              onChange={setYear}
              style={{ width: 120 }}
              options={Array.from({ length: 5 }, (_, i) => ({
                value: currentYear - 2 + i,
                label: `${currentYear - 2 + i}年`,
              }))}
            />
            <Select
              value={month}
              onChange={setMonth}
              style={{ width: 100 }}
              options={Array.from({ length: 12 }, (_, i) => ({
                value: i + 1,
                label: `${i + 1}月`,
              }))}
            />
          </Space>
        }
      >
        <div style={{ marginBottom: 16, padding: 8, background: '#fafafa', borderRadius: 4 }}>
          <Space size="middle">
            <span>
              <Tag color="green" style={{ backgroundColor: statusColors.full }}>
                全天
              </Tag>
            </span>
            <span>
              <Tag color="gold" style={{ backgroundColor: statusColors.half }}>
                半天
              </Tag>
            </span>
            <span>
              <Tag style={{ backgroundColor: statusColors.none }}>未上工</Tag>
            </span>
            <span style={{ color: '#999' }}>点击单元格切换状态</span>
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          scroll={{ x: daysInMonth * 60 + 200 }}
          size="small"
        />
      </Card>

      <Modal
        title="计算工资"
        open={salaryModalVisible}
        onOk={handleSalarySubmit}
        onCancel={() => setSalaryModalVisible(false)}
        okText="确认保存"
        cancelText="取消"
      >
        {selectedWorker && (
          <Form form={form} layout="vertical">
            <p><strong>工人：</strong>{selectedWorker.name}</p>
            <Form.Item label="出勤统计" name="attendanceSummary">
              <div>
                <p>全天：<Form.Item noStyle name="fullDays"><InputNumber readOnly style={{ width: 80 }} /></Form.Item> 天</p>
                <p>半天：<Form.Item noStyle name="halfDays"><InputNumber readOnly style={{ width: 80 }} /></Form.Item> 天</p>
                <p>合计：<Form.Item noStyle name="totalDays"><InputNumber readOnly style={{ width: 80 }} /></Form.Item> 天</p>
              </div>
            </Form.Item>
            <Form.Item
              label="日工资"
              name="dailyWage"
              rules={[{ required: true, message: '请输入日工资' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="应发工资" name="totalSalary">
              <InputNumber readOnly style={{ width: '100%' }} addonAfter="元" />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
