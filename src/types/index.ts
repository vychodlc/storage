// 生产计划类型
export interface ProductionPlan {
  id: string;
  orderNo: string;
  productName: string;
  quantity: number;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  progress: number;
}

// 库存类型
export interface Inventory {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  warehouse: string;
  location: string;
  lastUpdated: string;
}

// 设备类型
export interface Equipment {
  id: string;
  code: string;
  name: string;
  type: string;
  status: 'running' | 'maintenance' | 'idle' | 'fault';
  location: string;
  lastMaintenance: string;
  nextMaintenance: string;
  operator: string;
}

// 仪表盘统计
export interface DashboardStats {
  totalOrders: number;
  completedOrders: number;
  inProgressOrders: number;
  pendingOrders: number;
  totalInventory: number;
  lowStockItems: number;
  equipmentUtilization: number;
  todayProduction: number;
}
