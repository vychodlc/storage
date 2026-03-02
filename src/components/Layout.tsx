'use client';

import React, { useState, useEffect } from 'react';
import { ProLayout, PageContainer } from '@ant-design/pro-components';
import {
  DashboardOutlined,
  DatabaseOutlined,
  InboxOutlined,
  ThunderboltOutlined,
  ShoppingOutlined,
  UserOutlined,
  CalendarOutlined,
  AccountBookOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

const menuData = [
  {
    path: '/',
    name: '仪表盘',
    icon: <DashboardOutlined />,
  },
  {
    path: '/base-data',
    name: '基础数据',
    icon: <DatabaseOutlined />,
    children: [
      { path: '/base-data/bamboo-specs', name: '竹丝规格' },
      { path: '/base-data/chopstick-specs', name: '竹筷规格' },
      { path: '/base-data/bom', name: 'BOM对应关系' },
    ],
  },
  {
    path: '/purchase',
    name: '进货管理',
    icon: <InboxOutlined />,
    children: [
      { path: '/purchase/suppliers', name: '供应商管理' },
      { path: '/purchase/drivers', name: '进货司机管理' },
      { path: '/purchase/orders', name: '进货单管理' },
      { path: '/purchase/transactions', name: '进货流水' },
    ],
  },
  {
    path: '/inventory',
    name: '库存管理',
    icon: <InboxOutlined />,
    children: [
      { path: '/inventory/bamboo', name: '竹丝库存' },
      { path: '/inventory/chopsticks', name: '竹筷库存' },
    ],
  },
  {
    path: '/production',
    name: '生产管理',
    icon: <ThunderboltOutlined />,
    children: [
      { path: '/production/records', name: '生产记录' },
    ],
  },
  {
    path: '/sales',
    name: '出货管理',
    icon: <ShoppingOutlined />,
    children: [
      { path: '/sales/customers', name: '客户管理' },
      { path: '/sales/orders', name: '出货单管理' },
      { path: '/sales/transactions', name: '出货流水' },
    ],
  },
  {
    path: '/workers',
    name: '工人管理',
    icon: <UserOutlined />,
    children: [
      { path: '/workers/drivers', name: '司机工管理' },
      { path: '/workers/normal', name: '普通工人管理' },
      { path: '/workers/temporary', name: '临时工管理' },
      { path: '/workers/temporary-records', name: '临时工工作记录' },
    ],
  },
  {
    path: '/attendance',
    name: '出勤管理',
    icon: <CalendarOutlined />,
  },
  {
    path: '/transactions',
    name: '流水表',
    icon: <AccountBookOutlined />,
  },
  {
    path: '/settings',
    name: '系统设置',
    icon: <SettingOutlined />,
  },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div style={{ height: '100vh' }}>
      <ProLayout
        siderWidth={216}
        title="古楼山竹筷厂"
        logo={<></>}
        route={{
          path: '/',
          routes: menuData,
        }}
        location={{
          pathname,
        }}
        avatarProps={{
          title: '管理员',
          size: 'small',
        }}
        onMenuHeaderClick={() => router.push('/')}
        menuItemRender={(item, dom) => (
          <div
            onClick={() => {
              if (item.path) {
                router.push(item.path);
              }
            }}
          >
            {dom}
          </div>
        )}
      >
        <PageContainer>
          {children}
        </PageContainer>
      </ProLayout>
    </div>
  );
}
