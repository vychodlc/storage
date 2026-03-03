'use server';

import { sql } from '@/lib/db';
import type { SalesOrder, SalesItem, Payment } from '@/types';

// ============ 出货单操作 ============

export async function getSalesOrders(): Promise<SalesOrder[]> {
  const orders = await sql`
    SELECT id, order_no as "orderNo", order_date as "orderDate", customer_id as "customerId",
           customer_name as "customerName", driver_name as "driverName", driver_phone as "driverPhone",
           plate_number as "plateNumber", total_amount as "totalAmount", paid_amount as "paidAmount",
           driver_fee as "driverFee", status, remark, created_at as "createdAt", updated_at as "updatedAt"
    FROM sales_orders
    ORDER BY order_date DESC, created_at DESC
  `;

  const orderIds = (orders as any[]).map(o => o.id);
  if (orderIds.length === 0) return orders as SalesOrder[];

  const items = await sql`
    SELECT id, sales_order_id as "salesOrderId", chopstick_spec_id as "chopstickSpecId",
           size, bags, unit_price as "unitPrice", amount, remark
    FROM sales_items
    WHERE sales_order_id IN (${orderIds.join(',')})
  `;

  const payments = await sql`
    SELECT id, order_id as "orderId", order_type as "orderType", amount,
           payment_date as "paymentDate", remark, created_at as "createdAt"
    FROM payments
    WHERE order_id IN (${orderIds.join(',')}) AND order_type = 'sales'
  `;

  return (orders as any[]).map(order => ({
    ...order,
    items: (items as any[]).filter(i => i.salesOrderId === order.id),
    payments: (payments as any[]).filter(p => p.orderId === order.id)
  })) as SalesOrder[];
}

export async function getSalesOrderById(id: string): Promise<SalesOrder | null> {
  const orders = await sql`
    SELECT id, order_no as "orderNo", order_date as "orderDate", customer_id as "customerId",
           customer_name as "customerName", driver_name as "driverName", driver_phone as "driverPhone",
           plate_number as "plateNumber", total_amount as "totalAmount", paid_amount as "paidAmount",
           driver_fee as "driverFee", status, remark, created_at as "createdAt", updated_at as "updatedAt"
    FROM sales_orders
    WHERE id = ${id}
  `;

  if ((orders as any[]).length === 0) return null;

  const order = (orders as any[])[0];

  const items = await sql`
    SELECT id, sales_order_id as "salesOrderId", chopstick_spec_id as "chopstickSpecId",
           size, bags, unit_price as "unitPrice", amount, remark
    FROM sales_items
    WHERE sales_order_id = ${id}
  `;

  const payments = await sql`
    SELECT id, order_id as "orderId", order_type as "orderType", amount,
           payment_date as "paymentDate", remark, created_at as "createdAt"
    FROM payments
    WHERE order_id = ${id} AND order_type = 'sales'
  `;

  return {
    ...order,
    items: items as SalesItem[],
    payments: payments as Payment[]
  } as SalesOrder;
}

