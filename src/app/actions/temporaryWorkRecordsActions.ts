'use server';

import { sql } from '@/lib/db';
import type { TemporaryWorkRecord } from '@/types';

export async function getTemporaryWorkRecords(): Promise<TemporaryWorkRecord[]> {
  const result = await sql`
    SELECT id, worker_id as "workerId", worker_name as "workerName", work_date as "workDate",
           work_type as "workType", wage, remark, created_at as "createdAt"
    FROM temporary_work_records
    ORDER BY work_date DESC, created_at DESC
  `;
  return result as TemporaryWorkRecord[];
}

export async function getTemporaryWorkRecordsByWorker(workerId: string): Promise<TemporaryWorkRecord[]> {
  const result = await sql`
    SELECT id, worker_id as "workerId", worker_name as "workerName", work_date as "workDate",
           work_type as "workType", wage, remark, created_at as "createdAt"
    FROM temporary_work_records
    WHERE worker_id = ${workerId}
    ORDER BY work_date DESC, created_at DESC
  `;
  return result as TemporaryWorkRecord[];
}

export async function getTemporaryWorkRecordsByDateRange(startDate: string, endDate: string): Promise<TemporaryWorkRecord[]> {
  const result = await sql`
    SELECT id, worker_id as "workerId", worker_name as "workerName", work_date as "workDate",
           work_type as "workType", wage, remark, created_at as "createdAt"
    FROM temporary_work_records
    WHERE work_date >= ${startDate} AND work_date <= ${endDate}
    ORDER BY work_date DESC, created_at DESC
  `;
  return result as TemporaryWorkRecord[];
}

export async function createTemporaryWorkRecord(data: Omit<TemporaryWorkRecord, 'id' | 'createdAt'>): Promise<TemporaryWorkRecord> {
  const result = await sql`
    INSERT INTO temporary_work_records (worker_id, worker_name, work_date, work_type, wage, remark)
    VALUES (${data.workerId}, ${data.workerName}, ${data.workDate}, ${data.workType}, ${data.wage}, ${data.remark})
    RETURNING id, worker_id as "workerId", worker_name as "workerName", work_date as "workDate",
              work_type as "workType", wage, remark, created_at as "createdAt"
  `;
  return (result as TemporaryWorkRecord[])[0];
}

export async function updateTemporaryWorkRecord(id: string, data: Partial<TemporaryWorkRecord>): Promise<TemporaryWorkRecord | null> {
  const current = await sql`
    SELECT * FROM temporary_work_records WHERE id = ${id}
  `;
  if ((current as any[]).length === 0) return null;

  const currentData = (current as any[])[0];
  const newWorkerId = data.workerId ?? currentData.worker_id;
  const newWorkerName = data.workerName ?? currentData.worker_name;
  const newWorkDate = data.workDate ?? currentData.work_date;
  const newWorkType = data.workType ?? currentData.work_type;
  const newWage = data.wage ?? currentData.wage;
  const newRemark = data.remark ?? currentData.remark;

  const result = await sql`
    UPDATE temporary_work_records
    SET worker_id = ${newWorkerId}, worker_name = ${newWorkerName}, work_date = ${newWorkDate},
        work_type = ${newWorkType}, wage = ${newWage}, remark = ${newRemark}
    WHERE id = ${id}
    RETURNING id, worker_id as "workerId", worker_name as "workerName", work_date as "workDate",
              work_type as "workType", wage, remark, created_at as "createdAt"
  `;
  return (result as TemporaryWorkRecord[])[0] || null;
}

export async function deleteTemporaryWorkRecord(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM temporary_work_records WHERE id = ${id}
  `;
  return (result as any).count > 0;
}
