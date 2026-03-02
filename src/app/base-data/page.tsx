'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BaseDataIndex() {
  const router = useRouter();

  useEffect(() => {
    router.push('/base-data/bamboo-specs');
  }, [router]);

  return null;
}
