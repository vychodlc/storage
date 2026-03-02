'use server';

import { sql } from '@/lib/db';

export async function testConnection() {
  try {
    const result = await sql`SELECT version()`;
    return { success: true, version: (result as any)[0]?.version };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function initializeDatabase() {
  try {
    return { success: true, message: '请在 Neon SQL Editor 中手动执行 schema.sql' };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// 通用的查询函数
export async function query<T>(queryText: string, params?: any[]): Promise<T[]> {
  if (params && params.length > 0) {
    return sql(queryText, params) as T[];
  }
  return sql(queryText) as T[];
}
