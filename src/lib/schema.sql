-- 古楼山竹筷厂数据库 Schema

-- 竹丝规格表
CREATE TABLE IF NOT EXISTS bamboo_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  size TEXT NOT NULL,
  name TEXT,
  remark TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 竹筷规格表
CREATE TABLE IF NOT EXISTS chopstick_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  size TEXT NOT NULL,
  name TEXT,
  remark TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BOM对应关系表
CREATE TABLE IF NOT EXISTS bom (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chopstick_spec_id UUID NOT NULL REFERENCES chopstick_specs(id) ON DELETE CASCADE,
  chopstick_spec_size TEXT NOT NULL,
  bamboo_spec_id UUID NOT NULL REFERENCES bamboo_specs(id) ON DELETE CASCADE,
  bamboo_spec_size TEXT NOT NULL,
  bundles_per_bag INTEGER NOT NULL,
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 供应商表
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT,
  contact_person TEXT,
  address TEXT,
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 进货司机表
CREATE TABLE IF NOT EXISTS inbound_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  is_logistics BOOLEAN DEFAULT FALSE,
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 进货单表
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no TEXT NOT NULL UNIQUE,
  order_date DATE NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
  supplier_name TEXT NOT NULL,
  driver_id UUID REFERENCES inbound_drivers(id) ON DELETE SET NULL,
  driver_name TEXT,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 进货明细表
CREATE TABLE IF NOT EXISTS purchase_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  bamboo_spec_id UUID REFERENCES bamboo_specs(id) ON DELETE SET NULL,
  size TEXT,
  bundles INTEGER DEFAULT 0,
  unit_price DECIMAL(10, 2) DEFAULT 0,
  amount DECIMAL(10, 2) DEFAULT 0,
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 付款记录表
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  order_type TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 竹丝库存表
CREATE TABLE IF NOT EXISTS bamboo_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bamboo_spec_id UUID NOT NULL REFERENCES bamboo_specs(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(bamboo_spec_id)
);

-- 竹筷库存表
CREATE TABLE IF NOT EXISTS chopstick_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chopstick_spec_id UUID NOT NULL REFERENCES chopstick_specs(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(chopstick_spec_id)
);

-- 客户表
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT,
  contact_person TEXT,
  address TEXT,
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 出货单表
CREATE TABLE IF NOT EXISTS sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no TEXT NOT NULL UNIQUE,
  order_date DATE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  driver_name TEXT,
  driver_phone TEXT,
  plate_number TEXT,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  driver_fee DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'shipped',
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 出货明细表
CREATE TABLE IF NOT EXISTS sales_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  chopstick_spec_id UUID REFERENCES chopstick_specs(id) ON DELETE SET NULL,
  size TEXT,
  bags INTEGER DEFAULT 0,
  unit_price DECIMAL(10, 2) DEFAULT 0,
  amount DECIMAL(10, 2) DEFAULT 0,
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 工人表
CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  phone TEXT,
  daily_wage DECIMAL(10, 2) DEFAULT 0,
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 临时工工作记录表
CREATE TABLE IF NOT EXISTS temporary_work_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  worker_name TEXT NOT NULL,
  work_date DATE NOT NULL,
  work_type TEXT,
  wage DECIMAL(10, 2) DEFAULT 0,
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 生产记录表
CREATE TABLE IF NOT EXISTS production_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  worker_id UUID REFERENCES workers(id) ON DELETE SET NULL,
  worker_name TEXT,
  type TEXT NOT NULL,
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 生产明细项表
CREATE TABLE IF NOT EXISTS production_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_record_id UUID NOT NULL REFERENCES production_records(id) ON DELETE CASCADE,
  spec_id UUID,
  size TEXT,
  quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 出勤记录表
CREATE TABLE IF NOT EXISTS attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  worker_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  days JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(worker_id, year, month)
);

-- 流水记录表
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  reference_id UUID,
  reference_no TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  direction TEXT NOT NULL,
  date DATE NOT NULL,
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要更新时间戳的表创建触发器
CREATE TRIGGER update_bamboo_specs_updated_at BEFORE UPDATE ON bamboo_specs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chopstick_specs_updated_at BEFORE UPDATE ON chopstick_specs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bom_updated_at BEFORE UPDATE ON bom
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inbound_drivers_updated_at BEFORE UPDATE ON inbound_drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bamboo_inventory_updated_at BEFORE UPDATE ON bamboo_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chopstick_inventory_updated_at BEFORE UPDATE ON chopstick_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_orders_updated_at BEFORE UPDATE ON sales_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON workers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendances_updated_at BEFORE UPDATE ON attendances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
