'use server';

import { sql } from '@/lib/db';
import {
  bambooSpecs,
  chopstickSpecs,
  suppliers,
  inboundDrivers,
  customers,
  workers,
  bambooInventory,
  chopstickInventory,
} from '@/mock/data';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const idMap = new Map<string, string>();

function getUUID(oldId: string): string {
  if (!idMap.has(oldId)) {
    idMap.set(oldId, generateUUID());
  }
  return idMap.get(oldId)!;
}

export async function initBambooSpecs() {
  for (const spec of bambooSpecs) {
    const newId = getUUID(spec.id);
    await sql`
      INSERT INTO bamboo_specs (id, size, name, remark, is_active, created_at, updated_at)
      VALUES (${newId}, ${spec.size}, ${spec.name}, ${spec.remark}, ${spec.isActive}, ${spec.createdAt}, ${spec.updatedAt})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  return { success: true, count: bambooSpecs.length };
}

export async function initChopstickSpecs() {
  for (const spec of chopstickSpecs) {
    const newId = getUUID(spec.id);
    await sql`
      INSERT INTO chopstick_specs (id, size, name, remark, is_active, created_at, updated_at)
      VALUES (${newId}, ${spec.size}, ${spec.name}, ${spec.remark}, ${spec.isActive}, ${spec.createdAt}, ${spec.updatedAt})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  return { success: true, count: chopstickSpecs.length };
}

export async function initSuppliers() {
  for (const supplier of suppliers) {
    const newId = getUUID(supplier.id);
    await sql`
      INSERT INTO suppliers (id, name, contact, contact_person, address, remark, created_at, updated_at)
      VALUES (${newId}, ${supplier.name}, ${supplier.contact}, ${supplier.contactPerson}, ${supplier.address}, ${supplier.remark}, ${supplier.createdAt}, ${supplier.updatedAt})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  return { success: true, count: suppliers.length };
}

export async function initInboundDrivers() {
  for (const driver of inboundDrivers) {
    const newId = getUUID(driver.id);
    await sql`
      INSERT INTO inbound_drivers (id, name, phone, is_logistics, remark, created_at, updated_at)
      VALUES (${newId}, ${driver.name}, ${driver.phone}, ${driver.isLogistics}, ${driver.remark}, ${driver.createdAt}, ${driver.updatedAt})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  return { success: true, count: inboundDrivers.length };
}

export async function initCustomers() {
  for (const customer of customers) {
    const newId = getUUID(customer.id);
    await sql`
      INSERT INTO customers (id, name, contact, contact_person, address, remark, created_at, updated_at)
      VALUES (${newId}, ${customer.name}, ${customer.contact}, ${customer.contactPerson}, ${customer.address}, ${customer.remark}, ${customer.createdAt}, ${customer.updatedAt})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  return { success: true, count: customers.length };
}

export async function initWorkers() {
  for (const worker of workers) {
    const newId = getUUID(worker.id);
    await sql`
      INSERT INTO workers (id, name, type, phone, daily_wage, remark, created_at, updated_at)
      VALUES (${newId}, ${worker.name}, ${worker.type}, ${worker.phone}, ${worker.dailyWage}, ${worker.remark}, ${worker.createdAt}, ${worker.updatedAt})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  return { success: true, count: workers.length };
}

export async function initBambooInventory() {
  for (const inv of bambooInventory) {
    const newId = getUUID(inv.id);
    const bambooSpecId = getUUID(inv.bambooSpecId);
    await sql`
      INSERT INTO bamboo_inventory (id, bamboo_spec_id, size, quantity, created_at, updated_at)
      VALUES (${newId}, ${bambooSpecId}, ${inv.size}, ${inv.quantity}, ${inv.createdAt}, ${inv.updatedAt})
      ON CONFLICT (bamboo_spec_id) DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = CURRENT_TIMESTAMP
    `;
  }
  return { success: true, count: bambooInventory.length };
}

export async function initChopstickInventory() {
  for (const inv of chopstickInventory) {
    const newId = getUUID(inv.id);
    const chopstickSpecId = getUUID(inv.chopstickSpecId);
    await sql`
      INSERT INTO chopstick_inventory (id, chopstick_spec_id, size, quantity, created_at, updated_at)
      VALUES (${newId}, ${chopstickSpecId}, ${inv.size}, ${inv.quantity}, ${inv.createdAt}, ${inv.updatedAt})
      ON CONFLICT (chopstick_spec_id) DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = CURRENT_TIMESTAMP
    `;
  }
  return { success: true, count: chopstickInventory.length };
}

export async function initAllData() {
  idMap.clear();
  const results = {
    bambooSpecs: await initBambooSpecs(),
    chopstickSpecs: await initChopstickSpecs(),
    suppliers: await initSuppliers(),
    inboundDrivers: await initInboundDrivers(),
    customers: await initCustomers(),
    workers: await initWorkers(),
    bambooInventory: await initBambooInventory(),
    chopstickInventory: await initChopstickInventory(),
  };
  return results;
}
