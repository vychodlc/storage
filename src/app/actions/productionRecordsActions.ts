'use server';

import { sql } from '@/lib/db';
import type { ProductionRecord, ProductionItem } from '@/types';

export async function getProductionRecords(): Promise<ProductionRecord[]> {
  const records = await sql`
    SELECT id, date, worker_id as "workerId", worker_name as "workerName", type, remark, created_at as "createdAt"
    FROM production_records
    ORDER BY date DESC, created_at DESC
  `;

  const recordIds = (records as any[]).map(r => r.id);
  if (recordIds.length === 0) return records as ProductionRecord[];

  const items = await sql`
    SELECT id, production_record_id as "productionRecordId", spec_id as "specId", size, quantity
    FROM production_items
    WHERE production_record_id IN (${recordIds.join(',')})
  `;

  return (records as any[]).map(record => ({
    ...record,
    items: (items as any[]).filter(i => i.productionRecordId === record.id)
  })) as ProductionRecord[];
}

export async function getProductionRecordsByDateRange(startDate: string, endDate: string): Promise<ProductionRecord[]> {
  const records = await sql`
    SELECT id, date, worker_id as "workerId", worker_name as "workerName", type, remark, created_at as "createdAt"
    FROM production_records
    WHERE date >= ${startDate} AND date <= ${endDate}
    ORDER BY date DESC, created_at DESC
  `;

  const recordIds = (records as any[]).map(r => r.id);
  if (recordIds.length === 0) return records as ProductionRecord[];

  const items = await sql`
    SELECT id, production_record_id as "productionRecordId", spec_id as "specId", size, quantity
    FROM production_items
    WHERE production_record_id IN (${recordIds.join(',')})
  `;

  return (records as any[]).map(record => ({
    ...record,
    items: (items as any[]).filter(i => i.productionRecordId === record.id)
  })) as ProductionRecord[];
}

export async function getProductionRecordById(id: string): Promise<ProductionRecord | null> {
  const records = await sql`
    SELECT id, date, worker_id as "workerId", worker_name as "workerName", type, remark, created_at as "createdAt"
    FROM production_records
    WHERE id = ${id}
  `;

  if ((records as any[]).length === 0) return null;

  const record = (records as any[])[0];

  const items = await sql`
    SELECT id, production_record_id as "productionRecordId", spec_id as "specId", size, quantity
    FROM production_items
    WHERE production_record_id = ${id}
  `;

  return {
    ...record,
    items: items as ProductionItem[]
  } as ProductionRecord;
}

export async function createProductionRecord(data: Omit<ProductionRecord, 'id' | 'createdAt'>): Promise<ProductionRecord> {
  const result = await sql`
    INSERT INTO production_records (date, worker_id, worker_name, type, remark)
    VALUES (${data.date}, ${data.workerId}, ${data.workerName}, ${data.type}, ${data.remark})
    RETURNING id, date, worker_id as "workerId", worker_name as "workerName", type, remark, created_at as "createdAt"
  `;

  const record = (result as any[])[0];

  const createdItems: ProductionItem[] = [];
  for (const item of data.items) {
    const itemResult = await sql`
      INSERT INTO production_items (production_record_id, spec_id, size, quantity)
      VALUES (${record.id}, ${item.specId}, ${item.size}, ${item.quantity})
      RETURNING id, spec_id as "specId", size, quantity
    `;
    createdItems.push((itemResult as any[])[0]);
  }

  return {
    ...record,
    items: createdItems
  } as ProductionRecord;
}

export async function updateProductionRecord(id: string, data: Partial<ProductionRecord>): Promise<ProductionRecord | null> {
  const current = await sql`
    SELECT * FROM production_records WHERE id = ${id}
  `;
  if ((current as any[]).length === 0) return null;

  const currentData = (current as any[])[0];
  const newDate = data.date ?? currentData.date;
  const newWorkerId = data.workerId ?? currentData.worker_id;
  const newWorkerName = data.workerName ?? currentData.worker_name;
  const newType = data.type ?? currentData.type;
  const newRemark = data.remark ?? currentData.remark;

  await sql`
    UPDATE production_records
    SET date = ${newDate}, worker_id = ${newWorkerId}, worker_name = ${newWorkerName},
        type = ${newType}, remark = ${newRemark}
    WHERE id = ${id}
  `;

  return getProductionRecordById(id);
}

export async function deleteProductionRecord(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM production_records WHERE id = ${id}
  `;
  return (result as any).count > 0;
}
