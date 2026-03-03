'use client';

import AppLayout from '@/components/Layout';
import { App } from 'antd';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <App>
      <AppLayout>{children}</AppLayout>
    </App>
  );
}
