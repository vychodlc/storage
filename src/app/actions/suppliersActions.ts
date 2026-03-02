'use server';

import { sql } from '@/lib/db';
import type { Supplier } from '@/types';

export async function getSuppliers(): Promise<Supplier[]> {
  const result = await sql`
    SELECT id, name, contact, contact_person as "contactPerson", address, remark, created_at as "createdAt", updated_at as "updatedAt"
    FROM suppliers
    ORDER BY created_at DESC
  `;
  return result as Supplier[];
}

export async function createSupplier(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
  const result = await sql`
    INSERT INTO suppliers (name, contact, contact_person, address, remark)
    VALUES (${data.name}, ${data.contact}, ${data.contactPerson}, ${data.address}, ${data.remark})
    RETURNING id, name, contact, contact_person as "contactPerson", address, remark, created_at as "createdAt", updated_at as "updatedAt"
  `;
  return (result as Supplier[])[0];
}

export async function updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier | null> {
  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    setClauses.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.contact !== undefined) {
    setClauses.push(`contact = $${paramIndex++}`);
    values.push(data.contact);
  }
  if (data.contactPerson !== undefined) {
    setClauses.push(`contact_person = $${paramIndex++}`);
    values.push(data.contactPerson);
  }
  if (data.address !== undefined) {
    setClauses.push(`address = $${paramIndex++}`);
    values.push(data.address);
  }
  if (data.remark !== undefined) {
    setClauses.push(`remark = $${paramIndex++}`);
    values.push(data.remark);
  }

  if (setClauses.length === 0) return null;

  values.push(id);
  const query = `
    UPDATE suppliers
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, name, contact, contact_person as "contactPerson", address, remark, created_at as "createdAt", updated_at as "updatedAt"
  `;

  const result = await sql(query, values);
  return (result as Supplier[])[0] || null;
}

export async function deleteSupplier(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM suppliers WHERE id = ${id}
  `;
  return (result as any).count > 0;
}
