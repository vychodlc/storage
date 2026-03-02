'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SalesIndex() {
  const router = useRouter();

  useEffect(() => {
    router.push('/sales/orders');
  }, [router]);

  return null;
}
