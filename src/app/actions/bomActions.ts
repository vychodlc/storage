'use server';

import { sql } from '@/lib/db';
import type { BOM } from '@/types';

export async function getBOMList(): Promise<BOM[]> {
  const result = await sql`
    SELECT id, chopstick_spec_id as "chopstickSpecId", chopstick_spec_size as "chopstickSpecSize",
           bamboo_spec_id as "bambooSpecId", bamboo_spec_size as "bambooSpecSize",
           bundles_per_bag as "bundlesPerBag", remark, created_at as "createdAt", updated_at as "updatedAt"
    FROM bom
    ORDER BY created_at DESC
  `;
  return result as BOM[];
}

export async function createBOM(data: Omit<BOM, 'id' | 'createdAt' | 'updatedAt'>): Promise<BOM> {
  const result = await sql`
    INSERT INTO bom (chopstick_spec_id, chopstick_spec_size, bamboo_spec_id, bamboo_spec_size, bundles_per_bag, remark)
    VALUES (${data.chopstickSpecId}, ${data.chopstickSpecSize}, ${data.bambooSpecId}, ${data.bambooSpecSize}, ${data.bundlesPerBag}, ${data.remark})
    RETURNING id, chopstick_spec_id as "chopstickSpecId", chopstick_spec_size as "chopstickSpecSize",
              bamboo_spec_id as "bambooSpecId", bamboo_spec_size as "bambooSpecSize",
              bundles_per_bag as "bundlesPerBag", remark, created_at as "createdAt", updated_at as "updatedAt"
  `;
  return (result as BOM[])[0];
}

export async function updateBOM(id: string, data: Partial<BOM>): Promise<BOM | null> {
  const current = await sql`
    SELECT * FROM bom WHERE id = ${id}
  `;
  if ((current as any[]).length === 0) return null;

  const currentData = (current as any[])[0];
  const newChopstickSpecId = data.chopstickSpecId ?? currentData.chopstick_spec_id;
  const newChopstickSpecSize = data.chopstickSpecSize ?? currentData.chopstick_spec_size;
  const newBambooSpecId = data.bambooSpecId ?? currentData.bamboo_spec_id;
  const newBambooSpecSize = data.bambooSpecSize ?? currentData.bamboo_spec_size;
  const newBundlesPerBag = data.bundlesPerBag ?? currentData.bundles_per_bag;
  const newRemark = data.remark ?? currentData.remark;

  const result = await sql`
    UPDATE bom
    SET chopstick_spec_id = ${newChopstickSpecId}, chopstick_spec_size = ${newChopstickSpecSize},
        bamboo_spec_id = ${newBambooSpecId}, bamboo_spec_size = ${newBambooSpecSize},
        bundles_per_bag = ${newBundlesPerBag}, remark = ${newRemark}
    WHERE id = ${id}
    RETURNING id, chopstick_spec_id as "chopstickSpecId", chopstick_spec_size as "chopstickSpecSize",
              bamboo_spec_id as "bambooSpecId", bamboo_spec_size as "bambooSpecSize",
              bundles_per_bag as "bundlesPerBag", remark, created_at as "createdAt", updated_at as "updatedAt"
  `;
  return (result as BOM[])[0] || null;
}

export async function deleteBOM(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM bom WHERE id = ${id}
  `;
  return (result as any).count > 0;
}
