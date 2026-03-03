'use server';

import { sql } from '@/lib/db';
import type { Transaction } from '@/types';

export async function getTransactions(): Promise<Transaction[]> {
  const result = await sql`
    SELECT id, type, reference_id as "referenceId", reference_no as "referenceNo",
           amount, direction, date, remark, created_at as "createdAt"
    FROM transactions
    ORDER BY date DESC, created_at DESC
  `;
  return result as Transaction[];
}

export async function getTransactionsByType(type: Transaction['type']): Promise<Transaction[]> {
  const result = await sql`
    SELECT id, type, reference_id as "referenceId", reference_no as "referenceNo",
           amount, direction, date, remark, created_at as "createdAt"
    FROM transactions
    WHERE type = ${type}
    ORDER BY date DESC, created_at DESC
  `;
  return result as Transaction[];
}

export async function createTransaction(data: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
  const result = await sql`
    INSERT INTO transactions (type, reference_id, reference_no, amount, direction, date, remark)
    VALUES (${data.type}, ${data.referenceId}, ${data.referenceNo}, ${data.amount}, ${data.direction}, ${data.date}, ${data.remark})
    RETURNING id, type, reference_id as "referenceId", reference_no as "referenceNo",
              amount, direction, date, remark, created_at as "createdAt"
  `;
  return (result as Transaction[])[0];
}

export async function deleteTransaction(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM transactions WHERE id = ${id}
  `;
  return (result as any).count > 0;
}

export async function getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
  const result = await sql`
    SELECT id, type, reference_id as "referenceId", reference_no as "referenceNo",
           amount, direction, date, remark, created_at as "createdAt"
    FROM transactions
    WHERE date >= ${startDate} AND date <= ${endDate}
    ORDER BY date DESC, created_at DESC
  `;
  return result as Transaction[];
}
