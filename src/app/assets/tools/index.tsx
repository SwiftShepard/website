// Exports des logos officiels pour les logiciels couramment utilisés
import React, { FC, SVGProps } from 'react';
import Image from 'next/image';

// Interface pour les icônes SVG
export interface ToolIcon {
  name: string;
  icon: string; // Chemin vers l'image du logo
  keywords: string[];
}

// Collection des logos officiels des outils
export const toolIcons: ToolIcon[] = [
  {
    name: 'Blender',
    icon: '/images/logos/blender.svg',
    keywords: ['blender']
  },
  {
    name: 'Maya',
    icon: '/images/logos/maya.svg',
    keywords: ['maya', 'autodesk maya']
  },
  {
    name: 'ZBrush',
    icon: '/images/logos/zbrush.svg',
    keywords: ['zbrush', 'pixologic']
  },
  {
    name: 'Substance Painter',
    icon: '/images/logos/substance-painter.svg',
    keywords: ['substance painter', 'substance']
  },
  {
    name: 'Substance Designer',
    icon: '/images/logos/substance-designer.svg',
    keywords: ['substance designer']
  },
  {
    name: 'Photoshop',
    icon: '/images/logos/photoshop.svg',
    keywords: ['photoshop', 'ps', 'adobe photoshop']
  },
  {
    name: 'Unreal Engine',
    icon: '/images/logos/unreal-engine.svg',
    keywords: ['unreal', 'ue', 'ue4', 'ue5', 'unreal engine']
  },
  {
    name: 'Unity',
    icon: '/images/logos/unity.svg',
    keywords: ['unity', 'unity3d']
  },
  {
    name: 'Cinema 4D',
    icon: '/images/logos/cinema4d.svg',
    keywords: ['cinema 4d', 'c4d']
  },
  {
    name: '3ds Max',
    icon: '/images/logos/3dsmax.svg',
    keywords: ['3ds max', '3dsmax', 'max']
  },
  {
    name: 'Houdini',
    icon: '/images/logos/houdini.svg',
    keywords: ['houdini', 'sidefx']
  },
  {
    name: 'Marvelous Designer',
    icon: '/images/logos/marvelous-designer.svg',
    keywords: ['marvelous designer', 'marvelous']
  },
  {
    name: 'After Effects',
    icon: '/images/logos/after-effects.svg',
    keywords: ['after effects', 'ae', 'adobe after effects']
  },
  {
    name: 'Premiere Pro',
    icon: '/images/logos/premiere-pro.svg',
    keywords: ['premiere', 'premiere pro', 'adobe premiere']
  },
  {
    name: 'Marmoset',
    icon: '/images/logos/marmoset.svg',
    keywords: ['marmoset', 'marmoset toolbag', 'toolbag']
  }
];

// Composant pour afficher le logo d'un outil
export const ToolLogo: FC<{ toolName: string; className?: string }> = ({ toolName, className = "w-5 h-5" }) => {
  const toolIcon = getToolIcon(toolName);
  
  if (!toolIcon) {
    // Afficher une icône générique avec la première lettre si l'outil n'est pas reconnu
    return (
      <div className={`bg-gray-200 rounded-full flex items-center justify-center ${className}`}>
        <span className="text-xs font-semibold">{toolName.charAt(0).toUpperCase()}</span>
      </div>
    );
  }
  
  return (
    <div className={`relative ${className}`}>
      <img
        src={toolIcon.icon}
        alt={toolIcon.name}
        className="w-full h-full object-contain"
      />
    </div>
  );
};

// Fonction pour obtenir l'icône d'un outil par son nom
export const getToolIcon = (toolName: string): ToolIcon | undefined => {
  if (!toolName) return undefined;
  
  const normalizedName = toolName.toLowerCase().trim();
  
  return toolIcons.find(tool => 
    tool.name.toLowerCase() === normalizedName || 
    tool.keywords.some(keyword => normalizedName.includes(keyword))
  );
};

// Fonction pour vérifier si un outil a une icône associée
export const hasToolIcon = (toolName: string): boolean => {
  return !!getToolIcon(toolName);
}; 