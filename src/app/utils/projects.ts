import { translations } from '../translations';

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription?: string;
  category: string;
  coverImage: string;
  thumbnailImage: string;
  gallery?: string[];
  media?: { path: string; description?: string; category?: string }[];
  featured?: boolean;
  date?: string;
  projectType?: string;
  tools?: string[];
  stats?: Record<string, string>; // Propriété facultative pour la rétrocompatibilité
}

// Structure de données pour les projets
const projectsData: Record<string, Record<string, Project>> = {
  en: {
    // Tous les projets placeholders ont été supprimés
  },
  fr: {
    // Tous les projets placeholders ont été supprimés
  },
};

// Récupérer tous les projets pour une langue donnée
export const getAllProjects = (lang: string = 'fr'): Project[] => {
  const language = lang in projectsData ? lang : 'fr';
  return Object.values(projectsData[language]);
};

// Récupérer un projet par son slug
export const getProjectBySlug = async (slug: string, language: string = 'fr'): Promise<Project | null> => {
  try {
    // D'abord, essayer de récupérer depuis l'API (projets dynamiques)
    const apiUrl = `/api/admin/projects?slug=${slug}&language=${language}`;
    const response = await fetch(apiUrl, {
      cache: 'no-store'
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.projects && data.projects.length > 0) {
        const project = data.projects[0];
        
        // Convertir gallery en media si media n'existe pas
        if (!project.media && project.gallery) {
          project.media = project.gallery.map((path: string) => ({
            path,
            description: ''
          }));
        }
        
        return project;
      }
    }
    
    // Si non trouvé dans l'API, chercher dans les données statiques
    const lang = language === 'en' ? 'en' : 'fr';
    const projects = Object.values(projectsData[lang]);
    const project = projects.find(project => project.slug === slug);
    
    if (project) {
      // Convertir gallery en media si media n'existe pas
      if (!project.media && project.gallery) {
        project.media = project.gallery.map(path => ({
          path,
          description: ''
        }));
      }
      return { ...project };
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération du projet:", error);
    return null;
  }
};

// Récupérer les projets mis en avant
export const getFeaturedProjects = (lang: string = 'fr'): Project[] => {
  const language = lang in projectsData ? lang : 'fr';
  return Object.values(projectsData[language]).filter(project => project.featured);
};

// Récupérer les projets par catégorie
export const getProjectsByCategory = (category: string, lang: string = 'fr'): Project[] => {
  const language = lang in projectsData ? lang : 'fr';
  if (category === 'all') {
    return Object.values(projectsData[language]);
  }
  return Object.values(projectsData[language]).filter(
    project => project.category.toLowerCase() === category.toLowerCase()
  );
};

// Ajouter ou mettre à jour un projet
export const addOrUpdateProject = (project: Project, lang: string = 'fr'): void => {
  const language = lang in projectsData ? lang : 'fr';
  projectsData[language][project.id] = { ...project };
};

// Suppression de la fonction migrateProjectsToMediaStructure car elle n'est pas compatible
// avec l'environnement Next.js (problèmes d'importation avec require)
// Utilisez plutôt le script séparé src/scripts/migrateProjects.js pour effectuer la migration 