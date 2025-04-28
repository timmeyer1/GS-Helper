import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth?.token;

    // Si l'utilisateur est déjà connecté
    if (token) {
      // Si la page est login ou register, on le redirige
      if (pathname === '/login' || pathname === '/register') {
        return NextResponse.redirect(new URL('/', req.url)); // Redirige vers la home ou dashboard
      }
      
      // Protection des routes admin - vérification si l'utilisateur est admin
      if (pathname.startsWith('/admin') && !token.isAdmin) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    } else {
      // Si non connecté et tente d'accéder à une route protégée
      if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Active la récupération du token pour toutes les routes
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ['/login', '/register', '/admin/:path*'], // Ajout des routes admin à protéger
};