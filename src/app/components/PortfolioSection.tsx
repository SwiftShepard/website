// Ce fichier n'est pas utilisé directement. Dans page.tsx, c'est GallerySection qui est importé sous le nom PortfolioSection.
// Si ce composant doit être conservé, il faudrait le renommer ou modifier les imports.
"use client";

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import Image from 'next/image';
import Link from 'next/link';
import { getAllProjects, getProjectsByCategory } from '../utils/projects';

const PortfolioSection = () => {
  const { t, language } = useTranslations();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const projectVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Utilisation de l'API de projets
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`/api/projects?lang=${language}`);
        const data = await response.json();
        setProjects(data);
        
        // Extraire les catégories uniques
        const uniqueCategories = [...new Set(data.map((p: any) => p.category))].filter(Boolean) as string[];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
      }
    };
    
    fetchProjects();
  }, [language]);

  // Animation au scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    }, { threshold: 0.1 });
    
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);

  // Configuration de l'Intersection Observer pour les vidéos des projets
  useEffect(() => {
    if (!projects || projects.length === 0) return;

    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          
          if (entry.isIntersecting) {
            // La vidéo est visible, lancer la lecture
            video.play().catch(err => {
              console.error("Erreur lors du lancement de la vidéo du projet:", err);
            });
          } else {
            // La vidéo n'est plus visible, mettre en pause
            video.pause();
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.3,
      }
    );

    // Observer toutes les vidéos des projets
    projectVideoRefs.current.forEach((video) => {
      if (video) {
        videoObserver.observe(video);
      }
    });

    return () => {
      videoObserver.disconnect();
    };
  }, [projects]);

  // Fonction pour enregistrer une référence à une vidéo de projet
  const setProjectVideoRef = (projectId: string, el: HTMLVideoElement | null) => {
    if (el) {
      projectVideoRefs.current.set(projectId, el);
    } else {
      projectVideoRefs.current.delete(projectId);
    }
  };

  // Utilisation de l'API de projets
  const projectsByCategory = selectedCategory 
    ? projects.filter(project => project.category === selectedCategory)
    : projects;

  return (
    <section ref={sectionRef} id="portfolio" className="py-24 bg-[#F5F5F0] overflow-hidden">
      <div className="container mx-auto px-6">
        <div className={`max-w-4xl mx-auto text-center mb-16 transform transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-4xl md:text-5xl font-bold text-[#0D1117] mb-6 relative inline-block group">
            {t('portfolio.title')}
            <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF3333] to-transparent opacity-50 group-hover:opacity-100 transition-all duration-300"></div>
          </h2>
          <p className="text-xl text-[#4A4A4A]">
            {t('portfolio.description')}
          </p>
        </div>

        <div className={`flex flex-wrap justify-center gap-3 mb-12 transform transition-all duration-700 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {categories.map((category, index) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-[#FF3333] text-white'
                  : 'bg-white text-[#4A4A4A] hover:bg-[#FF3333]/10 hover:text-[#FF3333]'
              } transform ${
                isVisible ? 'scale-100' : 'scale-95'
              }`}
              style={{
                transitionDelay: `${index * 100 + 300}ms`
              }}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projectsByCategory.map((project, index) => (
            <div 
              key={project.id} 
              className={`group relative transform transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
              }`}
              style={{
                transitionDelay: `${(index + categories.length) * 100}ms`
              }}
              onMouseEnter={() => setHoveredProject(project.id)}
              onMouseLeave={() => setHoveredProject(null)}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#F5F5F0] shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                {(project.thumbnailImage || project.coverImage || '').endsWith('.mp4') || 
                 (project.thumbnailImage || project.coverImage || '').endsWith('.webm') ? (
                  <div className="w-full h-full relative">
                    <video
                      ref={(el) => setProjectVideoRef(project.id, el)}
                      src={project.thumbnailImage || project.coverImage || '/images/default-project.jpg'}
                      className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                        hoveredProject === project.id ? 'scale-105 rotate-1' : 'scale-100 rotate-0'
                      }`}
                      muted
                      loop
                      playsInline
                    />
                  </div>
                ) : (
                  <Image
                    src={project.thumbnailImage || project.coverImage || '/images/default-project.jpg'}
                    alt={project.title}
                    fill
                    className={`object-cover transition-all duration-700 ${
                      hoveredProject === project.id ? 'scale-105 rotate-1' : 'scale-100 rotate-0'
                    }`}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    <h3 className="text-white text-xl font-bold mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                      {project.title}
                    </h3>
                    <p className="text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                      {project.description}
                    </p>
                    <Link 
                      href={`/projects/${project.slug}`}
                      className="mt-4 px-4 py-2 bg-[#FF3333] text-white rounded-full text-sm hover:bg-[#CC0000] transition-all duration-300 opacity-0 group-hover:opacity-100 delay-300 relative overflow-hidden group/btn inline-flex items-center"
                    >
                      <span className="relative z-10 transform group-hover/btn:translate-x-1 transition-transform duration-300">{t('portfolio.viewDetails')}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 relative z-10 transform group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {/* Effet de brillance */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                    </Link>
                  </div>
                </div>
                {/* Effet de bordure au survol */}
                <div className="absolute inset-0 border-2 border-[#FF3333]/0 rounded-xl group-hover:border-[#FF3333]/30 transition-all duration-300"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection; 