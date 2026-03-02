'use server';

import { sql } from '@/lib/db';
import type { BambooSpec } from '@/types';

export async function getBambooSpecs(): Promise<BambooSpec[]> {
  const result = await sql`
    SELECT id, size, name, remark, is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
    FROM bamboo_specs
    ORDER BY created_at DESC
  `;
  return result as BambooSpec[];
}

export async function createBambooSpec(data: Omit<BambooSpec, 'id' | 'createdAt' | 'updatedAt'>): Promise<BambooSpec> {
  const result = await sql`
    INSERT INTO bamboo_specs (size, name, remark, is_active)
    VALUES (${data.size}, ${data.name}, ${data.remark}, ${data.isActive})
    RETURNING id, size, name, remark, is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
  `;
  return (result as BambooSpec[])[0];
}

export async function updateBambooSpec(id: string, data: Partial<BambooSpec>): Promise<BambooSpec | null> {
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
    UPDATE bamboo_specs
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, size, name, remark, is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
  `;

  const result = await sql(query, values);
  return (result as BambooSpec[])[0] || null;
}

export async function deleteBambooSpec(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM bamboo_specs WHERE id = ${id}
  `;
  return (result as any).count > 0;
}
