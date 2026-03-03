'use server';

import { sql } from '@/lib/db';
import type { InboundDriver } from '@/types';

export async function getInboundDrivers(): Promise<InboundDriver[]> {
  const result = await sql`
    SELECT id, name, phone, is_logistics as "isLogistics", remark, created_at as "createdAt", updated_at as "updatedAt"
    FROM inbound_drivers
    ORDER BY created_at DESC
  `;
  return result as InboundDriver[];
}

export async function createInboundDriver(data: Omit<InboundDriver, 'id' | 'createdAt' | 'updatedAt'>): Promise<InboundDriver> {
  const result = await sql`
    INSERT INTO inbound_drivers (name, phone, is_logistics, remark)
    VALUES (${data.name}, ${data.phone}, ${data.isLogistics}, ${data.remark})
    RETURNING id, name, phone, is_logistics as "isLogistics", remark, created_at as "createdAt", updated_at as "updatedAt"
  `;
  return (result as InboundDriver[])[0];
}

export async function updateInboundDriver(id: string, data: Partial<InboundDriver>): Promise<InboundDriver | null> {
  const current = await sql`
    SELECT * FROM inbound_drivers WHERE id = ${id}
  `;
  if ((current as any[]).length === 0) return null;

  const currentData = (current as any[])[0];
  const newName = data.name ?? currentData.name;
  const newPhone = data.phone ?? currentData.phone;
  const newIsLogistics = data.isLogistics ?? currentData.is_logistics;
  const newRemark = data.remark ?? currentData.remark;

  const result = await sql`
    UPDATE inbound_drivers
    SET name = ${newName}, phone = ${newPhone}, is_logistics = ${newIsLogistics}, remark = ${newRemark}
    WHERE id = ${id}
    RETURNING id, name, phone, is_logistics as "isLogistics", remark, created_at as "createdAt", updated_at as "updatedAt"
  `;
  return (result as InboundDriver[])[0] || null;
}

export async function deleteInboundDriver(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM inbound_drivers WHERE id = ${id}
  `;
  return (result as any).count > 0;
}
