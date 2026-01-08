'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User } from '@/lib/types';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check auth on mount and path change
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  // Don't show navbar on login page? Or just show minimal
  if (pathname === '/login') {
    return (
      <nav className="bg-gray-800 p-4 text-white">
        <div className="container mx-auto flex justify-center">
          <h1 className="text-xl font-bold">REMISIONES JC LIDER MUNDIAL <span className="text-xs font-normal text-gray-400">v1.1</span></h1>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
        <h1 className="text-xl font-bold">REMISIONES JC LIDER MUNDIAL <span className="text-xs font-normal text-gray-400">v1.2</span></h1>
        
        {user && (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="space-x-4 flex items-center">
              <Link href="/" className={`hover:text-gray-300 ${pathname === '/' ? 'text-blue-400' : ''}`}>Venta</Link>
              <Link href="/sales" className={`hover:text-gray-300 ${pathname === '/sales' ? 'text-blue-400' : ''}`}>Listado</Link>
              <Link href="/products" className={`hover:text-gray-300 ${pathname === '/products' ? 'text-blue-400' : ''}`}>Productos</Link>
              <Link href="/customers" className={`hover:text-gray-300 ${pathname === '/customers' ? 'text-blue-400' : ''}`}>Clientes</Link>
              
              {user.role === 'admin' && (
                <Link href="/users" className={`hover:text-gray-300 ${pathname === '/users' ? 'text-blue-400' : ''}`}>Usuarios</Link>
              )}
            </div>
            
            <div className="flex items-center gap-4 pl-4 border-l border-gray-600">
              <div className="text-sm text-right hidden sm:block">
                <div className="font-semibold">{user.email}</div>
                <div className="text-xs text-gray-400">Almacén: {user.numeroalmacen}</div>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
              >
                Salir
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
