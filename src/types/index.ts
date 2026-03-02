// ============ 基础数据类型 ============

// 竹丝规格
export interface BambooSpec {
  id: string;
  size: string;           // 尺寸，如 "6mm*200mm"
  name: string;           // 规格名称（可选）
  remark: string;         // 备注
  isActive: boolean;      // 是否启用
  createdAt: string;
  updatedAt: string;
}

// 竹筷规格
export interface ChopstickSpec {
  id: string;
  size: string;           // 尺寸
  name: string;           // 规格名称（可选）
  remark: string;         // 备注
  isActive: boolean;      // 是否启用
  createdAt: string;
  updatedAt: string;
}

// BOM对应关系
export interface BOM {
  id: string;
  chopstickSpecId: string;   // 竹筷规格ID
  chopstickSpecSize: string;  // 竹筷规格尺寸
  bambooSpecId: string;       // 竹丝规格ID
  bambooSpecSize: string;      // 竹丝规格尺寸
  bundlesPerBag: number;       // 每袋竹筷需要多少捆竹丝
  remark: string;
  createdAt: string;
  updatedAt: string;
}

// ============ 进货管理类型 ============

// 供应商
export interface Supplier {
  id: string;
  name: string;           // 供应商名称
  contact: string;        // 联系方式
  contactPerson: string;  // 负责人
  address: string;        // 地点
  remark: string;         // 备注
  createdAt: string;
  updatedAt: string;
}

// 进货司机
export interface InboundDriver {
  id: string;
  name: string;           // 司机姓名
  phone: string;          // 联系方式
  isLogistics: boolean;   // 是否为物流
  remark: string;         // 备注
  createdAt: string;
  updatedAt: string;
}

// 付款记录
export interface Payment {
  id: string;
  orderId: string;        // 关联订单ID
  orderType: 'purchase' | 'sales';  // 订单类型
  amount: number;         // 付款金额
  paymentDate: string;    // 付款日期
  remark: string;         // 备注
  createdAt: string;
}

// 进货明细项
export interface PurchaseItem {
  id: string;
  bambooSpecId: string;   // 竹丝规格ID
  size: string;           // 尺寸，如 "6mm*200mm"
  bundles: number;        // 捆数
  unitPrice: number;      // 单价
  amount: number;         // 金额
  remark: string;         // 备注
}

// 进货单
export interface PurchaseOrder {
  id: string;
  orderNo: string;        // 订单号
  orderDate: string;      // 单据日期
  supplierId: string;     // 供应商ID
  supplierName: string;   // 供应商名称
  driverId: string;       // 司机ID
  driverName: string;     // 司机姓名
  items: PurchaseItem[];  // 进货明细
  totalAmount: number;    // 总金额
  paidAmount: number;     // 已付金额
  status: 'pending' | 'partial' | 'completed';  // 付款状态
  payments: Payment[];    // 付款记录
  remark: string;         // 备注
  createdAt: string;
  updatedAt: string;
}

// ============ 库存管理类型 ============

// 竹丝库存
export interface BambooInventory {
  id: string;
  bambooSpecId: string;   // 竹丝规格ID
  size: string;           // 尺寸
  quantity: number;       // 库存数量（捆）
  createdAt: string;
  updatedAt: string;
}

// 竹筷库存
export interface ChopstickInventory {
  id: string;
  chopstickSpecId: string;  // 竹筷规格ID
  size: string;              // 尺寸
  quantity: number;          // 库存数量（袋）
  createdAt: string;
  updatedAt: string;
}

// ============ 出货管理类型 ============

// 客户
export interface Customer {
  id: string;
  name: string;           // 客户名称
  contact: string;        // 联系方式
  contactPerson: string;  // 负责人
  address: string;        // 地点
  remark: string;         // 备注
  createdAt: string;
  updatedAt: string;
}

