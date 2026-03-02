'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PurchaseIndex() {
  const router = useRouter();

  useEffect(() => {
    router.push('/purchase/orders');
  }, [router]);

  return null;
}
