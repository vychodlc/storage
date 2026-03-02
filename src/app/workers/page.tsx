'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WorkersIndex() {
  const router = useRouter();

  useEffect(() => {
    router.push('/workers/normal');
  }, [router]);

  return null;
}
