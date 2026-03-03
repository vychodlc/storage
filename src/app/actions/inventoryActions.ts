'use server';

import { sql } from '@/lib/db';
import type { BambooInventory, ChopstickInventory } from '@/types';

// ============ 竹丝库存操作 ============

export async function getBambooInventory(): Promise<BambooInventory[]> {
  const result = await sql`
    SELECT id, bamboo_spec_id as "bambooSpecId", size, quantity, created_at as "createdAt", updated_at as "updatedAt"
    FROM bamboo_inventory
    ORDER BY size
  `;
  return result as BambooInventory[];
}

export async function updateBambooInventory(bambooSpecId: string, quantity: number): Promise<BambooInventory | null> {
  const result = await sql`
    UPDATE bamboo_inventory
    SET quantity = ${quantity}
    WHERE bamboo_spec_id = ${bambooSpecId}
    RETURNING id, bamboo_spec_id as "bambooSpecId", size, quantity, created_at as "createdAt", updated_at as "updatedAt"
  `;
  return (result as BambooInventory[])[0] || null;
}

export async function adjustBambooInventory(bambooSpecId: string, change: number): Promise<BambooInventory | null> {
  const result = await sql`
    UPDATE bamboo_inventory
    SET quantity = quantity + ${change}
    WHERE bamboo_spec_id = ${bambooSpecId}
    RETURNING id, bamboo_spec_id as "bambooSpecId", size, quantity, created_at as "createdAt", updated_at as "updatedAt"
  `;
  return (result as BambooInventory[])[0] || null;
}

export async function initBambooInventoryItem(data: Omit<BambooInventory, 'id' | 'createdAt' | 'updatedAt'>): Promise<BambooInventory> {
  const result = await sql`
    INSERT INTO bamboo_inventory (bamboo_spec_id, size, quantity)
    VALUES (${data.bambooSpecId}, ${data.size}, ${data.quantity})
    ON CONFLICT (bamboo_spec_id) DO UPDATE SET quantity = EXCLUDED.quantity
    RETURNING id, bamboo_spec_id as "bambooSpecId", size, quantity, created_at as "createdAt", updated_at as "updatedAt"
  `;
  return (result as BambooInventory[])[0];
}

// ============ 竹筷库存操作 ============

export async function getChopstickInventory(): Promise<ChopstickInventory[]> {
  const result = await sql`
    SELECT id, chopstick_spec_id as "chopstickSpecId", size, quantity, created_at as "createdAt", updated_at as "updatedAt"
    FROM chopstick_inventory
    ORDER BY size
  `;
  return result as ChopstickInventory[];
}

export async function updateChopstickInventory(chopstickSpecId: string, quantity: number): Promise<ChopstickInventory | null> {
  const result = await sql`
    UPDATE chopstick_inventory
    SET quantity = ${quantity}
    WHERE chopstick_spec_id = ${chopstickSpecId}
    RETURNING id, chopstick_spec_id as "chopstickSpecId", size, quantity, created_at as "createdAt", updated_at as "updatedAt"
  `;
  return (result as ChopstickInventory[])[0] || null;
}

export async function adjustChopstickInventory(chopstickSpecId: string, change: number): Promise<ChopstickInventory | null> {
  const result = await sql`
    UPDATE chopstick_inventory
    SET quantity = quantity + ${change}
    WHERE chopstick_spec_id = ${chopstickSpecId}
    RETURNING id, chopstick_spec_id as "chopstickSpecId", size, quantity, created_at as "createdAt", updated_at as "updatedAt"
  `;
  return (result as ChopstickInventory[])[0] || null;
}

export async function initChopstickInventoryItem(data: Omit<ChopstickInventory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChopstickInventory> {
  const result = await sql`
    INSERT INTO chopstick_inventory (chopstick_spec_id, size, quantity)
    VALUES (${data.chopstickSpecId}, ${data.size}, ${data.quantity})
    ON CONFLICT (chopstick_spec_id) DO UPDATE SET quantity = EXCLUDED.quantity
    RETURNING id, chopstick_spec_id as "chopstickSpecId", size, quantity, created_at as "createdAt", updated_at as "updatedAt"
  `;
  return (result as ChopstickInventory[])[0];
}
