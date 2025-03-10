"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from '@/app/hooks/useTranslations';
import { getProjectBySlug } from '@/app/utils/projects';
import { ToolLogo } from '@/app/assets/tools/index';
import { Metadata } from 'next';

interface MediaItem {
  path: string;
  description?: string;
  category?: string;
}

const ProjectPage = () => {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { t, language, toggleLanguage } = useTranslations();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean | string | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [currentImage, setCurrentImage] = useState<string>('');
  const modalRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const coverVideoRef = useRef<HTMLVideoElement>(null);
  const [fadeIn, setFadeIn] = useState<boolean>(false);
  const [animateHeader, setAnimateHeader] = useState<boolean>(false);
  const [animateContent, setAnimateContent] = useState<boolean>(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  // Variable dérivée pour vérifier si les médias ont des catégories
  const hasCategories = project?.media?.some((media: MediaItem) => media.category);
  
  // Filtrer les médias en fonction de la catégorie sélectionnée et exclure l'image de couverture
  const filteredMedia: MediaItem[] = project?.media?.filter((media: MediaItem) => 
    (selectedCategory === null || media.category === selectedCategory) && 
    (project?.coverImage ? media.path !== project.coverImage : true)
  ) || [];

  // Fonction pour gérer les erreurs d'image
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error("Erreur de chargement de l'image:", e.currentTarget.src);
    setImageError(true);
    // Utiliser une image de remplacement par défaut
    e.currentTarget.src = '/images/default-project.jpg';
    e.currentTarget.onerror = null; // Éviter les boucles infinies
  };

  // Fonction pour ouvrir la visionneuse d'images
  const openImageViewer = (image: string, index: number) => {
    setImageError(false); // Réinitialiser l'état d'erreur
    setCurrentImage(image);
    setCurrentImageIndex(index >= 0 ? index : 0);
    setIsImageViewerOpen(true);
    document.body.style.overflow = 'hidden'; // Empêcher le défilement
  };

  // Fonction pour fermer la visionneuse d'images
  const closeImageViewer = () => {
    setCurrentImage('');
    setIsImageViewerOpen(false);
    document.body.style.overflow = 'auto'; // Réactiver le défilement
  };

  // Fonction pour naviguer entre les images
  const navigateImages = (direction: 'prev' | 'next') => {
    if (!project?.gallery && !project?.media) return;
    
    let gallery = project.media || project.gallery || [];
    let max = gallery.length - 1;
    
    if (direction === 'prev') {
      setCurrentImageIndex((prev) => (prev === 0 ? max : prev - 1));
    } else {
      setCurrentImageIndex((prev) => (prev === max ? 0 : prev + 1));
    }
    
    const currentPath = project.media
      ? (project.media[currentImageIndex] as MediaItem).path
      : project.gallery[currentImageIndex];
      
    setCurrentImage(currentPath);
  };

  // Fermer la visionneuse si on clique en dehors de l'image
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeImageViewer();
      }
    };

    if (currentImage) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [currentImage]);

  // Gérer les touches du clavier pour la navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentImage) return;
      
      if (e.key === 'Escape') {
        closeImageViewer();
      } else if (e.key === 'ArrowLeft') {
        navigateImages('prev');
      } else if (e.key === 'ArrowRight') {
        navigateImages('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentImage, project]);

  // Configuration de l'Intersection Observer pour les vidéos
  useEffect(() => {
    if (!filteredMedia || filteredMedia.length === 0) return;

    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          
          if (entry.isIntersecting) {
            // La vidéo est visible, lancer la lecture
            video.play().catch(err => {
              console.error("Erreur lors du lancement de la vidéo:", err);
            });
          } else {
            // La vidéo n'est plus visible, mettre en pause
            video.pause();
          }
        });
      },
      {
        root: null, // utiliser le viewport comme zone d'observation
        rootMargin: '0px', // pas de marge
        threshold: 0.5, // déclencher lorsque 50% de la vidéo est visible
      }
    );

    // Observer toutes les vidéos
    videoRefs.current.forEach((video) => {
      if (video) {
        videoObserver.observe(video);
      }
    });

    // Nettoyer l'Observer lorsque le composant est démonté
    return () => {
      videoObserver.disconnect();
    };
  }, [filteredMedia]);

  // Configuration de l'Intersection Observer pour la vidéo de couverture
  useEffect(() => {
    if (!project?.coverImage || !coverVideoRef.current) return;
    if (!project.coverImage.endsWith('.mp4') && !project.coverImage.endsWith('.webm')) return;

    const coverVideoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          
          if (entry.isIntersecting) {
            // La vidéo est visible, lancer la lecture
            video.play().catch(err => {
              console.error("Erreur lors du lancement de la vidéo de couverture:", err);
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
        threshold: 0.3, // Déclencher plus tôt pour la vidéo de couverture
      }
    );

    coverVideoObserver.observe(coverVideoRef.current);

    return () => {
      coverVideoObserver.disconnect();
    };
  }, [project]);

  // Fonction pour enregistrer une référence à une vidéo
  const setVideoRef = (index: number, el: HTMLVideoElement | null) => {
    if (el) {
      videoRefs.current.set(index, el);
    } else {
      videoRefs.current.delete(index);
    }
  };

  const fetchProjectData = async (slug: string, lang: string) => {
    try {
      const apiUrl = `/api/admin/projects?slug=${slug}&language=${lang}`;
      
      const response = await fetch(apiUrl, {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération du projet: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.projects && data.projects.length > 0) {
        return data.projects[0];
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du projet:', error);
      return null;
    }
  };

  // Adapter le projet à la langue actuelle si nécessaire
  const adaptProjectToLanguage = (project: any, targetLang: string) => {
    // Si le projet est déjà dans la bonne langue ou s'il n'y a pas de traduction disponible, renvoyer tel quel
    return project;
  };

  // Récupération des données du projet
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const slug = params.slug as string;
        
        if (!slug) {
          setError('Slug non défini');
          setLoading(false);
          return;
        }
        
        // Vérifier si les données sont déjà en cache (sessionStorage)
        const cachedData = sessionStorage.getItem(`project_${slug}`);
        let cachedProject = null;
        
        if (cachedData) {
          try {
            const parsedData = JSON.parse(cachedData);
            cachedProject = parsedData;
            
            // Utiliser le cache si valide
            if (cachedProject && typeof cachedProject === 'object') {
              setProject(cachedProject);
              setLoading(false);
              
              // Animation séquentielle pour une entrée progressive
              setTimeout(() => {
                // Ajouter la classe d'entrée de transition
                document.body.classList.add('page-transition-in');
                
                // Puis déclencher les animations internes
                setFadeIn(true);
                
                // Animer le header après un court délai
                setTimeout(() => {
                  setAnimateHeader(true);
                  
                  // Animer le contenu après le header
                  setTimeout(() => {
                    setAnimateContent(true);
                    
                    // Supprimer la classe de transition une fois l'animation terminée
                    setTimeout(() => {
                      document.body.classList.remove('page-transition-in');
                    }, 700);
                  }, 200);
                }, 300);
              }, 100);
              
              try {
                // Nettoyer le cache après utilisation pour éviter les problèmes de stale data
                sessionStorage.removeItem(`project_${slug}`);
              } catch (cleanupError) {
                console.warn("Erreur lors du nettoyage du cache:", cleanupError);
              }
            }
          } catch (processingError) {
            console.error("Erreur lors du traitement des données en cache:", processingError);
            // Si erreur dans le traitement du cache, charger depuis l'API
            cachedProject = null;
          }
          
          if (cachedProject) {
            return;
          }
        }
        
        // Si pas en cache, charger depuis l'API
        console.log("Chargement du projet depuis l'API:", slug);
        // Solution temporaire : nous savons que language est toujours 'en' ou 'fr',
        // mais TypeScript ne peut pas l'inférer correctement
        // @ts-ignore - Nous savons que language est valide depuis le contexte
        const fetchedProject = await getProjectBySlug(slug, language);
        
        if (!fetchedProject) {
          setError('Projet non trouvé');
          setLoading(false);
          return;
        }
        
        // Vérifier si media existe déjà
        if (!fetchedProject.media && fetchedProject.gallery) {
          fetchedProject.media = fetchedProject.gallery.map(path => ({
            path,
            description: ''
          }));
        }
        
        setProject(fetchedProject);
        setLoading(false);
        
        // Animation séquentielle pour une entrée progressive
        setTimeout(() => {
          // Ajouter la classe d'entrée de transition
          document.body.classList.add('page-transition-in');
          
          // Puis déclencher les animations internes
          setFadeIn(true);
          
          // Animer le header après un court délai
          setTimeout(() => {
            setAnimateHeader(true);
            
            // Animer le contenu après le header
            setTimeout(() => {
              setAnimateContent(true);
              
              // Supprimer la classe de transition une fois l'animation terminée
              setTimeout(() => {
                document.body.classList.remove('page-transition-in');
              }, 700);
            }, 200);
          }, 300);
        }, 100);
      } catch (err) {
        console.error('Erreur lors du chargement du projet:', err);
        setError('Erreur lors du chargement du projet');
        setLoading(false);
      }
    };
    
    fetchProject();
    
    // Réinitialiser les états d'animation lors du démontage du composant
    return () => {
      setFadeIn(false);
      setAnimateHeader(false);
      setAnimateContent(false);
      document.body.classList.remove('page-transition-in');
    };
  }, [params.slug, language]);

  // Fonction pour suivre la progression de lecture
  useEffect(() => {
    const updateReadingProgress = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setReadingProgress(progress);
      
      // Mettre à jour l'état "scrolled" en fonction de la position de défilement
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', updateReadingProgress);
    return () => window.removeEventListener('scroll', updateReadingProgress);
  }, []);

  // Caché le preloader, il sera remplacé par la page de transition
  if (loading) {
    return null;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-2xl font-bold text-red-500 mb-4">
          {typeof error === 'string' ? error : 'Une erreur est survenue'}
        </div>
        <Link href="/" className="text-blue-500 hover:underline">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div className={`bg-[#F5F5F0] min-h-screen font-sans`}>
      {/* Indicateur de progression de lecture */}
      <div className="fixed top-0 left-0 z-50 w-full h-1 bg-gray-200">
        <div 
          className="h-full bg-[#FF3333] transition-all duration-300 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Header avec bouton retour et navigation */}
      <div className={`sticky top-0 left-0 right-0 z-30 bg-[#F5F5F0]/90 backdrop-blur-md shadow-sm border-b border-gray-200 transition-all duration-700 ease-out ${
        scrolled ? 'py-3' : 'py-5'
      }`}>
        <div className="w-full px-4 md:px-8 xl:px-16 flex justify-between items-center">
          <Link href="/#portfolio" className="text-[#0D1117] hover:text-[#FF3333] transition-colors flex items-center interactive-element">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-lg font-medium">{language === 'fr' ? 'Retour aux projets' : 'Back to projects'}</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link href={language === 'fr' ? `${pathname}?lang=en` : `${pathname}?lang=fr`} className="language-transition">
              <div className="text-[#0D1117] hover:text-[#FF3333] transition-colors text-lg font-medium interactive-element">
                {language === 'fr' ? 'EN' : 'FR'}
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Bannière principale avec image ou vidéo de couverture */}
      <div className={`transition-all duration-1000 delay-300 ease-out ${
        animateContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        {project.coverImage && (
          <div className="w-full h-[45vh] relative overflow-hidden">
            <div className="absolute inset-0 animate-ken-burns">
              {project.coverImage.endsWith('.mp4') || project.coverImage.endsWith('.webm') ? (
                <video
                  ref={coverVideoRef}
                  src={project.coverImage}
                  className="absolute inset-0 w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img 
                  src={project.coverImage} 
                  alt={project.title} 
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={handleImageError}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117]/70 via-transparent to-transparent"></div>
            </div>
            
            {/* Titre et catégorie sur l'image de couverture */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-9 animate-slide-up">
              <div className="w-full px-4 md:px-8 xl:px-16">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">{project.title}</h1>
                <p className="text-xl text-white/90 max-w-2xl mb-6 drop-shadow-md">
                  {project.summary || project.description?.substring(0, 120) + '...'}
                </p>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => openImageViewer(project.coverImage, -1)}
                    className="px-4 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full transition-all duration-300 flex items-center space-x-1.5 text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>{language === 'fr' ? 
                      (project.coverImage.endsWith('.mp4') || project.coverImage.endsWith('.webm') ? 'Voir la vidéo' : 'Voir en plein écran') : 
                      (project.coverImage.endsWith('.mp4') || project.coverImage.endsWith('.webm') ? 'View video' : 'View fullscreen')
                    }</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenu principal en mode flexbox */}
        <div className="flex flex-col lg:flex-row max-w-full w-full px-4 md:px-8 xl:px-16">
          {/* Colonne principale - Images en plein format */}
          <div className="flex-grow lg:pr-8 animate-slide-in-left">
            {/* Filtres de catégorie si disponibles - Mobile uniquement */}
            {hasCategories && (
              <div className="mb-3 mt-3 lg:hidden">
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-3 py-2 rounded-full text-base font-medium transition-colors ${
                      selectedCategory === null 
                        ? 'bg-[#FF3333] text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setSelectedCategory(null)}
                  >
                    {language === 'fr' ? 'Tous' : 'All'}
                  </button>
                  {Array.from(new Set(project.media.map((media: MediaItem) => media.category))).map((category: unknown, index: number) => (
                    <button
                      key={index}
                      className={`px-3 py-2 rounded-full text-base font-medium transition-colors ${
                        selectedCategory === category 
                          ? 'bg-[#FF3333] text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      onClick={() => setSelectedCategory(category as string)}
                    >
                      {category as React.ReactNode}
                    </button>
                  ))}
                </div>
              </div>
            )}
          
            {/* Galerie d'images en plein format */}
            {(project.media && project.media.length > 0) ? (
              <div className="w-full space-y-10 pt-6 pb-12">
                {filteredMedia.map((media: MediaItem, index: number) => (
                  <div 
                    key={index} 
                    className="w-full relative bg-white rounded-lg overflow-hidden group shadow-lg"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <div className="relative aspect-video bg-gray-100">
                      {media.path.endsWith('.mp4') || media.path.endsWith('.webm') ? (
                        <video 
                          ref={(el) => setVideoRef(index, el)}
                          src={media.path}
                          className="absolute inset-0 w-full h-full object-contain cursor-pointer group-hover:scale-[1.01] transition-transform duration-500"
                          onClick={() => openImageViewer(media.path, filteredMedia.indexOf(media))}
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        <img 
                          src={media.path} 
                          alt={media.description || `Image ${index + 1}`}
                          className="absolute inset-0 w-full h-full object-contain cursor-pointer group-hover:scale-[1.01] transition-transform duration-500"
                          onError={handleImageError}
                          onClick={() => openImageViewer(media.path, filteredMedia.indexOf(media))}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center">
                        <button 
                          onClick={() => openImageViewer(media.path, filteredMedia.indexOf(media))}
                          className="mb-4 px-5 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full translate-y-8 group-hover:translate-y-0 transition-transform duration-300 text-sm font-medium"
                        >
                          {language === 'fr' ? (media.path.endsWith('.mp4') || media.path.endsWith('.webm') ? 'Voir la vidéo' : 'Agrandir l\'image') : (media.path.endsWith('.mp4') || media.path.endsWith('.webm') ? 'View video' : 'View larger')}
                        </button>
                      </div>
                    </div>
                    {/* Toujours afficher la section de description, même si elle est vide */}
                    {media.description && (
                      <div className="py-5 px-6 text-gray-700 max-w-4xl mx-auto">
                        <p className="text-xl leading-relaxed">
                          {media.description}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : project.gallery && project.gallery.length > 0 ? (
              <div className="w-full space-y-10 pt-6 pb-12">
                {project.gallery.map((imagePath: string, index: number) => (
                  <div 
                    key={index} 
                    className="w-full relative bg-white rounded-lg overflow-hidden group shadow-lg"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <div className="relative aspect-video bg-gray-100">
                      <img 
                        src={imagePath} 
                        alt={`Image ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-contain cursor-pointer group-hover:scale-[1.02] transition-transform duration-500"
                        onError={handleImageError}
                        onClick={() => openImageViewer(imagePath, index)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center">
                        <button 
                          onClick={() => openImageViewer(imagePath, index)}
                          className="mb-4 px-5 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full translate-y-8 group-hover:translate-y-0 transition-transform duration-300 text-sm font-medium"
                        >
                          {language === 'fr' ? 'Agrandir l\'image' : 'View larger'}
                        </button>
                      </div>
                    </div>
                    <div className="py-5 px-6 text-gray-700">
                      <p className="text-xl leading-relaxed">{`Image ${index + 1}`}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-64 flex items-center justify-center bg-white rounded-lg mt-8 shadow-lg">
                <p className="text-gray-500 text-xl">{language === 'fr' ? 'Aucune image dans la galerie' : 'No images in gallery'}</p>
              </div>
            )}
          </div>
          
          {/* Panneau d'informations sur le projet (sur le côté droit en mode desktop) */}
          <div className="lg:w-[350px] xl:w-[380px] 2xl:w-[420px] pt-5 lg:sticky lg:top-20 lg:self-start animate-slide-in-right">
            {/* Filtres de catégorie si disponibles - Desktop uniquement */}
            {hasCategories && (
              <div className="mb-3 hidden lg:block">
                <h3 className="text-xl font-bold mb-2 text-[#0D1117]">{language === 'fr' ? 'Catégories' : 'Categories'}</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-3 py-2 rounded-full text-base transition-colors ${
                      selectedCategory === null 
                        ? 'bg-[#FF3333] text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setSelectedCategory(null)}
                  >
                    {language === 'fr' ? 'Tous' : 'All'}
                  </button>
                  {Array.from(new Set(project.media.map((media: MediaItem) => media.category))).map((category: unknown, index: number) => (
                    <button
                      key={index}
                      className={`px-3 py-2 rounded-full text-base transition-colors ${
                        selectedCategory === category 
                          ? 'bg-[#FF3333] text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      onClick={() => setSelectedCategory(category as string)}
                    >
                      {category as React.ReactNode}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Informations du projet */}
            <div className="bg-white rounded-lg p-5 mb-4 animate-fade-in shadow-lg">
              <h2 className="text-3xl font-bold text-[#0D1117] mb-3 pb-2 border-b border-gray-200 section-title">
                {language === 'fr' ? 'Informations' : 'Information'}
              </h2>
              
              <div className="space-y-4">
                {/* Description */}
                <div>
                  <h3 className="text-xl font-bold text-[#0D1117] mb-2 section-title">{language === 'fr' ? 'Description' : 'Description'}</h3>
                  <div className="text-gray-700 text-base leading-relaxed" 
                    dangerouslySetInnerHTML={{ 
                      __html: project.description
                        .replace(/\n/g, '<br />')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    }}
                  />
                </div>
                
                {/* Description longue */}
                {project.longDescription && (
                  <div>
                    <h3 className="text-xl font-bold text-[#0D1117] mb-2 section-title">{language === 'fr' ? 'À propos du projet' : 'About the project'}</h3>
                    <div className="text-gray-700 text-base leading-relaxed">
                      {typeof project.longDescription === 'string' 
                        ? <div dangerouslySetInnerHTML={{ 
                            __html: project.longDescription
                              .replace(/\n/g, '<br />')
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em>$1</em>') 
                          }} />
                        : <div dangerouslySetInnerHTML={{ __html: String(project.longDescription) }} />}
                    </div>
                  </div>
                )}
                
                {/* Date */}
                {project.date && (
                  <div>
                    <h3 className="text-xl font-bold text-[#0D1117] mb-2 section-title">{language === 'fr' ? 'Date' : 'Date'}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span 
                        className="px-4 py-2 bg-white text-gray-700 rounded-full text-base flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-sm interactive-element"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {project.date}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Outils utilisés */}
                {project.tools && project.tools.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-[#0D1117] mb-2 section-title">{language === 'fr' ? 'Outils utilisés' : 'Tools used'}</h3>
                    <div className="flex flex-wrap gap-2 bg-[#F5F5F0] p-3 rounded-lg">
                      {project.tools.map((tool: string, index: number) => (
                        <span 
                          key={index}
                          className="px-3 py-2 bg-white text-gray-700 rounded-full text-base flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-sm tool-badge"
                        >
                          <ToolLogo toolName={tool} className="w-5 h-5" />
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* CTA pour voir d'autres projets */}
                <div className="pt-2">
                  <Link href="/#portfolio" className="inline-flex items-center text-white bg-[#FF3333] hover:bg-[#FF5757] px-5 py-2 rounded-full transition-all duration-300 group interactive-element text-base">
                    <span className="mr-2">{language === 'fr' ? 'Voir d\'autres projets' : 'View other projects'}</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-[#EAEAE5] border-t border-gray-200 py-5 mt-8">
        <div className="w-full px-4 md:px-8 xl:px-16">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 text-base mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} {project.author || 'Valentin'} • {language === 'fr' ? 'Tous droits réservés' : 'All rights reserved'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Visionneuse d'images améliorée */}
      {isImageViewerOpen && currentImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-0 animate-fade-in-fast">
          <div 
            ref={modalRef}
            className="relative w-full h-full flex flex-col"
          >
            {/* Bouton de fermeture */}
            <button 
              onClick={closeImageViewer}
              className="absolute top-6 right-6 z-10 bg-black/40 hover:bg-black/60 rounded-full p-3 text-white transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image ou vidéo avec fallback en cas d'erreur */}
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              {currentImage.endsWith('.mp4') || currentImage.endsWith('.webm') ? (
                <video 
                  src={currentImage}
                  className="max-w-full max-h-full object-contain animate-scale-in"
                  controls
                  autoPlay
                  loop
                />
              ) : (
                <img 
                  src={currentImage} 
                  alt={project.title || "Image du projet"}
                  className="max-w-full max-h-full object-contain animate-scale-in"
                  onError={handleImageError}
                />
              )}
              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-2xl bg-black/50">
                  <p>{language === 'fr' ? 'Le média n\'a pas pu être chargé' : 'The media could not be loaded'}</p>
                </div>
              )}
            </div>
            
            {/* Navigation */}
            {!currentImage.endsWith('.mp4') && !currentImage.endsWith('.webm') && (project.media?.length > 1 || project.gallery?.length > 1) && (
              <>
                <button 
                  onClick={() => navigateImages('prev')}
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 rounded-full p-4 text-white transition-all duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={() => navigateImages('next')}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 rounded-full p-4 text-white transition-all duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* Informations sur l'image actuelle */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md text-white p-6 flex justify-between items-center">
                  <div className="text-xl font-medium">
                    <span>{currentImageIndex + 1} / {project.media?.length || project.gallery?.length}</span>
                  </div>
                  <div className="max-w-2xl">
                    {project.media && project.media[currentImageIndex] ? (
                      <p className="text-lg text-white/90">
                        {project.media[currentImageIndex].description || <span className="text-white/60 italic">Aucune description</span>}
                      </p>
                    ) : null}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;

<style jsx global>{`
  /* Animations pour la page de projet */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeInFast {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes kenBurns {
    from { transform: scale(1.1); }
    to { transform: scale(1); }
  }

  @keyframes borderPulse {
    0% { box-shadow: 0 0 0 0 rgba(255, 51, 51, 0.2); }
    70% { box-shadow: 0 0 0 10px rgba(255, 51, 51, 0); }
    100% { box-shadow: 0 0 0 0 rgba(255, 51, 51, 0); }
  }
  
  /* Améliorations des titres */
  h2.section-title {
    letter-spacing: 0.05em;
    color: #0A0A0A;
    position: relative;
  }
  
  h3.section-title {
    letter-spacing: 0.03em;
    color: #0A0A0A;
    position: relative;
    padding-bottom: 0.5rem;
  }
  
  h3.section-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 2px;
    background-color: #FF3333;
    transition: width 0.3s ease-out;
  }
  
  h3.section-title:hover::after {
    width: 60px;
  }
  
  /* Amélioration des badges */
  .tool-badge {
    transition: all 0.3s ease;
  }
  
  .tool-badge:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    animation: borderPulse 1.5s infinite;
  }

  /* Animations pour boutons et éléments interactifs */
  .interactive-element {
    transition: all 0.3s ease;
  }
  
  .interactive-element:hover {
    transform: scale(1.05);
  }
  
  /* Transition pour le changement de langue */
  .language-transition {
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  
  .language-transition-enter {
    opacity: 0;
    transform: translateY(10px);
  }
  
  .language-transition-enter-active {
    opacity: 1;
    transform: translateY(0);
  }
  
  .language-transition-exit {
    opacity: 1;
    transform: translateY(0);
  }
  
  .language-transition-exit-active {
    opacity: 0;
    transform: translateY(-10px);
  }
  
  .animate-fade-in {
    animation: fadeIn 0.9s ease-out forwards;
  }
  
  .animate-fade-in-fast {
    animation: fadeInFast 0.27s ease-out forwards;
  }
  
  .animate-scale-in {
    animation: scaleIn 0.45s ease-out forwards;
  }
  
  .animate-slide-up {
    animation: slideUp 0.9s ease-out forwards;
  }
  
  .animate-slide-in-left {
    animation: slideInLeft 0.72s ease-out forwards;
  }
  
  .animate-slide-in-right {
    animation: slideInRight 0.72s ease-out forwards;
  }
  
  .animate-ken-burns {
    animation: kenBurns 18s ease-out forwards;
  }
  
  /* Transitions fluides pour les images */
  img {
    transition: transform 0.5s ease-in-out;
  }
  
  /* Ajustements pour la page de projet Artstation-style */
  body {
    scrollbar-width: thin;
    scrollbar-color: #FF3333 #1A1A1A;
  }
  
  body::-webkit-scrollbar {
    width: 10px;
  }
  
  body::-webkit-scrollbar-track {
    background: #0D0D0D;
  }
  
  body::-webkit-scrollbar-thumb {
    background-color: #FF3333;
    border-radius: 4px;
  }
  
  /* Animation au scroll pour les éléments de la galerie */
  [data-aos] {
    opacity: 0;
    transition: opacity 0.8s ease, transform 0.8s ease;
  }
  
  [data-aos="fade-up"] {
    transform: translateY(40px);
  }
  
  [data-aos].aos-animate {
    opacity: 1;
    transform: translateY(0);
  }
  
  /* Effet de texte brillant */
  .text-glow {
    text-shadow: 0 0 10px rgba(255, 51, 51, 0.5);
  }
`}</style>