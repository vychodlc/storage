'use server';

import { sql } from '@/lib/db';
import type { PurchaseOrder, PurchaseItem, Payment } from '@/types';

// ============ 进货单操作 ============

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  const orders = await sql`
    SELECT id, order_no as "orderNo", order_date as "orderDate", supplier_id as "supplierId",
           supplier_name as "supplierName", driver_id as "driverId", driver_name as "driverName",
           total_amount as "totalAmount", paid_amount as "paidAmount", status, remark,
           created_at as "createdAt", updated_at as "updatedAt"
    FROM purchase_orders
    ORDER BY order_date DESC, created_at DESC
  `;

  const orderIds = (orders as any[]).map(o => o.id);
  if (orderIds.length === 0) return orders as PurchaseOrder[];

  const items = await sql`
    SELECT id, purchase_order_id as "purchaseOrderId", bamboo_spec_id as "bambooSpecId",
           size, bundles, unit_price as "unitPrice", amount, remark
    FROM purchase_items
    WHERE purchase_order_id IN (${orderIds.join(',')})
  `;

  const payments = await sql`
    SELECT id, order_id as "orderId", order_type as "orderType", amount,
           payment_date as "paymentDate", remark, created_at as "createdAt"
    FROM payments
    WHERE order_id IN (${orderIds.join(',')}) AND order_type = 'purchase'
  `;

  return (orders as any[]).map(order => ({
    ...order,
    items: (items as any[]).filter(i => i.purchaseOrderId === order.id),
    payments: (payments as any[]).filter(p => p.orderId === order.id)
  })) as PurchaseOrder[];
}

export async function getPurchaseOrderById(id: string): Promise<PurchaseOrder | null> {
  const orders = await sql`
    SELECT id, order_no as "orderNo", order_date as "orderDate", supplier_id as "supplierId",
           supplier_name as "supplierName", driver_id as "driverId", driver_name as "driverName",
           total_amount as "totalAmount", paid_amount as "paidAmount", status, remark,
           created_at as "createdAt", updated_at as "updatedAt"
    FROM purchase_orders
    WHERE id = ${id}
  `;

  if ((orders as any[]).length === 0) return null;

  const order = (orders as any[])[0];

  const items = await sql`
    SELECT id, purchase_order_id as "purchaseOrderId", bamboo_spec_id as "bambooSpecId",
           size, bundles, unit_price as "unitPrice", amount, remark
    FROM purchase_items
    WHERE purchase_order_id = ${id}
  `;

  const payments = await sql`
    SELECT id, order_id as "orderId", order_type as "orderType", amount,
           payment_date as "paymentDate", remark, created_at as "createdAt"
    FROM payments
    WHERE order_id = ${id} AND order_type = 'purchase'
  `;

  return {
    ...order,
    items: items as PurchaseItem[],
    payments: payments as Payment[]
  } as PurchaseOrder;
}

export async function createPurchaseOrder(data: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<PurchaseOrder> {
  const result = await sql`
    INSERT INTO purchase_orders (order_no, order_date, supplier_id, supplier_name, driver_id, driver_name, total_amount, paid_amount, status, remark)
    VALUES (${data.orderNo}, ${data.orderDate}, ${data.supplierId}, ${data.supplierName}, ${data.driverId}, ${data.driverName}, ${data.totalAmount}, ${data.paidAmount}, ${data.status}, ${data.remark})
    RETURNING id, order_no as "orderNo", order_date as "orderDate", supplier_id as "supplierId",
              supplier_name as "supplierName", driver_id as "driverId", driver_name as "driverName",
              total_amount as "totalAmount", paid_amount as "paidAmount", status, remark,
              created_at as "createdAt", updated_at as "updatedAt"
  `;

  const order = (result as any[])[0];

  const createdItems: PurchaseItem[] = [];
  for (const item of data.items) {
    const itemResult = await sql`
      INSERT INTO purchase_items (purchase_order_id, bamboo_spec_id, size, bundles, unit_price, amount, remark)
      VALUES (${order.id}, ${item.bambooSpecId}, ${item.size}, ${item.bundles}, ${item.unitPrice}, ${item.amount}, ${item.remark})
      RETURNING id, bamboo_spec_id as "bambooSpecId", size, bundles, unit_price as "unitPrice", amount, remark
    `;
    createdItems.push((itemResult as any[])[0]);
  }

  const createdPayments: Payment[] = [];
  for (const payment of data.payments || []) {
    const paymentResult = await sql`
      INSERT INTO payments (order_id, order_type, amount, payment_date, remark)
      VALUES (${order.id}, 'purchase', ${payment.amount}, ${payment.paymentDate}, ${payment.remark})
      RETURNING id, order_id as "orderId", order_type as "orderType", amount, payment_date as "paymentDate", remark, created_at as "createdAt"
    `;
    createdPayments.push((paymentResult as any[])[0]);
  }

  return {
    ...order,
    items: createdItems,
    payments: createdPayments
  } as PurchaseOrder;
}

export async function updatePurchaseOrder(id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> {
  const current = await sql`
    SELECT * FROM purchase_orders WHERE id = ${id}
  `;
  if ((current as any[]).length === 0) return null;

  const currentData = (current as any[])[0];
  const newOrderNo = data.orderNo ?? currentData.order_no;
  const newOrderDate = data.orderDate ?? currentData.order_date;
  const newSupplierId = data.supplierId ?? currentData.supplier_id;
  const newSupplierName = data.supplierName ?? currentData.supplier_name;
  const newDriverId = data.driverId ?? currentData.driver_id;
  const newDriverName = data.driverName ?? currentData.driver_name;
  const newTotalAmount = data.totalAmount ?? currentData.total_amount;
  const newPaidAmount = data.paidAmount ?? currentData.paid_amount;
  const newStatus = data.status ?? currentData.status;
  const newRemark = data.remark ?? currentData.remark;

  await sql`
    UPDATE purchase_orders
    SET order_no = ${newOrderNo}, order_date = ${newOrderDate}, supplier_id = ${newSupplierId},
        supplier_name = ${newSupplierName}, driver_id = ${newDriverId}, driver_name = ${newDriverName},
        total_amount = ${newTotalAmount}, paid_amount = ${newPaidAmount}, status = ${newStatus}, remark = ${newRemark}
    WHERE id = ${id}
  `;

  return getPurchaseOrderById(id);
}

export async function addPurchasePayment(orderId: string, payment: Omit<Payment, 'id' | 'orderId' | 'orderType' | 'createdAt'>): Promise<Payment> {
  const result = await sql`
    INSERT INTO payments (order_id, order_type, amount, payment_date, remark)
    VALUES (${orderId}, 'purchase', ${payment.amount}, ${payment.paymentDate}, ${payment.remark})
    RETURNING id, order_id as "orderId", order_type as "orderType", amount, payment_date as "paymentDate", remark, created_at as "createdAt"
  `;

  await sql`
    UPDATE purchase_orders
    SET paid_amount = paid_amount + ${payment.amount}
    WHERE id = ${orderId}
  `;

  return (result as Payment[])[0];
}

export async function deletePurchaseOrder(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM purchase_orders WHERE id = ${id}
  `;
  return (result as any).count > 0;
}
