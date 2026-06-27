import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const userCookie = request.cookies.get('user')?.value;

  const { pathname } = request.nextUrl;

  // Proteger la ruta de administración (/admin)
  if (pathname.startsWith('/admin')) {
    if (!token || !userCookie) {
      // Si no está autenticado, redirigir a login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const user = JSON.parse(decodeURIComponent(userCookie));
      if (user.role !== 'ADMIN') {
        // Si no es administrador, redirigir al inicio
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (e) {
      // Cookie corrupta, redirigir a login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Configurar en qué rutas se ejecutará el middleware
export const config = {
  matcher: ['/admin/:path*'],
};
