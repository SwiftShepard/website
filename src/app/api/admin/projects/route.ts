import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Project } from '@/app/utils/projects';

// Chemin vers le fichier JSON pour stocker les projets
const DATA_PATH = path.join(process.cwd(), 'data');
const PROJECTS_FILE = path.join(DATA_PATH, 'projects.json');
const UPLOAD_DIR = path.join(process.cwd(), 'public');

// Fonction pour s'assurer que les dossiers existent
const ensureDirectoriesExist = () => {
  if (!fs.existsSync(DATA_PATH)) {
    fs.mkdirSync(DATA_PATH, { recursive: true });
  }
  
  if (!fs.existsSync(PROJECTS_FILE)) {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify({ en: {}, fr: {} }));
  }
};

// Fonction pour lire les projets
const getProjects = () => {
  ensureDirectoriesExist();
  const data = fs.readFileSync(PROJECTS_FILE, 'utf8');
  return JSON.parse(data);
};

// Fonction pour écrire les projets
const saveProjects = (projects: any) => {
  ensureDirectoriesExist();
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
};

// Middleware de vérification de mot de passe
const authenticate = (request: NextRequest) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  // Remplacez par votre vrai système d'authentification
  // C'est juste un exemple simple, ne pas utiliser en production!
  return token === process.env.ADMIN_API_KEY || token === 'votre_mot_de_passe_ici';
};

