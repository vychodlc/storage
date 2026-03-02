import type { Metadata } from 'next';
import './globals.css';
import AppLayout from '@/components/Layout';

export const metadata: Metadata = {
  title: 'Storage 工厂生产管理系统',
  description: '工厂生产管理系统 - 生产计划、库存管理、设备管理',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
