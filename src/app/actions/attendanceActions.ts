'use server';

import { sql } from '@/lib/db';
import type { Attendance } from '@/types';

export async function getAttendances(): Promise<Attendance[]> {
  const result = await sql`
    SELECT id, worker_id as "workerId", worker_name as "workerName", year, month, days,
           created_at as "createdAt", updated_at as "updatedAt"
    FROM attendances
    ORDER BY year DESC, month DESC, worker_name
  `;
  return (result as any[]).map(row => ({
    ...row,
    days: typeof row.days === 'string' ? JSON.parse(row.days) : row.days
  })) as Attendance[];
}

export async function getAttendancesByMonth(year: number, month: number): Promise<Attendance[]> {
  const result = await sql`
    SELECT id, worker_id as "workerId", worker_name as "workerName", year, month, days,
           created_at as "createdAt", updated_at as "updatedAt"
    FROM attendances
    WHERE year = ${year} AND month = ${month}
    ORDER BY worker_name
  `;
  return (result as any[]).map(row => ({
    ...row,
    days: typeof row.days === 'string' ? JSON.parse(row.days) : row.days
  })) as Attendance[];
}

export async function getAttendanceByWorkerAndMonth(workerId: string, year: number, month: number): Promise<Attendance | null> {
  const result = await sql`
    SELECT id, worker_id as "workerId", worker_name as "workerName", year, month, days,
           created_at as "createdAt", updated_at as "updatedAt"
    FROM attendances
    WHERE worker_id = ${workerId} AND year = ${year} AND month = ${month}
  `;
  const rows = (result as any[]).map(row => ({
    ...row,
    days: typeof row.days === 'string' ? JSON.parse(row.days) : row.days
  })) as Attendance[];
  return rows[0] || null;
}

export async function createAttendance(data: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>): Promise<Attendance> {
  const result = await sql`
    INSERT INTO attendances (worker_id, worker_name, year, month, days)
    VALUES (${data.workerId}, ${data.workerName}, ${data.year}, ${data.month}, ${JSON.stringify(data.days)}::jsonb)
    RETURNING id, worker_id as "workerId", worker_name as "workerName", year, month, days,
              created_at as "createdAt", updated_at as "updatedAt"
  `;
  const row = (result as any[])[0];
  return {
    ...row,
    days: typeof row.days === 'string' ? JSON.parse(row.days) : row.days
  } as Attendance;
}

export async function updateAttendance(id: string, data: Partial<Attendance>): Promise<Attendance | null> {
  const current = await sql`
    SELECT * FROM attendances WHERE id = ${id}
  `;
  if ((current as any[]).length === 0) return null;

  const currentData = (current as any[])[0];
  const newWorkerId = data.workerId ?? currentData.worker_id;
  const newWorkerName = data.workerName ?? currentData.worker_name;
  const newYear = data.year ?? currentData.year;
  const newMonth = data.month ?? currentData.month;
  const newDays = data.days ?? (typeof currentData.days === 'string' ? JSON.parse(currentData.days) : currentData.days);

  const result = await sql`
    UPDATE attendances
    SET worker_id = ${newWorkerId}, worker_name = ${newWorkerName}, year = ${newYear}, month = ${newMonth}, days = ${JSON.stringify(newDays)}::jsonb
    WHERE id = ${id}
    RETURNING id, worker_id as "workerId", worker_name as "workerName", year, month, days,
              created_at as "createdAt", updated_at as "updatedAt"
  `;
  const rows = (result as any[]).map(row => ({
    ...row,
    days: typeof row.days === 'string' ? JSON.parse(row.days) : row.days
  })) as Attendance[];
  return rows[0] || null;
}

export async function upsertAttendance(data: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>): Promise<Attendance> {
  const result = await sql`
    INSERT INTO attendances (worker_id, worker_name, year, month, days)
    VALUES (${data.workerId}, ${data.workerName}, ${data.year}, ${data.month}, ${JSON.stringify(data.days)}::jsonb)
    ON CONFLICT (worker_id, year, month) DO UPDATE
    SET days = EXCLUDED.days, updated_at = CURRENT_TIMESTAMP
    RETURNING id, worker_id as "workerId", worker_name as "workerName", year, month, days,
              created_at as "createdAt", updated_at as "updatedAt"
  `;
  const row = (result as any[])[0];
  return {
    ...row,
    days: typeof row.days === 'string' ? JSON.parse(row.days) : row.days
  } as Attendance;
}

export async function deleteAttendance(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM attendances WHERE id = ${id}
  `;
  return (result as any).count > 0;
}
