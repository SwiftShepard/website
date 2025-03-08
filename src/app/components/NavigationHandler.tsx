"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function NavigationHandler() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Fonction pour gérer l'événement popstate (navigation retour/avant)
    const handlePopState = () => {
      // Si nous sommes sur une page de projet et que l'utilisateur navigue en arrière
      if (pathname?.includes('/projects/')) {
        // Plutôt que de forcer un rechargement, on utilise router.refresh()
        // qui demande à Next.js de revalider les données sans rechargement complet
        router.refresh();
      }
    };

    // Ajouter l'écouteur d'événement
    window.addEventListener('popstate', handlePopState);

    // Nettoyer l'écouteur d'événement
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname, router]);

  // Ce composant ne rend rien visuellement
  return null;
} 