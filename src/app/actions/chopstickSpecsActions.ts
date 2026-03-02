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
  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.size !== undefined) {
    setClauses.push(`size = $${paramIndex++}`);
    values.push(data.size);
  }
  if (data.name !== undefined) {
    setClauses.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.remark !== undefined) {
    setClauses.push(`remark = $${paramIndex++}`);
    values.push(data.remark);
  }
  if (data.isActive !== undefined) {
    setClauses.push(`is_active = $${paramIndex++}`);
    values.push(data.isActive);
  }

  if (setClauses.length === 0) return null;

  values.push(id);
  const query = `
    UPDATE chopstick_specs
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, size, name, remark, is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
  `;

  const result = await sql(query, values);
  return (result as ChopstickSpec[])[0] || null;
}

export async function deleteChopstickSpec(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM chopstick_specs WHERE id = ${id}
  `;
  return (result as any).count > 0;
}
