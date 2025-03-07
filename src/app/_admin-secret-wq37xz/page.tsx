"use client";
import React, { useState, useEffect } from 'react';

const AdminPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Authentification simple
  const authenticate = () => {
    if (password === PASSWORD) {
      setIsAuthenticated(true);
      setError('');
      // Charger les projets depuis l'API après authentification
      fetchProjects();
    } else {
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
          'Authorization': `Bearer ${PASSWORD}`
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

  // Effet pour charger les projets lorsque la langue change
  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    }
  }, [language, isAuthenticated]);

  // Sauvegarde du projet
  const saveProject = async () => {
    try {
      setIsLoading(true);
      
      // Validation de base
      if (!currentProject.title || !currentProject.description || !currentProject.category) {
        setError('Veuillez remplir tous les champs obligatoires');
        setIsLoading(false);
        return;
      }
      
      // Construction du FormData pour l'envoi des fichiers
      const formData = new FormData();
      formData.append('language', language);
      formData.append('project', JSON.stringify(currentProject));
      
      // Ajouter les images téléchargées
      uploadedImages.forEach((file, index) => {
        // Déterminer si cette image est celle de couverture
        if (currentProject.coverImage === `/${file.name}`) {
          formData.append('coverImage', file);
        }
        
        // Déterminer si cette image est celle de miniature
        if (currentProject.thumbnailImage === `/${file.name}`) {
          formData.append('thumbnailImage', file);
        }
        
        // Déterminer si cette image fait partie de la galerie
        if (currentProject.gallery?.includes(`/${file.name}`)) {
          formData.append('gallery', file);
        }
      });
      
      // Appel API pour créer ou mettre à jour le projet
      const url = '/api/admin/projects';
      const method = editMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${PASSWORD}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde du projet');
      }
      
      const result = await response.json();
      
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
          'Authorization': `Bearer ${PASSWORD}`
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

  if (toastMessage) {
    return (
      <div className={`${toastMessage.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'} p-4 rounded-lg mb-6 flex justify-between items-center`}>
        <span>{toastMessage.message}</span>
        <button 
          onClick={() => setToastMessage(null)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-[#FF3333] border-t-transparent rounded-full animate-spin"></div>
            <span>Chargement en cours...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => deleteProject(project.id)}
      className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-all duration-300"
    >
      Supprimer
    </button>
  );
};

export default AdminPage; 