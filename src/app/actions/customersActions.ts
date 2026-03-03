'use server';

import { sql } from '@/lib/db';
import type { Customer } from '@/types';

export async function getCustomers(): Promise<Customer[]> {
  const result = await sql`
    SELECT id, name, contact, contact_person as "contactPerson", address, remark, created_at as "createdAt", updated_at as "updatedAt"
    FROM customers
    ORDER BY created_at DESC
  `;
  return result as Customer[];
}

export async function createCustomer(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
  const result = await sql`
    INSERT INTO customers (name, contact, contact_person, address, remark)
    VALUES (${data.name}, ${data.contact}, ${data.contactPerson}, ${data.address}, ${data.remark})
    RETURNING id, name, contact, contact_person as "contactPerson", address, remark, created_at as "createdAt", updated_at as "updatedAt"
  `;
  return (result as Customer[])[0];
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | null> {
  const current = await sql`
    SELECT * FROM customers WHERE id = ${id}
  `;
  if ((current as any[]).length === 0) return null;

  const currentData = (current as any[])[0];
  const newName = data.name ?? currentData.name;
  const newContact = data.contact ?? currentData.contact;
  const newContactPerson = data.contactPerson ?? currentData.contact_person;
  const newAddress = data.address ?? currentData.address;
  const newRemark = data.remark ?? currentData.remark;

  const result = await sql`
    UPDATE customers
    SET name = ${newName}, contact = ${newContact}, contact_person = ${newContactPerson}, address = ${newAddress}, remark = ${newRemark}
    WHERE id = ${id}
    RETURNING id, name, contact, contact_person as "contactPerson", address, remark, created_at as "createdAt", updated_at as "updatedAt"
  `;
  return (result as Customer[])[0] || null;
}

export async function deleteCustomer(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM customers WHERE id = ${id}
  `;
  return (result as any).count > 0;
}
