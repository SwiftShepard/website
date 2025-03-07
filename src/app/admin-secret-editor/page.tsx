"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from '@/app/hooks/useTranslations';
import Image from 'next/image';
import Link from 'next/link';
import { Project } from '@/app/utils/projects';
import './animation.css'; // Importation du fichier CSS pour les animations
import { toolIcons, getToolIcon, hasToolIcon, ToolIcon, ToolLogo } from '@/app/assets/tools';

// Styles communs pour les champs de formulaire
const inputStyles = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF3333] focus:border-transparent text-black";
const textareaStyles = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF3333] focus:border-transparent text-black";
const selectStyles = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF3333] focus:border-transparent text-black";

// Interface pour gérer le type Media
interface Media {
  id: string;
  file: File;
  previewUrl: string;
  description: string;
  isExisting?: boolean;
  path?: string;
}

// Modèle vide pour un nouveau projet
const emptyProject: Partial<Project> = {
  id: '',
  slug: '',
  title: '',
  description: '',
  longDescription: '',
  category: 'Environments',
  coverImage: '',
  thumbnailImage: '',
  gallery: [],
  featured: false,
  projectType: 'Personal',
  tools: [],
  date: '',
};

// Page d'administration secrète pour éditer les projets
export default function AdminEditor() {
  const { t, language, toggleLanguage } = useTranslations();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  // Mode débogage - À activer en cas de problèmes
  const [debugMode, setDebugMode] = useState<boolean>(false);
  
  // États pour la gestion des projets
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({ 
    ...emptyProject,
    // S'assurer que tous les champs nécessaires sont initialisés correctement
    id: '',
    slug: '',
    title: '',
    description: '',
    longDescription: '',
    category: 'Environments',
    coverImage: '',
    thumbnailImage: '',
    gallery: [],
    featured: false,
    projectType: 'Personal',
    date: '',
    tools: [],
  });
  const [editMode, setEditMode] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // États pour la gestion des médias
  const [mediaFiles, setMediaFiles] = useState<Media[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Mot de passe pour accéder à l'administration
  const SECRET_PASSWORD = "votre_mot_de_passe_ici"; // À remplacer par un vrai système d'authentification
  
  // Prévisualisation d'une image en grand format
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    alt: string;
    type: 'image' | 'video';
  } | null>(null);
  
  // Effet pour l'authentification automatique
  useEffect(() => {
    // Accès direct sans mot de passe
    setIsAuthenticated(true);
    // Charger les projets immédiatement
    fetchProjects();
  }, []);
  
  // Vérification de l'initialisation correcte
  useEffect(() => {
    console.log('Initialisation du composant AdminEditor');
    console.log('État initial du projet:', currentProject);
    // Vérifier que tous les champs requis sont présents
    const requiredFields = ['id', 'title', 'description', 'category'];
    const missingFields = requiredFields.filter(field => !(field in currentProject));
    if (missingFields.length > 0) {
      console.error('Champs manquants dans l\'initialisation:', missingFields);
    }
  }, []);
  
  // Authentification simple
  const authenticate = () => {
    // Afficher les tentatives dans la console pour aider au débogage
    console.log('Tentative d\'authentification avec le mot de passe:', password);
    console.log('Mot de passe attendu:', SECRET_PASSWORD);
    
    if (password === SECRET_PASSWORD) {
      console.log('Authentification réussie!');
      setIsAuthenticated(true);
      setError('');
      // Charger les projets après authentification
      fetchProjects();
    } else {
      console.log('Échec de l\'authentification');
      setError('Mot de passe incorrect');
    }
  };
  
  // Charger les projets depuis l'API
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/projects', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SECRET_PASSWORD}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des projets');
      }
      
      const data = await response.json();
      setProjects(data[language] ? Object.values(data[language]) : []);
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
      setError('Impossible de charger les projets');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Effet pour recharger les projets lors du changement de langue
  useEffect(() => {
    console.log('useEffect - isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      console.log('Tentative de chargement des projets suite au changement de langue ou d\'authentification');
      fetchProjects();
    }
  }, [language, isAuthenticated]);
  
  // Gestion du téléchargement des médias
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newMediaFiles = Array.from(files).map(file => ({
      id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      description: '',
      isExisting: false,
      path: ''
    }));
    
    setMediaFiles(prev => {
      const updatedMediaFiles = [...prev, ...newMediaFiles];
      
      // Si c'est le premier upload et qu'aucune couverture n'est définie,
      // définir automatiquement le premier média comme couverture
      if (prev.length === 0 && newMediaFiles.length > 0 && !currentProject.coverImage) {
        const firstMedia = newMediaFiles[0];
        const isVideo = firstMedia.file.type.startsWith('video/');
        
        setCurrentProject(prevProject => ({
          ...prevProject,
          coverImage: firstMedia.previewUrl,
          thumbnailImage: firstMedia.previewUrl
        }));
        
        // Afficher un message de confirmation
        setToastMessage({
          type: 'success',
          message: `Premier ${isVideo ? 'vidéo' : 'image'} défini${isVideo ? 'e' : 'e'} comme couverture automatiquement`
        });
        setTimeout(() => setToastMessage(null), 2000);
      }
      
      return updatedMediaFiles;
    });
  };
  
  // Mise à jour de la description d'un média
  const updateMediaDescription = (id: string, description: string) => {
    setMediaFiles(prev => 
      prev.map(media => 
        media.id === id ? { ...media, description } : media
      )
    );
  };
  
  // Suppression d'un média
  const removeMedia = (id: string) => {
    setMediaFiles(prev => {
      const mediaToRemove = prev.find(media => media.id === id);
      if (mediaToRemove) {
        // Libérer les ressources pour les images non existantes
        if (!mediaToRemove.isExisting) {
          URL.revokeObjectURL(mediaToRemove.previewUrl);
        }
        
        // Si l'image supprimée est la couverture, définir une nouvelle couverture
        if (currentProject.coverImage === (mediaToRemove.path || mediaToRemove.previewUrl)) {
          const remaining = prev.filter(media => media.id !== id);
          if (remaining.length > 0) {
            const firstRemaining = remaining[0];
            setCurrentProject(prevProject => ({
              ...prevProject,
              coverImage: firstRemaining.path || firstRemaining.previewUrl,
              thumbnailImage: firstRemaining.path || firstRemaining.previewUrl
            }));
          }
        }
      }
      return prev.filter(media => media.id !== id);
    });
  };
  
  // Sauvegarde d'un média sur le serveur
  const uploadMedia = async (media: Media) => {
    const formData = new FormData();
    formData.append('file', media.file);
    
    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SECRET_PASSWORD}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors du téléchargement de ${media.file.name}`);
    }
    
    const result = await response.json();
    return {
      path: result.filePath,
      description: media.description
    };
  };
  
  // Gestionnaire de changement pour les champs du projet
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    console.log('🔍 handleChange appelé pour:', name);
    console.log('📝 Type de champ:', type);
    console.log('📄 Valeur actuelle:', value);
    console.log('🔑 État avant mise à jour:', currentProject);
    
    // Gestion des champs booléens (checkbox)
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      console.log('✅ Mise à jour de checkbox:', name, checked);
      setCurrentProject(prev => {
        const updated = { ...prev, [name]: checked };
        console.log('☑️ État après mise à jour checkbox:', updated);
        return updated;
      });
      return;
    }
    
    // Gestion des champs simples
    console.log('🔄 Mise à jour de champ simple:', name, value);
    setCurrentProject(prev => {
      const updated = { ...prev, [name]: value };
      console.log('✨ État après mise à jour:', updated);
      return updated;
    });
  };
  
  // Gestion des outils (champs avec tableaux)
  const handleToolsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tools = e.target.value.split(',').map(tool => tool.trim()).filter(tool => tool !== '');
    setCurrentProject(prev => ({ ...prev, tools }));
    
    // Afficher une notification de détection des outils
    if (tools.length > 0) {
      const recognizedTools = tools.filter(tool => 
        hasToolIcon(tool)
      );
      
      if (recognizedTools.length > 0) {
        setToastMessage({
          type: 'success',
          message: `${recognizedTools.length} outil(s) reconnu(s) avec logo`
        });
        setTimeout(() => setToastMessage(null), 2000);
      }
    }
  };
  
  // Génération de l'ID et du slug à partir du titre
  const generateIdAndSlug = () => {
    if (!currentProject.title) return;
    
    const id = currentProject.title
      .replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9]/g, '');
    
    const slug = currentProject.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    setCurrentProject(prev => ({ ...prev, id, slug }));
  };
  
  // Réinitialisation du formulaire
  const resetForm = () => {
    setCurrentProject({ ...emptyProject });
    setMediaFiles([]);
    setEditMode(false);
  };
  
  // Sauvegarde du projet
  const saveProject = async () => {
    try {
      setIsLoading(true);
      
      // Validation de base
      if (!currentProject.title || !currentProject.description || !currentProject.category) {
        setToastMessage({
          type: 'error',
          message: 'Veuillez remplir tous les champs obligatoires'
        });
        setIsLoading(false);
        return;
      }
      
      // Vérifier si des médias sont présents
      if (mediaFiles.length === 0) {
        setToastMessage({
          type: 'error',
          message: 'Veuillez ajouter au moins une image au projet'
        });
        setIsLoading(false);
        return;
      }
      
      // Séparer les médias existants et nouveaux
      const existingMedia = mediaFiles.filter(media => 'isExisting' in media && media.isExisting);
      const newMediaFiles = mediaFiles.filter(media => !('isExisting' in media) || !media.isExisting);
      
      // Télécharger uniquement les nouveaux médias
      const uploadedMedia = await Promise.all(newMediaFiles.map(uploadMedia));
      
      // Combiner les chemins des médias existants et nouveaux
      const allMediaPaths = [
        ...existingMedia.map(media => media.path),
        ...uploadedMedia.map(m => m.path)
      ];
      
      // Créer la structure media avec les descriptions
      const mediaWithDescriptions = [
        ...existingMedia.map(media => ({
          path: media.path || '',
          description: media.description
        })),
        ...uploadedMedia.map((media, index) => ({
          path: media.path,
          description: newMediaFiles[index].description
        }))
      ];
      
      // Si aucune image n'a pu être téléchargée
      if (allMediaPaths.length === 0) {
        setToastMessage({
          type: 'error',
          message: 'Aucune image n\'a pu être téléchargée'
        });
        setIsLoading(false);
        return;
      }
      
      // Mettre à jour le projet avec tous les chemins de médias
      const updatedProject = {
        ...currentProject,
        gallery: allMediaPaths,
        media: mediaWithDescriptions
      };
      
      // Si aucune image de couverture ou vignette n'est définie, utiliser la première image
      if (!updatedProject.coverImage && allMediaPaths.length > 0) {
        updatedProject.coverImage = allMediaPaths[0];
      }
      
      if (!updatedProject.thumbnailImage && allMediaPaths.length > 0) {
        updatedProject.thumbnailImage = allMediaPaths[0];
      }
      
      // Vérifier si l'image de couverture existe dans les chemins de médias
      const coverImageExists = allMediaPaths.includes(updatedProject.coverImage);
      if (!coverImageExists && allMediaPaths.length > 0) {
        updatedProject.coverImage = allMediaPaths[0];
      }
      
      // Données finales du projet
      console.log('Données du projet à envoyer:', updatedProject);
      console.log('Images de la galerie:', updatedProject.gallery);
      console.log('Image de couverture:', updatedProject.coverImage);
      
      // Construction du FormData pour l'envoi des données
      const formData = new FormData();
      formData.append('language', language);
      formData.append('project', JSON.stringify(updatedProject));
      
      // Appel API pour créer ou mettre à jour le projet
      const url = '/api/admin/projects';
      const method = editMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${SECRET_PASSWORD}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde du projet');
      }
      
      // Afficher le message de succès
      setToastMessage({
        type: 'success',
        message: editMode ? 'Projet mis à jour avec succès!' : 'Projet créé avec succès!'
      });
      
      // Recharger les projets
      fetchProjects();
      
      // Réinitialiser le formulaire après un délai
      setTimeout(() => {
        resetForm();
        setToastMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setToastMessage({
        type: 'error',
        message: `Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}`
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Éditer un projet existant
  const editProject = (project: Project) => {
    setCurrentProject({ ...project });
    setEditMode(true);
    
    // S'assurer que gallery est un tableau
    const gallery = Array.isArray(project.gallery) ? project.gallery : [];
    
    // Charger les images existantes dans la prévisualisation
    if (gallery.length > 0) {
      const existingMedia = gallery.map((path, index) => {
        // Extraire le nom de fichier du chemin
        const filename = path.split('/').pop() || `image_${index}.jpg`;
        
        // Vérifier si une description existe pour ce média dans project.media
        let description = '';
        if (project.media && Array.isArray(project.media)) {
          const mediaItem = project.media.find(item => item.path === path);
          if (mediaItem && mediaItem.description) {
            description = mediaItem.description;
          }
        }
        
        return {
          id: `existing_media_${index}_${Date.now()}`,
          file: new File([], filename),
          previewUrl: path,
          description: description,
          isExisting: true,
          path: path
        };
      });
      
      setMediaFiles(existingMedia);
      
      // Vérifier si le média de couverture existe
      const coverMediaExists = gallery.includes(project.coverImage || '');
      if (!coverMediaExists && gallery.length > 0) {
        // Si le média de couverture n'existe pas dans la galerie, définir le premier comme couverture
        setCurrentProject(prev => ({
          ...prev,
          coverImage: gallery[0],
          thumbnailImage: gallery[0]
        }));
        
        console.log('Média de couverture introuvable, remplacé par:', gallery[0]);
      }
    } else {
      setMediaFiles([]);
    }
  };
  
  // Supprimer un projet
  const deleteProject = async (projectId: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ce projet? Cette action est irréversible.`)) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/admin/projects?id=${projectId}&language=${language}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${SECRET_PASSWORD}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression du projet');
      }
      
      // Afficher le message de succès
      setToastMessage({
        type: 'success',
        message: 'Projet supprimé avec succès!'
      });
      
      // Recharger les projets
      fetchProjects();
      
      setTimeout(() => {
        setToastMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setToastMessage({
        type: 'error',
        message: `Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}`
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Définir une image comme couverture du projet
  const setAsCoverImage = (imagePath: string) => {
    setCurrentProject(prev => ({
      ...prev,
      coverImage: imagePath,
      // Définir aussi comme thumbnail si elle n'est pas définie
      thumbnailImage: prev.thumbnailImage || imagePath
    }));
    
    // Déterminer si c'est une vidéo ou une image
    const mediaItem = mediaFiles.find(m => (m.path || m.previewUrl) === imagePath);
    const isVideo = mediaItem?.file.type.startsWith('video/');
    
    // Afficher un message de confirmation
    setToastMessage({
      type: 'success',
      message: `${isVideo ? 'Vidéo' : 'Image'} définie comme couverture du projet`
    });
  };
  
  // Créer un bouton spécifique pour résoudre les problèmes de médias
  const fixImageIssues = () => {
    // Vérifier s'il y a des médias
    if (mediaFiles.length === 0) {
      setToastMessage({
        type: 'error',
        message: 'Aucun média à réparer'
      });
      return;
    }
    
    // Si aucun média de couverture n'est défini, utiliser le premier
    if (!currentProject.coverImage || currentProject.coverImage === '') {
      const firstMedia = mediaFiles[0];
      const isVideo = firstMedia.file.type.startsWith('video/');
      
      setCurrentProject(prev => ({
        ...prev,
        coverImage: firstMedia.path || firstMedia.previewUrl,
        thumbnailImage: firstMedia.path || firstMedia.previewUrl
      }));
      
      setToastMessage({
        type: 'success',
        message: `Premier ${isVideo ? 'vidéo' : 'image'} défini${isVideo ? 'e' : 'e'} comme couverture`
      });
    } else {
      // Vérifier si le média de couverture existe dans les médias
      const coverMediaExists = mediaFiles.some(media => 
        (media.path === currentProject.coverImage) || 
        (media.previewUrl === currentProject.coverImage)
      );
      
      if (!coverMediaExists && mediaFiles.length > 0) {
        const firstMedia = mediaFiles[0];
        const isVideo = firstMedia.file.type.startsWith('video/');
        
        setCurrentProject(prev => ({
          ...prev,
          coverImage: firstMedia.path || firstMedia.previewUrl,
          thumbnailImage: firstMedia.path || firstMedia.previewUrl
        }));
        
        setToastMessage({
          type: 'success',
          message: `Média de couverture réparé (${isVideo ? 'vidéo' : 'image'})`
        });
      } else {
        setToastMessage({
          type: 'success',
          message: 'Aucun problème détecté avec les médias'
        });
      }
    }
    
    setTimeout(() => setToastMessage(null), 2000);
  };
  
  // Animation des éléments lorsqu'ils entrent en vue
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
    
    return () => {
      document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.unobserve(el);
      });
    };
  }, [projects, mediaFiles]);
  
  // Fonction pour obtenir le logo d'un outil
  const getToolLogoComponent = (toolName: string): React.ReactNode => {
    return <ToolLogo toolName={toolName} className="w-5 h-5" />;
  };
  
  // Obtention de la date actuelle au format YYYY-MM
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };
  
  // Rendu de la page d'authentification
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-[#0D1117] mb-6">Administration</h1>
          
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-[#4A4A4A] mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputStyles}
              placeholder="Entrez le mot de passe secret"
              onKeyDown={(e) => e.key === 'Enter' && authenticate()}
            />
          </div>
          
          <button
            onClick={authenticate}
            className="w-full px-6 py-3 bg-[#FF3333] text-white rounded-full font-semibold hover:bg-[#CC0000] transition-all duration-300"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }
  
  // Page d'administration principale (après authentification)
  return (
    <div className="min-h-screen bg-[#F5F5F0] p-4 md:p-8">
      <div className="container mx-auto">
        {/* Indicateur de chargement */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-[#FF3333] border-t-transparent rounded-full animate-spin"></div>
                <span>Chargement en cours...</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Message de notification */}
        {toastMessage && (
          <div className={`${toastMessage.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'} p-4 rounded-lg mb-6 fixed top-4 right-4 left-4 md:left-auto z-50 shadow-lg flex justify-between items-center`}>
            <span>{toastMessage.message}</span>
            <button 
              onClick={() => setToastMessage(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        )}
        
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#0D1117]">Éditeur de Projets</h1>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setDebugMode(!debugMode)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-300"
              >
                {debugMode ? 'Désactiver Débogage' : 'Activer Débogage'}
              </button>
              
              <button
                onClick={toggleLanguage}
                className="px-4 py-2 bg-[#0D1117] text-white rounded-lg hover:bg-[#1A1A1A] transition-all duration-300"
              >
                {language === 'fr' ? 'English' : 'Français'}
              </button>
              
              <Link
                href="/"
                className="px-4 py-2 bg-[#FF3333] text-white rounded-lg hover:bg-[#CC0000] transition-all duration-300"
              >
                Retour au site
              </Link>
            </div>
          </div>
          
          {/* Mode débogage */}
          {debugMode && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-yellow-800 mb-2">Mode débogage activé</h3>
              <p className="text-sm mb-2">Valeurs actuelles du projet :</p>
              <pre className="bg-gray-800 text-white p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(currentProject, null, 2)}
              </pre>
              <p className="text-sm mt-4 mb-2">Valeurs des médias :</p>
              <pre className="bg-gray-800 text-white p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(mediaFiles.map(m => ({
                  id: m.id,
                  filename: m.file.name,
                  isExisting: m.isExisting,
                  path: m.path,
                  description: m.description
                })), null, 2)}
              </pre>
              <button 
                onClick={() => console.log('État complet:', { currentProject, projects, isLoading, editMode, mediaFiles })}
                className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded"
              >
                Log d'état complet (voir console)
              </button>
            </div>
          )}
          
          <div className="bg-[#F5F5F0] rounded-xl p-6">
            {/* Formulaire d'édition de projet */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#0D1117] mb-4 flex items-center">
                <span className="mr-2">
                  {editMode ? 'Modifier un projet' : 'Créer un nouveau projet'}
                </span>
                {editMode ? (
                  <span className="text-sm bg-blue-500 text-white px-2 py-1 rounded-full">
                    Édition
                  </span>
                ) : (
                  <span className="text-sm bg-green-500 text-white px-2 py-1 rounded-full">
                    Nouveau
                  </span>
                )}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations de base */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#0D1117] flex items-center">
                    <span>Informations de base</span>
                    <span className="ml-2 text-xs text-red-500">* champs requis</span>
                  </h3>
                  
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-[#4A4A4A] mb-2 flex items-center">
                      Titre du projet*
                      <span className="ml-1 text-xs text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={currentProject.title || ''}
                      onChange={handleChange}
                      onBlur={(e) => {
                        console.log('Blur sur champ title:', e.target.value);
                        generateIdAndSlug();
                      }}
                      onFocus={(e) => console.log('Focus sur champ title:', e.target.value)}
                      onClick={(e) => console.log('Clic sur champ title')}
                      data-debug="field-title"
                      className={`${inputStyles} transition-all duration-300 hover:border-[#FF3333]`}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="id" className="block text-sm font-medium text-[#4A4A4A] mb-2">
                        ID (généré automatiquement)
                      </label>
                      <input
                        type="text"
                        id="id"
                        name="id"
                        value={currentProject.id || ''}
                        onChange={handleChange}
                        className={`${inputStyles} bg-gray-50 cursor-not-allowed`}
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="slug" className="block text-sm font-medium text-[#4A4A4A] mb-2">
                        Slug URL (généré automatiquement)
                      </label>
                      <input
                        type="text"
                        id="slug"
                        name="slug"
                        value={currentProject.slug || ''}
                        onChange={handleChange}
                        className={`${inputStyles} bg-gray-50 cursor-not-allowed`}
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-[#4A4A4A] mb-2 flex items-center">
                      Catégorie*
                      <span className="ml-1 text-xs text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={currentProject.category || 'Environments'}
                      onChange={handleChange}
                      className={`${selectStyles} transition-all duration-300 hover:border-[#FF3333]`}
                      required
                    >
                      <option value="Environments">Environnements</option>
                      <option value="Props">Props</option>
                      <option value="Concepts">Concepts</option>
                      <option value="Lighting">Éclairages</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-[#4A4A4A] mb-2 flex items-center">
                      Description courte*
                      <span className="ml-1 text-xs text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={currentProject.description || ''}
                      onChange={handleChange}
                      rows={3}
                      className={`${textareaStyles} transition-all duration-300 hover:border-[#FF3333]`}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="longDescription" className="block text-sm font-medium text-[#4A4A4A] mb-2">
                      Description détaillée
                    </label>
                    <textarea
                      id="longDescription"
                      name="longDescription"
                      value={currentProject.longDescription as string || ''}
                      onChange={handleChange}
                      rows={6}
                      className={`${textareaStyles} transition-all duration-300 hover:border-[#FF3333]`}
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      name="featured"
                      checked={currentProject.featured || false}
                      onChange={(e) => setCurrentProject(prev => ({ ...prev, featured: e.target.checked }))}
                      className="h-4 w-4 text-[#FF3333] focus:ring-[#FF3333] mr-2"
                    />
                    <label htmlFor="featured" className="text-sm font-medium text-[#4A4A4A]">
                      Projet mis en avant
                    </label>
                  </div>
                </div>
                
                {/* Informations complémentaires */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#0D1117]">Informations complémentaires</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-[#4A4A4A] mb-2">
                        Date de réalisation
                      </label>
                      <input
                        type="month"
                        id="date"
                        name="date"
                        value={currentProject.date || ''}
                        onChange={handleChange}
                        className={`${inputStyles} transition-all duration-300 hover:border-[#FF3333]`}
                        placeholder={getCurrentDate()}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="projectType" className="block text-sm font-medium text-[#4A4A4A] mb-2">
                        Type de projet
                      </label>
                      <select
                        id="projectType"
                        name="projectType"
                        value={currentProject.projectType || 'Personal'}
                        onChange={handleChange}
                        className={`${selectStyles} transition-all duration-300 hover:border-[#FF3333]`}
                      >
                        <option value="Personal">Projet personnel</option>
                        <option value="Studio">Travail pour un studio</option>
                        <option value="School">Projet d'études</option>
                        <option value="Hobby">Projet de loisir</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="tools" className="block text-sm font-medium text-[#4A4A4A] mb-2">
                      Outils (séparés par des virgules)
                    </label>
                    <input
                      type="text"
                      id="tools"
                      name="tools"
                      value={currentProject.tools?.join(', ') || ''}
                      onChange={handleToolsChange}
                      className={`${inputStyles} transition-all duration-300 hover:border-[#FF3333]`}
                      placeholder="Ex: Blender, Substance Painter, Unreal Engine 5"
                    />
                    
                    {/* Prévisualisation des logos des outils */}
                    {currentProject.tools && currentProject.tools.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {currentProject.tools.map((tool, index) => {
                          const logo = getToolLogoComponent(tool);
                          return (
                            <div key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded-md animate-fade-in gap-2" style={{animationDelay: `${index * 0.1}s`}}>
                              {logo}
                              <span className="text-sm">{tool}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Téléchargement des médias */}
                  <div className="transition-all duration-300 animate-on-scroll">
                    <label className="block text-sm font-medium text-[#4A4A4A] mb-2">
                      Importer des médias
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="media-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-300"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <div className="w-16 h-16 mb-2 text-gray-400 transition-all duration-300 hover:scale-110">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                          </div>
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, WEBP, MP4, WEBM (MAX 5MB)</p>
                        </div>
                        <input
                          id="media-upload"
                          type="file"
                          className="hidden"
                          accept="image/*,video/mp4,video/webm"
                          multiple
                          onChange={handleMediaUpload}
                          ref={fileInputRef}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Prévisualisation des médias */}
              {mediaFiles.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#0D1117] flex items-center">
                    <span>Médias téléchargés</span>
                    <span className="ml-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      {mediaFiles.length}
                    </span>
                  </h3>
                  
                  {/* Boutons pour réorganiser les images */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        // Ajouter des descriptions aux images qui n'en ont pas
                        setMediaFiles(prev => prev.map((media, idx) => ({
                          ...media,
                          description: media.description || `Image ${idx + 1}`
                        })));
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 hover:scale-105"
                    >
                      Nommer les images
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        // Inverser l'ordre des images
                        setMediaFiles(prev => [...prev].reverse());
                      }}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-300 hover:scale-105"
                    >
                      Inverser l'ordre
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        // Trier par nom de fichier
                        setMediaFiles(prev => [...prev].sort((a, b) => {
                          const nameA = a.file.name.toLowerCase();
                          const nameB = b.file.name.toLowerCase();
                          return nameA.localeCompare(nameB);
                        }));
                      }}
                      className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all duration-300 hover:scale-105"
                    >
                      Trier par nom
                    </button>
                    
                    <button
                      type="button"
                      onClick={fixImageIssues}
                      className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all duration-300 hover:scale-105"
                    >
                      Réparer les médias
                    </button>
                    
                    <div className="relative">
                      <select
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "first-as-cover") {
                            // Définir le premier média comme couverture
                            if (mediaFiles.length > 0) {
                              const firstMedia = mediaFiles[0];
                              setAsCoverImage(firstMedia.path || firstMedia.previewUrl);
                            }
                          } else if (value === "cover-as-first") {
                            // Mettre le média de couverture en premier
                            const coverMedia = mediaFiles.find(media => currentProject.coverImage === (media.path || media.previewUrl));
                            if (coverMedia) {
                              const coverIndex = mediaFiles.indexOf(coverMedia);
                              if (coverIndex > 0) {
                                setMediaFiles(prev => {
                                  const newArray = [...prev];
                                  const temp = newArray[coverIndex];
                                  newArray.splice(coverIndex, 1);
                                  newArray.unshift(temp);
                                  return newArray;
                                });
                              }
                            }
                          }
                          // Réinitialiser le sélecteur
                          e.target.value = "";
                        }}
                        className={`${selectStyles} px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300`}
                      >
                        <option value="">Actions avancées...</option>
                        <option value="first-as-cover">Définir premier média comme couverture</option>
                        <option value="cover-as-first">Déplacer la couverture en première position</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mediaFiles.map((media, index) => (
                      <div key={media.id} className="relative bg-white rounded-lg overflow-hidden shadow-md animate-on-scroll">
                        <div className="absolute top-0 left-0 bg-gray-800 text-white text-xs px-2 py-1 z-10">
                          #{index + 1}
                        </div>
                        <div className="flex absolute top-0 right-0 z-10 space-x-1">
                          {index > 0 && (
                            <button
                              onClick={() => {
                                setMediaFiles(prev => {
                                  const newArray = [...prev];
                                  const temp = newArray[index];
                                  newArray[index] = newArray[index - 1];
                                  newArray[index - 1] = temp;
                                  return newArray;
                                });
                              }}
                              className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-blue-600 transition-all duration-300"
                              title="Déplacer vers le haut"
                            >
                              ↑
                            </button>
                          )}
                          {index < mediaFiles.length - 1 && (
                            <button
                              onClick={() => {
                                setMediaFiles(prev => {
                                  const newArray = [...prev];
                                  const temp = newArray[index];
                                  newArray[index] = newArray[index + 1];
                                  newArray[index + 1] = temp;
                                  return newArray;
                                });
                              }}
                              className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-blue-600 transition-all duration-300"
                              title="Déplacer vers le bas"
                            >
                              ↓
                            </button>
                          )}
                          <button
                            onClick={() => removeMedia(media.id)}
                            className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-all duration-300"
                            title="Supprimer"
                          >
                            ×
                          </button>
                        </div>
                        
                        {/* Indicateur d'image de couverture */}
                        {currentProject.coverImage === (media.path || media.previewUrl) && (
                          <div className="absolute bottom-0 left-0 bg-green-500 text-white text-xs px-2 py-1 z-10">
                            Couverture
                          </div>
                        )}
                        
                        <div className="aspect-video bg-gray-100 cursor-pointer overflow-hidden group hover:scale-[1.02] transition-all duration-300" onClick={() => {
                          setPreviewImage({ 
                            src: media.previewUrl,
                            alt: media.description || media.file.name,
                            type: media.file.type.startsWith('video/') ? 'video' : 'image'
                          });
                        }}>
                          {media.file.type.startsWith('video/') ? (
                            <video
                              src={media.previewUrl}
                              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                              muted
                              loop
                              playsInline
                              onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                              onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                            />
                          ) : (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={media.previewUrl}
                              alt={media.file.name}
                              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end">
                            <p className="text-white p-2 text-sm">{media.description || media.file.name}</p>
                          </div>
                        </div>
                        <div className="p-3">
                          <input
                            type="text"
                            placeholder="Description du média"
                            value={media.description}
                            onChange={(e) => updateMediaDescription(media.id, e.target.value)}
                            className={`${textareaStyles} hover:border-[#FF3333] transition-all duration-300`}
                          />
                          <button
                            onClick={() => setAsCoverImage(media.path || media.previewUrl)}
                            className="mt-2 w-full px-2 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-all duration-300 hover:scale-105"
                          >
                            Définir comme couverture
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Boutons d'action */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-500 text-white rounded-full font-semibold hover:bg-gray-600 transition-all duration-300"
                >
                  Annuler
                </button>
                
                <button
                  onClick={saveProject}
                  className="px-6 py-3 bg-[#FF3333] text-white rounded-full font-semibold hover:bg-[#CC0000] transition-all duration-300"
                >
                  {editMode ? 'Mettre à jour le projet' : 'Créer le projet'}
                </button>
              </div>
            </div>
          </div>
        </div>
         
        {/* Liste des projets existants */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#0D1117] mb-6 flex items-center">
            <span>Projets existants</span>
            <span className="ml-3 bg-blue-500 text-white text-sm px-3 py-1 rounded-full">
              {projects.length}
            </span>
          </h2>
          
          {projects.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg flex flex-col items-center justify-center animate-on-scroll">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
              <p className="text-gray-500">Aucun projet n'a été créé pour le moment.</p>
              <button 
                onClick={() => {
                  setCurrentProject({ ...emptyProject });
                  setEditMode(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-300"
              >
                Créer votre premier projet
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      // Tri par date (plus récents en premier)
                      setProjects(prev => [...prev].sort((a, b) => {
                        if (!a.date || !b.date) return 0;
                        return b.date.localeCompare(a.date);
                      }));
                    }}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-all duration-300"
                  >
                    Trier par date
                  </button>
                  <button
                    onClick={() => {
                      // Tri par catégorie
                      setProjects(prev => [...prev].sort((a, b) => {
                        return a.category.localeCompare(b.category);
                      }));
                    }}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-all duration-300"
                  >
                    Trier par catégorie
                  </button>
                </div>
                <button
                  onClick={() => {
                    setCurrentProject({ ...emptyProject });
                    setEditMode(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 bg-[#FF3333] text-white rounded-lg hover:bg-[#CC0000] transition-all duration-300 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Nouveau projet
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, index) => (
                  <div 
                    key={project.id} 
                    className="bg-[#F5F5F0] rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-500 hover:translate-y-[-5px] animate-on-scroll"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative aspect-video bg-gray-100 overflow-hidden group">
                      {project.thumbnailImage ? (
                        <Image
                          src={project.thumbnailImage}
                          alt={project.title}
                          fill
                          className="object-cover transition-all duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-gray-400">Pas d'image</span>
                        </div>
                      )}
                      
                      {/* Badges sur l'image */}
                      <div className="absolute top-0 right-0 p-2 flex flex-col items-end space-y-1">
                        {project.featured && (
                          <span className="bg-[#FF3333] text-white text-xs px-2 py-1 rounded-full">
                            Mis en avant
                          </span>
                        )}
                        <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                          {project.category}
                        </span>
                      </div>
                      
                      {/* Date et type de projet */}
                      <div className="absolute bottom-0 left-0 p-2">
                        <div className="flex flex-col space-y-1">
                          {project.date && (
                            <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                              {project.date}
                            </span>
                          )}
                          {project.projectType && (
                            <span className="bg-blue-500/80 text-white text-xs px-2 py-1 rounded-full">
                              {project.projectType === 'Personal' ? 'Personnel' : 
                               project.projectType === 'Studio' ? 'Studio' : 
                               project.projectType === 'School' ? 'École' : 
                               project.projectType === 'Hobby' ? 'Loisir' : 
                               project.projectType}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Overlay avec description */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                        <h3 className="text-lg font-bold text-white mb-1">{project.title}</h3>
                        <p className="text-sm text-white/90 line-clamp-2">{project.description}</p>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-[#0D1117] mb-1 transition-all duration-300 group-hover:text-[#FF3333]">{project.title}</h3>
                      <p className="text-sm text-[#4A4A4A] mb-3 line-clamp-2">{project.description}</p>
                      
                      {/* Outils utilisés avec leurs logos */}
                      {project.tools && project.tools.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {project.tools.map((tool, index) => {
                            const logo = getToolLogoComponent(tool);
                            return logo ? (
                              <div key={index} className="flex items-center bg-gray-200 px-2 py-1 rounded-md animate-fade-in hover:bg-gray-300 transition-all duration-300" style={{animationDelay: `${index * 0.1}s`}} title={tool}>
                                {logo}
                              </div>
                            ) : (
                              <span key={index} className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs transition-all duration-300 hover:bg-gray-300" title={tool}>
                                {tool.charAt(0).toUpperCase()}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editProject(project)}
                          className="flex-1 px-3 py-2 bg-[#0D1117] text-white rounded-lg text-sm hover:bg-[#1A1A1A] transition-all duration-300 hover:scale-105 flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                          Éditer
                        </button>
                        
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-all duration-300 hover:scale-105 flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Mode prévisualisation d'image en grand format */}
      {previewImage && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50"
          onClick={() => setPreviewImage(null)}
        >
          <div className="max-w-4xl max-h-[90vh] relative">
            {previewImage.type === 'video' ? (
              <video 
                src={previewImage.src}
                className="max-w-full max-h-[90vh] object-contain"
                controls
                autoPlay
                loop
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img 
                src={previewImage.src} 
                alt={previewImage.alt}
                className="max-w-full max-h-[90vh] object-contain"
              />
            )}
            <button
              className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-600 transition-all duration-300 text-xl"
              onClick={() => setPreviewImage(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* Toast message de notification */}
      {toastMessage && (
        <div className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toastMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white text-md font-medium transition-all duration-300`}>
          {toastMessage.message}
        </div>
      )}
    </div>
  );
}
