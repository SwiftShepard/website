"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import Image from 'next/image';
import Link from 'next/link';
import { ToolLogo } from '../assets/tools/index';

// Définir le type Project directement dans ce fichier
interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  thumbnailImage?: string;
  coverImage?: string;
  isFeatured?: boolean;
  tools?: string[];
  type?: string;
  summary?: string;
  [key: string]: any;
}

interface ProjectCardProps {
  project: Project;
  translations: any;
}

const ProjectCard = ({ project, translations }: ProjectCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);
  
  // Animation d'entrée
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  // Fonction pour gérer la navigation avec transition
  const handleProjectClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("CLICK DÉTECTÉ SUR LA TILE:", project.title);
    
    try {
      // 1. Stocker l'URL de destination dans localStorage
      const destination = `/projects/${project.slug}`;
      
      // 2. Stocker des métadonnées pour optimiser le temps de chargement
      const projectMeta = {
        url: destination,
        title: project.title,
        category: project.category,
        timestamp: Date.now(),
        // Ajoutez d'autres métadonnées nécessaires
      };
      localStorage.setItem('nextPageUrl', destination);
      localStorage.setItem('projectMeta', JSON.stringify(projectMeta));
      console.log("URL stockée dans localStorage:", destination);
      
      // 3. Créer et ajouter un style temporaire pour l'effet de transition
      const styleEl = document.createElement('style');
      styleEl.id = 'transition-style';
      styleEl.innerHTML = `
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--transition-bg-color, #F5F5F0);
          z-index: 9999;
          opacity: 0;
          transition: opacity 0.27s ease;
        }
        body.transitioning::before {
          opacity: 1;
        }
      `;
      document.head.appendChild(styleEl);
      
      // 4. Ajouter la classe de transition et attendre qu'elle soit visible
      setTimeout(() => {
        // Définir explicitement la couleur de transition
        document.documentElement.style.setProperty('--transition-bg-color', '#F5F5F0');
        document.body.classList.add('transitioning');
        document.body.classList.add('page-transition-out');
        
        // 5. Commencer à précharger l'image en arrière-plan
        if (project.coverImage) {
          // Utiliser l'API native du navigateur, pas le composant Next.js Image
          const img = document.createElement('img');
          img.src = project.coverImage;
          // Cacher l'image préchargée
          img.style.display = 'none';
          img.onload = () => console.log("Image préchargée avec succès:", project.coverImage);
          img.onerror = () => console.error("Erreur lors du préchargement de l'image:", project.coverImage);
          document.body.appendChild(img);
          // Nettoyer après le préchargement
          setTimeout(() => {
            if (document.body.contains(img)) {
              document.body.removeChild(img);
            }
          }, 1000);
          console.log("Démarrage du préchargement de l'image:", project.coverImage);
        }
        
        // 6. Naviguer vers la page de transition après un court délai
        setTimeout(() => {
          console.log("Redirection vers /transition");
          window.location.href = "/transition";
        }, 150);
      }, 50);
    } catch (error) {
      console.error("Erreur lors de la navigation:", error);
      // En cas d'erreur, rediriger directement vers la page du projet
      window.location.href = `/projects/${project.slug}`;
    }
  };

  // Version courte de la description pour l'affichage
  const shortDescription = project.summary || 
    (project.description ? 
      (project.description.length > 80 ? 
        project.description.substring(0, 80) + '...' : 
        project.description) : 
      '');
  
  return (
    <a 
      ref={cardRef}
      href={`/projects/${project.slug}`}
      className={`relative group overflow-hidden rounded-xl shadow-md border border-[#C8C8C8]/30 transition-all duration-500 hover:scale-[1.02] bg-[#F5F5F0] cursor-pointer block transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
      style={{ transitionDelay: '150ms' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleProjectClick}
    >
      {/* Badge de catégorie */}
      <div className="absolute top-3 left-3 z-20">
        <span className="px-3 py-1 text-xs font-semibold bg-[var(--badge-accent)] text-[var(--text-on-accent)] rounded-full shadow-md transform transition-transform duration-300 group-hover:scale-110">
          {project.category}
        </span>
      </div>
      
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={project.coverImage || '/images/default-project.jpg'} 
          alt={project.title} 
          className={`w-full h-full object-cover object-center transition-all duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/default-project.jpg';
          }}
        />
        
        {/* Effet de dégradé au survol - seulement en bas pour le texte */}
        <div className={`absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/85 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-90' : 'opacity-80'}`}>
        </div>
      </div>
      
      {/* Contenu de la carte avec meilleur contraste */}
      <div className="p-5 relative bg-[#F5F5F0]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[#FF3333] transition-colors">
            {project.title}
          </h3>
          <span className="text-xs px-2 py-1 bg-[#E8E8E2] rounded-full text-[var(--text-secondary)] font-medium border border-[#DEDEDE]">
            {project.type || 'Project'}
          </span>
        </div>
        
        <p className="text-[15px] text-[var(--text-secondary)] mb-4 line-clamp-2 group-hover:text-[var(--text-primary)] transition-colors">
          {shortDescription}
        </p>
        
        {/* Affichage des logos des outils avec meilleur contraste */}
        {project.tools && project.tools.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tools.map((tool: string, index: number) => (
              <div 
                key={index} 
                className="flex items-center bg-[#E8E8E2] px-3 py-1.5 rounded-md hover:bg-[#DEDEDE] transition-all border border-[#D8D8D8] shadow-sm" 
                title={tool}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <ToolLogo toolName={tool} className="w-4 h-4 mr-2" />
                <span className="text-xs font-medium text-[#444]">{tool}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Animation de slide pour la flèche et "voir les détails" */}
        <div className="overflow-visible mt-2 relative">
          <div className="flex items-center pt-3 border-t border-[#DEDEDE]">
            <div className="flex items-center text-[#444] font-medium">
              <span className="mr-1">{translations.viewProject}</span>
              
              {/* Flèche qui slide au survol seulement */}
              <svg 
                ref={arrowRef}
                className={`w-5 h-5 ml-1 text-[#FF3333] transition-transform duration-300 ${isHovered ? 'translate-x-5' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </div>
            
            {/* Texte "Voir les détails" qui apparaît comme élément distinct */}
            <div 
              className={`absolute left-[110px] top-3 whitespace-nowrap transition-all duration-300 
                ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}
              style={{ transitionDelay: '0.1s' }}
            >
              <span className="text-[#444] font-medium">
                {translations('portfolio.viewDetails')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
};

const PortfolioSection = () => {
  const { t, language } = useTranslations();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Observer d'intersection pour les animations au défilement
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Effet pour charger uniquement les projets depuis l'API, sans fallback
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        console.log(`Tentative de chargement des projets pour la langue: ${language}`);
        
        // Charger les projets depuis l'API avec un timestamp pour éviter le cache
        const response = await fetch(`/api/admin/projects?language=${language}&t=${Date.now()}`);
        
        console.log('Statut de la réponse API:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Données brutes de l\'API:', data);
          
          // Récupérer les projets dans la langue courante
          const currentLangProjects = Object.values(data[language] || {});
          console.log(`Projets pour la langue ${language}:`, currentLangProjects);
          
          // Si aucun projet dans la langue courante, essayer l'autre langue
          if (currentLangProjects.length === 0) {
            const otherLang = language === 'fr' ? 'en' : 'fr';
            const otherLangProjects = Object.values(data[otherLang] || {});
            console.log(`Aucun projet trouvé en ${language}, utilisation des projets en ${otherLang}:`, otherLangProjects);
            
            if (otherLangProjects.length > 0) {
              console.log(`${otherLangProjects.length} projets trouvés dans l'autre langue`);
              setProjects(otherLangProjects as Project[]);
            } else {
              console.log('Aucun projet trouvé dans aucune langue');
              setProjects([]);
            }
          } else {
            console.log(`${currentLangProjects.length} projets chargés depuis l'API en ${language}`);
            setProjects(currentLangProjects as Project[]);
          }
        } else {
          console.error('Échec de chargement des projets depuis l\'API:', response.status);
          const errorText = await response.text();
          console.error('Détails de l\'erreur:', errorText);
          setProjects([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [language]);

  // Fonction pour filtrer les projets par recherche
  const filterProjectsBySearch = (projects: Project[]) => {
    if (!searchQuery) return projects;
    
    const query = searchQuery.toLowerCase();
    return projects.filter(project => 
      project.title.toLowerCase().includes(query) || 
      (project.description && project.description.toLowerCase().includes(query)) ||
      (project.summary && project.summary.toLowerCase().includes(query)) ||
      (project.tools && project.tools.some(tool => tool.toLowerCase().includes(query))) ||
      (project.category && project.category.toLowerCase().includes(query))
    );
  };

  // Filtrer les projets par catégorie
  const getFilteredProjects = () => {
    let filtered = selectedCategory === 'all' 
      ? projects 
      : projects.filter(project => {
          // Vérifier les différentes possibilités pour la catégorie (majuscules, minuscules, traduction)
          const projectCategory = project.category.toLowerCase();
          const selectedCategoryLower = selectedCategory.toLowerCase();
          
          return projectCategory === selectedCategoryLower 
            // Pour gérer 'environments' et 'Environnements'
            || (selectedCategoryLower === 'environments' && (
                projectCategory === 'environments' || 
                projectCategory === 'environnements' || 
                projectCategory === 'environment' || 
                projectCategory === 'environnement'
            ))
            // Pour gérer les autres catégories si nécessaire
            || (selectedCategoryLower === 'props' && (
                projectCategory === 'props' || 
                projectCategory === 'prop' || 
                projectCategory === 'accessoire' || 
                projectCategory === 'accessoires'
            ));
        });

    // Appliquer le filtre de recherche
    const searchFiltered = filterProjectsBySearch(filtered);
    
    // Inverser l'ordre pour avoir les projets les plus récents en premier
    return [...searchFiltered].reverse();
  };

  const filteredProjects = getFilteredProjects();

  const categories = [
    { id: 'all', label: t('portfolio.categories.all') },
    { id: 'environments', label: t('portfolio.categories.environments') },
    { id: 'props', label: t('portfolio.categories.props') },
    { id: 'concepts', label: t('portfolio.categories.concepts') },
    { id: 'lighting', label: t('portfolio.categories.lighting') },
  ];

  return (
    <section ref={sectionRef} id="portfolio" className="py-24 bg-gradient-to-b from-[#080C14] to-[#0D0D14] overflow-hidden relative">
      {/* Fond avec effet de particules légères */}
      <div className="absolute inset-0 pointer-events-none opacity-12">
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] bg-repeat opacity-15"></div>
        {[...Array(15)].map((_, i) => (
          <div 
            key={i} 
            className="absolute rounded-full bg-[#FF3333]/10 animate-float-slow" 
            style={{
              width: `${Math.random() * 20 + 10}px`,
              height: `${Math.random() * 20 + 10}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Titre et description avec animations améliorées - supprimer le doublon */}
        <div className={`max-w-4xl mx-auto text-center mb-16 transform transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-6xl md:text-7xl font-bold text-[#FF3333] mb-6">
            {t('portfolio.title')}
          </h2>
          <p className="text-xl md:text-2xl text-gray-200 font-medium max-w-3xl mx-auto">
            {t('portfolio.description')}
          </p>
        </div>

        {/* Filtres et recherche */}
        <div className={`flex flex-col space-y-6 mb-12 transform transition-all duration-700 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Recherche */}
          <div className="relative max-w-md mx-auto w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'fr' ? "Rechercher un projet..." : "Search projects..."}
              className="w-full px-4 py-3 pr-10 rounded-lg border-2 border-[#FF3333]/10 focus:border-[#FF3333] focus:ring-2 focus:ring-[#FF3333]/20 outline-none transition-all duration-300 shadow-sm hover:shadow-md bg-gradient-to-r from-[#0D0D14]/80 to-[#131020]/80 backdrop-blur-sm text-white"
            />
            <svg 
              className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          
          {/* Catégories */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-[#FF3333]/90 text-white shadow-md'
                    : 'bg-[#1A1326]/60 text-white hover:bg-[#251A32]/60 border border-[#FF3333]/10 shadow-sm'
                } transform ${
                  isVisible ? 'scale-100' : 'scale-95'
                }`}
                style={{
                  transitionDelay: `${index * 100 + 300}ms`
                }}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-60">
            <div className="w-12 h-12 border-4 border-[#1A2334] border-t-[#FF3333] rounded-full animate-spin mb-4"></div>
            <p className="text-gray-300 animate-pulse">{language === 'fr' ? "Chargement des projets..." : "Loading projects..."}</p>
          </div>
        ) : (
          <>
            {/* Compteur de projets */}
            <div className={`text-center mb-8 transform transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className="inline-block bg-[#1A1326]/60 text-white px-4 py-2 rounded-full text-sm font-medium border border-[#FF3333]/10">
                {filteredProjects.length} {filteredProjects.length > 1 ? 
                  (language === 'fr' ? 'projets trouvés' : 'projects found') : 
                  (language === 'fr' ? 'projet trouvé' : 'project found')}
              </span>
            </div>
            
            {/* Grille de projets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, index) => (
                  <div 
                    key={project.id} 
                    className={`transform transition-all duration-700 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
                    }`}
                    style={{
                      transitionDelay: `${(index + categories.length) * 100}ms`
                    }}
                  >
                    <ProjectCard project={project} translations={t} />
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12 bg-gradient-to-br from-[#0D0D14]/80 to-[#131020]/80 backdrop-blur-sm rounded-xl shadow-inner border border-[#FF3333]/10">
                  <div className="w-20 h-20 mx-auto mb-4 opacity-30 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-300 text-xl mb-2">{t('portfolio.noProjects')}</p>
                  <p className="text-gray-400 text-sm">
                    {language === 'fr' 
                      ? "Essayez de modifier vos critères de recherche ou changez de catégorie"
                      : "Try changing your search criteria or select a different category"}
                  </p>
                  <button 
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    className="mt-4 px-4 py-2 bg-[#1A1326]/60 hover:bg-[#251A32]/60 text-white rounded-full text-sm transition-colors duration-300"
                  >
                    {language === 'fr' ? "Réinitialiser les filtres" : "Reset filters"}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default PortfolioSection; 