export async function createSalesOrder(data: Omit<SalesOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<SalesOrder> {
  const result = await sql`
    INSERT INTO sales_orders (order_no, order_date, customer_id, customer_name, driver_name, driver_phone, plate_number, total_amount, paid_amount, driver_fee, status, remark)
    VALUES (${data.orderNo}, ${data.orderDate}, ${data.customerId}, ${data.customerName}, ${data.driverName}, ${data.driverPhone}, ${data.plateNumber}, ${data.totalAmount}, ${data.paidAmount}, ${data.driverFee}, ${data.status}, ${data.remark})
    RETURNING id, order_no as "orderNo", order_date as "orderDate", customer_id as "customerId",
              customer_name as "customerName", driver_name as "driverName", driver_phone as "driverPhone",
              plate_number as "plateNumber", total_amount as "totalAmount", paid_amount as "paidAmount",
              driver_fee as "driverFee", status, remark, created_at as "createdAt", updated_at as "updatedAt"
  `;

  const order = (result as any[])[0];

  const createdItems: SalesItem[] = [];
  for (const item of data.items) {
    const itemResult = await sql`
      INSERT INTO sales_items (sales_order_id, chopstick_spec_id, size, bags, unit_price, amount, remark)
      VALUES (${order.id}, ${item.chopstickSpecId}, ${item.size}, ${item.bags}, ${item.unitPrice}, ${item.amount}, ${item.remark})
      RETURNING id, chopstick_spec_id as "chopstickSpecId", size, bags, unit_price as "unitPrice", amount, remark
    `;
    createdItems.push((itemResult as any[])[0]);
  }

  const createdPayments: Payment[] = [];
  for (const payment of data.payments || []) {
    const paymentResult = await sql`
      INSERT INTO payments (order_id, order_type, amount, payment_date, remark)
      VALUES (${order.id}, 'sales', ${payment.amount}, ${payment.paymentDate}, ${payment.remark})
      RETURNING id, order_id as "orderId", order_type as "orderType", amount, payment_date as "paymentDate", remark, created_at as "createdAt"
    `;
    createdPayments.push((paymentResult as any[])[0]);
  }

  return {
    ...order,
    items: createdItems,
    payments: createdPayments
  } as SalesOrder;
}

export async function updateSalesOrder(id: string, data: Partial<SalesOrder>): Promise<SalesOrder | null> {
  const current = await sql`
    SELECT * FROM sales_orders WHERE id = ${id}
  `;
  if ((current as any[]).length === 0) return null;

  const currentData = (current as any[])[0];
  const newOrderNo = data.orderNo ?? currentData.order_no;
  const newOrderDate = data.orderDate ?? currentData.order_date;
  const newCustomerId = data.customerId ?? currentData.customer_id;
  const newCustomerName = data.customerName ?? currentData.customer_name;
  const newDriverName = data.driverName ?? currentData.driver_name;
  const newDriverPhone = data.driverPhone ?? currentData.driver_phone;
  const newPlateNumber = data.plateNumber ?? currentData.plate_number;
  const newTotalAmount = data.totalAmount ?? currentData.total_amount;
  const newPaidAmount = data.paidAmount ?? currentData.paid_amount;
  const newDriverFee = data.driverFee ?? currentData.driver_fee;
  const newStatus = data.status ?? currentData.status;
  const newRemark = data.remark ?? currentData.remark;

  await sql`
    UPDATE sales_orders
    SET order_no = ${newOrderNo}, order_date = ${newOrderDate}, customer_id = ${newCustomerId},
        customer_name = ${newCustomerName}, driver_name = ${newDriverName}, driver_phone = ${newDriverPhone},
        plate_number = ${newPlateNumber}, total_amount = ${newTotalAmount}, paid_amount = ${newPaidAmount},
        driver_fee = ${newDriverFee}, status = ${newStatus}, remark = ${newRemark}
    WHERE id = ${id}
  `;

  return getSalesOrderById(id);
}

export async function addSalesPayment(orderId: string, payment: Omit<Payment, 'id' | 'orderId' | 'orderType' | 'createdAt'>): Promise<Payment> {
  const result = await sql`
    INSERT INTO payments (order_id, order_type, amount, payment_date, remark)
    VALUES (${orderId}, 'sales', ${payment.amount}, ${payment.paymentDate}, ${payment.remark})
    RETURNING id, order_id as "orderId", order_type as "orderType", amount, payment_date as "paymentDate", remark, created_at as "createdAt"
  `;

  await sql`
    UPDATE sales_orders
    SET paid_amount = paid_amount + ${payment.amount}
    WHERE id = ${orderId}
  `;

  return (result as Payment[])[0];
}

export async function deleteSalesOrder(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM sales_orders WHERE id = ${id}
  `;
  return (result as any).count > 0;
}
