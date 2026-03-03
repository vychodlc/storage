'use server';

import { sql } from '@/lib/db';
import type { ChopstickSpec } from '@/types';

export async function getChopstickSpecs(): Promise<ChopstickSpec[]> {
  const result = await sql`
    SELECT id, size, name, remark, is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
    FROM chopstick_specs
    ORDER BY created_at DESC
  `;
  return result as ChopstickSpec[];
}

export async function createChopstickSpec(data: Omit<ChopstickSpec, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChopstickSpec> {
  const result = await sql`
    INSERT INTO chopstick_specs (size, name, remark, is_active)
    VALUES (${data.size}, ${data.name}, ${data.remark}, ${data.isActive})
    RETURNING id, size, name, remark, is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
  `;
  return (result as ChopstickSpec[])[0];
}

export async function updateChopstickSpec(id: string, data: Partial<ChopstickSpec>): Promise<ChopstickSpec | null> {
  // 先获取当前数据
  const current = await sql`
    SELECT * FROM chopstick_specs WHERE id = ${id}
  `;
  if ((current as any[]).length === 0) return null;

  const currentData = (current as any[])[0];
  const newSize = data.size ?? currentData.size;
  const newName = data.name ?? currentData.name;
  const newRemark = data.remark ?? currentData.remark;
  const newIsActive = data.isActive ?? currentData.is_active;

  const result = await sql`
    UPDATE chopstick_specs
    SET size = ${newSize}, name = ${newName}, remark = ${newRemark}, is_active = ${newIsActive}
    WHERE id = ${id}
    RETURNING id, size, name, remark, is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
  `;
  return (result as ChopstickSpec[])[0] || null;
}

export async function deleteChopstickSpec(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM chopstick_specs WHERE id = ${id}
  `;
  return (result as any).count > 0;
}