// GET - Récupérer tous les projets
export async function GET(request: NextRequest) {
  try {
    // Ajouter des logs de débogage
    console.log('GET request pour les projets');
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const language = searchParams.get('language') || 'fr';
    console.log(`Paramètres: slug=${slug}, language=${language}`);
    
    // Récupérer tous les projets
    const projects = getProjects();
    console.log('Projets disponibles en', language + ':', Object.keys(projects[language] || {}));
    
    // Si un slug est spécifié, filtrer par slug
    if (slug) {
      console.log(`Recherche du projet avec slug: ${slug}`);
      
      // Rechercher d'abord dans la langue spécifiée
      const projectsData = projects[language] || {};
      let project = Object.values(projectsData).find((p: any) => p.slug === slug);
      
      // Si le projet n'est pas trouvé dans la langue spécifiée, chercher dans l'autre langue
      if (!project) {
        console.log(`Projet non trouvé en ${language}, recherche dans l'autre langue`);
        const otherLanguage = language === 'fr' ? 'en' : 'fr';
        const otherProjectsData = projects[otherLanguage] || {};
        project = Object.values(otherProjectsData).find((p: any) => p.slug === slug);
        
        if (project) {
          console.log(`Projet trouvé en ${otherLanguage}:`, (project as any).title);
        }
      } else {
        console.log(`Projet trouvé en ${language}:`, (project as any).title);
      }
      
      if (project) {
        return NextResponse.json({ projects: [project] });
      } else {
        console.log('Projet non trouvé pour le slug spécifié dans aucune langue');
        return NextResponse.json({ projects: [] });
      }
    }
    
    // Sinon, renvoyer tous les projets
    console.log('Renvoi de tous les projets');
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouveau projet
export async function POST(request: NextRequest) {
  try {
    if (!authenticate(request)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const formData = await request.formData();
    const language = formData.get('language') as string || 'fr';
    const projectData = JSON.parse(formData.get('project') as string);
    
    // Validation de base
    if (!projectData.title || !projectData.description || !projectData.category) {
      return NextResponse.json(
        { error: 'Les champs titre, description et catégorie sont obligatoires' },
        { status: 400 }
      );
    }
    
    // Générer ID si non fourni
    if (!projectData.id) {
      projectData.id = projectData.title
        .replace(/\s+/g, '')
        .replace(/[^a-zA-Z0-9]/g, '');
    }
    
    // Générer slug si non fourni
    if (!projectData.slug) {
      projectData.slug = projectData.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    }
    
    // Lire les projets existants
    const projects = getProjects();
    
    // Vérifier si le projet existe déjà
    if ((language === 'fr' && projects.fr[projectData.id]) || 
        (language === 'en' && projects.en[projectData.id])) {
      return NextResponse.json(
        { error: 'Un projet avec cet ID existe déjà' },
        { status: 400 }
      );
    }
    
    // S'assurer que gallery est un tableau
    if (!projectData.gallery) {
      projectData.gallery = [];
    }
    
    // S'assurer que media est un tableau
    if (!projectData.media) {
      projectData.media = projectData.gallery.map((path: string) => ({
        path,
        description: ''
      }));
    }
    
    // Traiter les fichiers
    const coverImage = formData.get('coverImage') as File;
    const thumbnailImage = formData.get('thumbnailImage') as File;
    const galleryImages = formData.getAll('gallery') as File[];
    
    // Sauvegarder les images
    if (coverImage) {
      const coverImagePath = `/uploads/${uuidv4()}-${coverImage.name}`;
      const buffer = Buffer.from(await coverImage.arrayBuffer());
      const uploadPath = path.join(UPLOAD_DIR, coverImagePath);
      
      // Créer le dossier uploads s'il n'existe pas
      const uploadsDir = path.join(UPLOAD_DIR, 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      fs.writeFileSync(uploadPath, buffer);
      projectData.coverImage = coverImagePath;
    }
    
    if (thumbnailImage) {
      const thumbnailImagePath = `/uploads/${uuidv4()}-${thumbnailImage.name}`;
      const buffer = Buffer.from(await thumbnailImage.arrayBuffer());
      const uploadPath = path.join(UPLOAD_DIR, thumbnailImagePath);
      
      // Créer le dossier uploads s'il n'existe pas
      const uploadsDir = path.join(UPLOAD_DIR, 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      fs.writeFileSync(uploadPath, buffer);
      projectData.thumbnailImage = thumbnailImagePath;
    }
    
    if (galleryImages.length > 0) {
      const galleryPaths: string[] = [];
      
      for (const image of galleryImages) {
        const imagePath = `/uploads/${uuidv4()}-${image.name}`;
        const buffer = Buffer.from(await image.arrayBuffer());
        const uploadPath = path.join(UPLOAD_DIR, imagePath);
        
        // Créer le dossier uploads s'il n'existe pas
        const uploadsDir = path.join(UPLOAD_DIR, 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        fs.writeFileSync(uploadPath, buffer);
        galleryPaths.push(imagePath);
      }
      
      projectData.gallery = galleryPaths;
    }
    
    // Ajouter le projet
    if (language === 'fr') {
      projects.fr[projectData.id] = projectData;
    } else if (language === 'en') {
      projects.en[projectData.id] = projectData;
    }
    
    // Sauvegarder les projets
    saveProjects(projects);
    
    return NextResponse.json({ 
      success: true, 
      id: projectData.id,
      slug: projectData.slug
    });
  } catch (error) {
    console.error('Erreur lors de la création du projet:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un projet existant
export async function PUT(request: NextRequest) {
  try {
    if (!authenticate(request)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const formData = await request.formData();
    const language = formData.get('language') as string || 'fr';
    const projectData = JSON.parse(formData.get('project') as string);
    
    // Vérifier si l'ID du projet est fourni
    if (!projectData.id) {
      return NextResponse.json(
        { error: 'ID du projet manquant' },
        { status: 400 }
      );
    }
    
    // Lire les projets existants
    const projects = getProjects();
    
    // Vérifier si le projet existe
    if (language === 'fr' && !projects.fr[projectData.id]) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      );
    } else if (language === 'en' && !projects.en[projectData.id]) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      );
    }
    
    // Mettre à jour le projet
    if (language === 'fr') {
      // Conserver les médias existants si présents
      if (projects.fr[projectData.id].media && !projectData.media) {
        projectData.media = projects.fr[projectData.id].media;
      }
      
      projects.fr[projectData.id] = projectData;
      
      // Si le projet existe aussi en anglais, mettre à jour certaines propriétés
      if (projects.en[projectData.id]) {
        projects.en[projectData.id].coverImage = projectData.coverImage;
        projects.en[projectData.id].thumbnailImage = projectData.thumbnailImage;
        projects.en[projectData.id].gallery = projectData.gallery;
        projects.en[projectData.id].media = projectData.media;
        projects.en[projectData.id].featured = projectData.featured;
      }
    } else if (language === 'en') {
      // Conserver les médias existants si présents
      if (projects.en[projectData.id].media && !projectData.media) {
        projectData.media = projects.en[projectData.id].media;
      }
      
      projects.en[projectData.id] = projectData;
      
      // Si le projet existe aussi en français, mettre à jour certaines propriétés
      if (projects.fr[projectData.id]) {
        projects.fr[projectData.id].coverImage = projectData.coverImage;
        projects.fr[projectData.id].thumbnailImage = projectData.thumbnailImage;
        projects.fr[projectData.id].gallery = projectData.gallery;
        projects.fr[projectData.id].media = projectData.media;
        projects.fr[projectData.id].featured = projectData.featured;
      }
    }
    
    // Sauvegarder les projets
    saveProjects(projects);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du projet:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un projet
export async function DELETE(request: NextRequest) {
  try {
    if (!authenticate(request)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    // Récupérer l'ID du projet à supprimer
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');
    
    if (!projectId) {
      return NextResponse.json({ error: 'ID du projet manquant' }, { status: 400 });
    }
    
    const projects = getProjects();
    
    // Supprimer le projet dans les deux langues
    let deleted = false;
    
    if (projects.fr[projectId]) {
      deleted = true;
      delete projects.fr[projectId];
    }
    
    if (projects.en[projectId]) {
      deleted = true;
      delete projects.en[projectId];
    }
    
    if (!deleted) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 });
    }
    
    saveProjects(projects);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 