// 出货明细项
export interface SalesItem {
  id: string;
  chopstickSpecId: string;  // 竹筷规格ID
  size: string;              // 尺寸
  bags: number;              // 袋数
  unitPrice: number;         // 单价
  amount: number;            // 金额
  remark: string;            // 备注
}

// 出货单
export interface SalesOrder {
  id: string;
  orderNo: string;        // 订单号
  orderDate: string;      // 单据日期
  customerId: string;     // 客户ID
  customerName: string;   // 客户名称
  driverName: string;     // 司机姓名（第三方）
  driverPhone: string;    // 司机电话
  plateNumber: string;    // 车牌号
  items: SalesItem[];     // 出货明细
  totalAmount: number;    // 总金额
  paidAmount: number;     // 已付金额
  driverFee: number;      // 司机费用
  status: 'shipped' | 'partial' | 'completed';  // 状态
  payments: Payment[];    // 付款记录
  remark: string;         // 备注
  createdAt: string;
  updatedAt: string;
}

// ============ 工人管理类型 ============

// 工人
export interface Worker {
  id: string;
  name: string;           // 姓名
  type: 'driver' | 'normal' | 'temporary';  // 类型
  phone: string;          // 联系方式
  dailyWage: number;      // 日工资（仅普通工人）
  remark: string;         // 备注
  createdAt: string;
  updatedAt: string;
}

// 临时工工作记录
export interface TemporaryWorkRecord {
  id: string;
  workerId: string;       // 临时工ID
  workerName: string;     // 临时工姓名
  workDate: string;       // 工作日期
  workType: string;       // 工作类型（卸货/上货/其他）
  wage: number;           // 工资
  remark: string;         // 备注
  createdAt: string;
}

// ============ 生产管理类型 ============

// 生产明细项
export interface ProductionItem {
  id: string;
  specId: string;         // 规格ID
  size: string;           // 尺寸
  quantity: number;       // 数量（捆/袋）
}

// 生产记录
export interface ProductionRecord {
  id: string;
  date: string;           // 生产日期
  workerId: string;       // 操作人ID
  workerName: string;     // 操作人姓名
  type: 'consume' | 'produce';  // 类型：消耗/生产
  items: ProductionItem[];
  remark: string;         // 备注
  createdAt: string;
}

// ============ 出勤管理类型 ============

export type AttendanceStatus = 'none' | 'half' | 'full';

// 出勤记录
export interface Attendance {
  id: string;
  workerId: string;       // 工人ID
  workerName: string;     // 工人姓名
  year: number;           // 年份
  month: number;          // 月份
  days: Record<number, AttendanceStatus>;  // 日期 -> 状态
  createdAt: string;
  updatedAt: string;
}

// ============ 流水表类型 ============

export type TransactionType = 'purchase' | 'sales' | 'wage' | 'temporary_wage' | 'driver_fee';
export type TransactionDirection = 'in' | 'out';

// 流水记录
export interface Transaction {
  id: string;
  type: TransactionType;    // 流水类型
  referenceId: string;       // 关联ID
  referenceNo: string;       // 关联单号
  amount: number;            // 金额
  direction: TransactionDirection;  // 收支方向
  date: string;              // 日期
  remark: string;            // 备注
  createdAt: string;
}

// ============ 仪表盘统计类型 ============

export interface DashboardStats {
  todayConsumeBundles: number;    // 今日消耗竹丝（捆）
  todayProduceBags: number;       // 今日生产竹筷（袋）
  monthIncome: number;            // 本月收入
  monthExpense: number;           // 本月支出
  pendingPurchaseCount: number;   // 待付款进货单
  pendingSalesCount: number;      // 待收款出货单
  lowStockBambooCount: number;    // 低库存竹丝规格数
  lowStockChopstickCount: number; // 低库存竹筷规格数
}

export interface MonthlyTrendItem {
  month: string;
  consume: number;
  produce: number;
}

export interface InventoryOverviewItem {
  size: string;
  quantity: number;
  type: 'bamboo' | 'chopstick';
}
