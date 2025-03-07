"use client";

import { useState, useEffect } from 'react';

// On garde le type mais on ne va utiliser que 'light'
type Theme = 'light' | 'dark';

interface ThemeHook {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

/**
 * Hook pour gérer le thème de l'application (uniquement clair)
 * @returns Un objet contenant le thème actuel et des fonctions pour le manipuler
 */
export const useTheme = (): ThemeHook => {
  // Thème toujours à 'light'
  const [theme, setTheme] = useState<Theme>('light');
  
  // Effet pour initialiser le thème au chargement
  useEffect(() => {
    // Appliquer toujours le thème clair
    applyTheme('light');
    
    // Supprimer le thème du localStorage pour éviter de récupérer 'dark'
    localStorage.removeItem('theme');
  }, []);
  
  // Fonction pour basculer entre les thèmes (ne fait plus rien)
  const toggleTheme = () => {
    console.log("Tentative de changement de thème ignorée, seul le thème clair est disponible");
    // Ne change plus le thème, reste toujours en mode clair
  };
  
  // Fonction pour définir un thème spécifique (force toujours 'light')
  const setThemeAndStore = (newTheme: Theme) => {
    console.log("Tentative de changement de thème ignorée, seul le thème clair est disponible");
    // Force toujours le thème clair
    applyTheme('light');
  };
  
  // Fonction pour appliquer le thème au document
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    // Enlever la classe 'dark' si présente
    root.classList.remove('dark');
    document.body.classList.remove('dark');
    
    // Configurer les couleurs pour le thème clair
    document.body.style.backgroundColor = '#F5F5F0';
    document.body.style.color = '#0D1117';
    root.style.setProperty('--background', '#F5F5F0');
    root.style.setProperty('--foreground', '#0D1117');
    root.style.setProperty('--text-gray', '#4A4A4A');
  };
  
  return { theme, toggleTheme, setTheme: setThemeAndStore };
};

export default useTheme; 