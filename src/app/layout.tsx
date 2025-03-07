import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from './context/LanguageContext';
import { CursorProvider } from './context/CursorContext';
import CustomCursor from './components/CustomCursor';

export const metadata: Metadata = {
  title: "Portfolio de Valentin",
  description: "Portfolio de Valentin, développeur et designer 3D",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        {/* Script pour initialiser le thème */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // Récupérer le thème depuis localStorage
                const storedTheme = localStorage.getItem('theme');
                // Vérifier les préférences système
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                
                // Déterminer quel thème appliquer
                const isDark = storedTheme === 'dark' || (!storedTheme && systemPrefersDark);
                
                // Appliquer la classe dark au document si nécessaire
                if (isDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
                
                // Création de l'image par défaut si elle n'existe pas
                function checkDefaultImageExists() {
                  const img = new Image();
                  img.onload = function() {
                    // L'image existe, rien à faire
                  };
                  img.onerror = function() {
                    // L'image n'existe pas, on crée un canvas à la place
                    const defaultImage = document.createElement('link');
                    defaultImage.rel = 'preload';
                    defaultImage.as = 'image';
                    defaultImage.href = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="100%" height="100%" fill="#303030"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">Image non disponible</text></svg>');
                    document.head.appendChild(defaultImage);
                  };
                  img.src = '/images/default-project.jpg';
                }
                
                // Vérifier l'existence de l'image par défaut
                checkDefaultImageExists();
              } catch (e) {
                console.error('Erreur lors de l\'initialisation du thème:', e);
              }
            `,
          }}
        />
      </head>
      <body>
        <LanguageProvider>
          <CursorProvider>
            <CustomCursor />
            {children}
          </CursorProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
