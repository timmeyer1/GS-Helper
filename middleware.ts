// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

// Routes qui nécessitent une authentification
const protectedRoutes = [
  '/games/create',
  '/profile',
];

// Routes d'authentification
const authRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
];

export function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url);
  
  // Vérifier si la route nécessite une authentification
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Vérifier si la route est une route d'authentification
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  // Récupérer le token d'authentification
  const authToken = request.cookies.get('auth-token')?.value;
  
  // Si l'utilisateur est sur une route protégée et n'est pas authentifié
  if (isProtectedRoute && !authToken) {
    // Rediriger vers la page de connexion
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // Si l'utilisateur est authentifié et essaie d'accéder à une route d'authentification
  if (isAuthRoute && authToken) {
    try {
      // Vérifier le token
      verify(authToken, process.env.JWT_SECRET || 'your-secret-key');
      
      // Rediriger vers la page d'accueil
      return NextResponse.redirect(new URL('/', request.url));
    } catch (error) {
      // Si le token est invalide, continuer
    }
  }
  
  return NextResponse.next();
}

// Configuration pour le middleware - spécifier sur quelles routes il s'applique
export const config = {
  matcher: [
    // Routes protégées
    '/games/create',
    '/profile',
    
    // Routes d'authentification
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
  ],
};