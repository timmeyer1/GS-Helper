import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth?.token;

    // utilisateur connecté
    if (token) {
      // pas besoin d'aller sur login/register si déjà connecté
      if (pathname === '/login' || pathname === '/register') 
        return NextResponse.redirect(new URL('/', req.url));
      // vérif si admin pour routes admin
      if (pathname.startsWith('/admin') && !token.isAdmin) 
        return NextResponse.redirect(new URL('/unauthorized', req.url));
    } else if (pathname.startsWith('/admin')) {
      // redirige vers login en gardant la page de destination
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  },
  { callbacks: { authorized: () => true } } // on laisse passer tout le monde, la logique est dans le middleware
);

export const config = {
  matcher: ['/login', '/register', '/admin/:path*'], // routes à surveiller
};