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

export async function initBambooSpecs() {
  for (const spec of bambooSpecs) {
    await sql`
      INSERT INTO bamboo_specs (id, size, name, remark, is_active, created_at, updated_at)
      VALUES (${spec.id}, ${spec.size}, ${spec.name}, ${spec.remark}, ${spec.isActive}, ${spec.createdAt}, ${spec.updatedAt})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  return { success: true, count: bambooSpecs.length };
}

export async function initChopstickSpecs() {
  for (const spec of chopstickSpecs) {
    await sql`
      INSERT INTO chopstick_specs (id, size, name, remark, is_active, created_at, updated_at)
      VALUES (${spec.id}, ${spec.size}, ${spec.name}, ${spec.remark}, ${spec.isActive}, ${spec.createdAt}, ${spec.updatedAt})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  return { success: true, count: chopstickSpecs.length };
}

export async function initSuppliers() {
  for (const supplier of suppliers) {
    await sql`
      INSERT INTO suppliers (id, name, contact, contact_person, address, remark, created_at, updated_at)
      VALUES (${supplier.id}, ${supplier.name}, ${supplier.contact}, ${supplier.contactPerson}, ${supplier.address}, ${supplier.remark}, ${supplier.createdAt}, ${supplier.updatedAt})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  return { success: true, count: suppliers.length };
}

export async function initInboundDrivers() {
  for (const driver of inboundDrivers) {
    await sql`
      INSERT INTO inbound_drivers (id, name, phone, is_logistics, remark, created_at, updated_at)
      VALUES (${driver.id}, ${driver.name}, ${driver.phone}, ${driver.isLogistics}, ${driver.remark}, ${driver.createdAt}, ${driver.updatedAt})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  return { success: true, count: inboundDrivers.length };
}

export async function initCustomers() {
  for (const customer of customers) {
    await sql`
      INSERT INTO customers (id, name, contact, contact_person, address, remark, created_at, updated_at)
      VALUES (${customer.id}, ${customer.name}, ${customer.contact}, ${customer.contactPerson}, ${customer.address}, ${customer.remark}, ${customer.createdAt}, ${customer.updatedAt})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  return { success: true, count: customers.length };
}

export async function initWorkers() {
  for (const worker of workers) {
    await sql`
      INSERT INTO workers (id, name, type, phone, daily_wage, remark, created_at, updated_at)
      VALUES (${worker.id}, ${worker.name}, ${worker.type}, ${worker.phone}, ${worker.dailyWage}, ${worker.remark}, ${worker.createdAt}, ${worker.updatedAt})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  return { success: true, count: workers.length };
}

export async function initBambooInventory() {
  for (const inv of bambooInventory) {
    await sql`
      INSERT INTO bamboo_inventory (id, bamboo_spec_id, size, quantity, created_at, updated_at)
      VALUES (${inv.id}, ${inv.bambooSpecId}, ${inv.size}, ${inv.quantity}, ${inv.createdAt}, ${inv.updatedAt})
      ON CONFLICT (bamboo_spec_id) DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = CURRENT_TIMESTAMP
    `;
  }
  return { success: true, count: bambooInventory.length };
}

export async function initChopstickInventory() {
  for (const inv of chopstickInventory) {
    await sql`
      INSERT INTO chopstick_inventory (id, chopstick_spec_id, size, quantity, created_at, updated_at)
      VALUES (${inv.id}, ${inv.chopstickSpecId}, ${inv.size}, ${inv.quantity}, ${inv.createdAt}, ${inv.updatedAt})
      ON CONFLICT (chopstick_spec_id) DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = CURRENT_TIMESTAMP
    `;
  }
  return { success: true, count: chopstickInventory.length };
}

export async function initAllData() {
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
