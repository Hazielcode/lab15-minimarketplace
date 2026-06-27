'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User } from '@/types/product';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Leer el usuario desde localStorage al montar el componente
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }

    // Escuchar el evento de login/logout personalizado para actualizar el estado
    const handleAuthChange = () => {
      const updatedUser = localStorage.getItem('user');
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Eliminar Cookies
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    
    setUser(null);
    // Disparar evento para otros componentes
    window.dispatchEvent(new Event('auth-change'));
    router.push('/login');
  };

  return (
    <nav className="bg-slate-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 font-bold text-xl tracking-wider text-teal-400">
              🛍️ MARKETPLACE
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors">
                  Inicio
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link href="/admin" className="px-3 py-2 rounded-md text-sm font-medium bg-red-950 text-red-200 border border-red-800 hover:bg-red-900 transition-colors">
                    Panel Admin
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-teal-200">{user.nombre}</p>
                  <p className="text-xs text-slate-400 capitalize">{user.role.toLowerCase()}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-slate-800 hover:bg-slate-700 text-teal-400 border border-teal-500/20 hover:border-teal-500/40 transition-all"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-md text-sm font-medium bg-teal-500 hover:bg-teal-600 text-slate-900 transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Links */}
      <div className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-slate-800 flex justify-start space-x-2">
        <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-800">
          Inicio
        </Link>
        {user?.role === 'ADMIN' && (
          <Link href="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-red-300 hover:bg-slate-800">
            Panel Admin
          </Link>
        )}
      </div>
    </nav>
  );
}
