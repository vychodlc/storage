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
  const current = await sql`
    SELECT * FROM bamboo_specs WHERE id = ${id}
  `;
  if ((current as any[]).length === 0) return null;

  const currentData = (current as any[])[0];
  const newSize = data.size ?? currentData.size;
  const newName = data.name ?? currentData.name;
  const newRemark = data.remark ?? currentData.remark;
  const newIsActive = data.isActive ?? currentData.is_active;

  const result = await sql`
    UPDATE bamboo_specs
    SET size = ${newSize}, name = ${newName}, remark = ${newRemark}, is_active = ${newIsActive}
    WHERE id = ${id}
    RETURNING id, size, name, remark, is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
  `;
  return (result as BambooSpec[])[0] || null;
}

export async function deleteBambooSpec(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM bamboo_specs WHERE id = ${id}
  `;
  return (result as any).count > 0;
}
