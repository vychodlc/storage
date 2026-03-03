'use server';

import { sql } from '@/lib/db';
import type { Worker } from '@/types';

export async function getWorkers(): Promise<Worker[]> {
  const result = await sql`
    SELECT id, name, type, phone, daily_wage as "dailyWage", remark, created_at as "createdAt", updated_at as "updatedAt"
    FROM workers
    ORDER BY created_at DESC
  `;
  return result as Worker[];
}

export async function getWorkersByType(type: Worker['type']): Promise<Worker[]> {
  const result = await sql`
    SELECT id, name, type, phone, daily_wage as "dailyWage", remark, created_at as "createdAt", updated_at as "updatedAt"
    FROM workers
    WHERE type = ${type}
    ORDER BY created_at DESC
  `;
  return result as Worker[];
}

export async function createWorker(data: Omit<Worker, 'id' | 'createdAt' | 'updatedAt'>): Promise<Worker> {
  const result = await sql`
    INSERT INTO workers (name, type, phone, daily_wage, remark)
    VALUES (${data.name}, ${data.type}, ${data.phone}, ${data.dailyWage}, ${data.remark})
    RETURNING id, name, type, phone, daily_wage as "dailyWage", remark, created_at as "createdAt", updated_at as "updatedAt"
  `;
  return (result as Worker[])[0];
}

export async function updateWorker(id: string, data: Partial<Worker>): Promise<Worker | null> {
  const current = await sql`
    SELECT * FROM workers WHERE id = ${id}
  `;
  if ((current as any[]).length === 0) return null;

  const currentData = (current as any[])[0];
  const newName = data.name ?? currentData.name;
  const newType = data.type ?? currentData.type;
  const newPhone = data.phone ?? currentData.phone;
  const newDailyWage = data.dailyWage ?? currentData.daily_wage;
  const newRemark = data.remark ?? currentData.remark;

  const result = await sql`
    UPDATE workers
    SET name = ${newName}, type = ${newType}, phone = ${newPhone}, daily_wage = ${newDailyWage}, remark = ${newRemark}
    WHERE id = ${id}
    RETURNING id, name, type, phone, daily_wage as "dailyWage", remark, created_at as "createdAt", updated_at as "updatedAt"
  `;
  return (result as Worker[])[0] || null;
}

export async function deleteWorker(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM workers WHERE id = ${id}
  `;
  return (result as any).count > 0;
}
