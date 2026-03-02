'use client';

import React, { useState, useEffect } from 'react';
import { ProLayout, PageContainer } from '@ant-design/pro-components';
import {
  DashboardOutlined,
  ThunderboltOutlined,
  InboxOutlined,
  ToolOutlined,
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
    path: '/production',
    name: '生产计划',
    icon: <ThunderboltOutlined />,
  },
  {
    path: '/inventory',
    name: '库存管理',
    icon: <InboxOutlined />,
  },
  {
    path: '/equipment',
    name: '设备管理',
    icon: <ToolOutlined />,
  },
  {
    path: '/settings',
    name: '系统设置',
    icon: <SettingOutlined />,
  },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div style={{ height: '100vh' }}>
      <ProLayout
        siderWidth={216}
        title="Storage管理系统"
        logo="SCM"
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
