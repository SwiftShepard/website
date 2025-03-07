import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Définir le dossier d'upload
const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');

// Middleware de vérification de mot de passe
const authenticate = (request: NextRequest) => {
  // Authentification désactivée pour développement local
  return true;
};

// POST - Télécharger une image
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    if (!authenticate(request)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    // S'assurer que le dossier d'upload existe
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }
    
    // Vérifier le type de fichier
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non pris en charge. Utilisez JPG, PNG, WEBP, GIF, MP4 ou WEBM' },
        { status: 400 }
      );
    }
    
    // Générer un nom de fichier unique
    const fileExtension = file.name.split('.').pop() || '';
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    
    // Écrire le fichier
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    
    // Construire l'URL relative
    const relativePath = `/uploads/${fileName}`;
    
    return NextResponse.json({
      success: true,
      filePath: relativePath,
      fileName: fileName,
      originalName: file.name
    });
  } catch (error) {
    console.error('Erreur lors du téléchargement du fichier:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 