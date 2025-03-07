import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware pour gérer la page de transition
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Si l'utilisateur visite la page de transition, vérifier le comportement attendu dans les cookies
  if (pathname === '/transition') {
    // Cette page est destinée à l'affichage de la transition uniquement
    // Normalement, le JavaScript côté client devrait rediriger automatiquement
    const response = NextResponse.next();
    return response;
  }
  
  return NextResponse.next();
}

// Spécifie sur quels chemins le middleware sera exécuté
export const config = {
  matcher: ['/transition'],
}; 