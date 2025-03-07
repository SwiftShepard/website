// Script pour migrer les projets existants vers la nouvelle structure avec media
const fs = require('fs');
const path = require('path');

// Chemin vers le fichier de données des projets (corrigé pour correspondre à celui utilisé par l'application)
const DATA_FILE = path.join(process.cwd(), 'data/projects.json');

// Importer directement les fonctions depuis le fichier route.ts n'est pas possible en JavaScript
// Donc nous définissons ces fonctions ici

// Fonction pour lire les projets
const getProjects = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      console.log(`Fichier trouvé: ${DATA_FILE}`);
      return JSON.parse(data);
    }
    console.log(`Aucun fichier de projets trouvé à: ${DATA_FILE}`);
    return { fr: {}, en: {} };
  } catch (error) {
    console.error('Erreur lors de la lecture des projets:', error);
    return { fr: {}, en: {} };
  }
};

// Fonction pour sauvegarder les projets
const saveProjects = (projects) => {
  try {
    // S'assurer que le répertoire existe
    const directory = path.dirname(DATA_FILE);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
      console.log(`Répertoire créé: ${directory}`);
    }
    
    const data = JSON.stringify(projects, null, 2);
    fs.writeFileSync(DATA_FILE, data, 'utf8');
    console.log(`Projets sauvegardés dans: ${DATA_FILE}`);
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des projets:', error);
    return false;
  }
};

// Fonction pour migrer les projets
const migrateProjects = () => {
  console.log('Début de la migration des projets...');
  
  const projects = getProjects();
  let migrationNeeded = false;
  
  // Parcourir tous les projets en français
  Object.keys(projects.fr).forEach(projectId => {
    const project = projects.fr[projectId];
    if (project.gallery && !project.media) {
      console.log(`Migration du projet FR: ${project.title}`);
      project.media = project.gallery.map(path => ({
        path,
        description: ''
      }));
      migrationNeeded = true;
    }
  });
  
  // Parcourir tous les projets en anglais
  Object.keys(projects.en).forEach(projectId => {
    const project = projects.en[projectId];
    if (project.gallery && !project.media) {
      console.log(`Migration du projet EN: ${project.title}`);
      project.media = project.gallery.map(path => ({
        path,
        description: ''
      }));
      migrationNeeded = true;
    }
  });
  
  // Sauvegarder les projets si des modifications ont été apportées
  if (migrationNeeded) {
    saveProjects(projects);
    console.log('Migration des projets vers la structure media terminée avec succès');
  } else {
    console.log('Aucune migration nécessaire, tous les projets utilisent déjà la structure media');
  }
  
  return migrationNeeded;
};

// Exécuter la migration
migrateProjects(); 