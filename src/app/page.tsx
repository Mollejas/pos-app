'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import POSInterface from '@/components/POSInterface';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) return null; // o un spinner

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">VENTA</h1>
      <POSInterface />
    </div>
  );
}
