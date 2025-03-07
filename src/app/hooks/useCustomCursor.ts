"use client";

import { useState, useEffect } from 'react';

type CursorType = 'default' | 'button' | 'image' | 'text' | 'none';

export default function useCustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [cursorType, setCursorType] = useState<CursorType>('default');
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Initialisation et gestion de la position du curseur
  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      // Le curseur ne devient visible qu'après le premier mouvement de souris
      if (!isVisible) {
        setIsVisible(true);
      }
    };

    // Gestion des clics
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    
    // Gestion de la sortie de la fenêtre
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Ajout des écouteurs d'événements
    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mouseenter', handleMouseEnter);

    // Ajout de la classe globale pour cacher le curseur par défaut
    document.documentElement.classList.add('hide-cursor');

    // Fonction de nettoyage
    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mouseenter', handleMouseEnter);
      
      // Suppression de la classe globale
      document.documentElement.classList.remove('hide-cursor');
    };
  }, [isVisible]);

  // Fonctions pour changer le type de curseur
  const setCursorToButton = () => setCursorType('button');
  const setCursorToImage = () => setCursorType('image');
  const setCursorToText = () => setCursorType('text');
  const setCursorToDefault = () => setCursorType('default');
  const setCursorToNone = () => setCursorType('none');

  return {
    position,
    cursorType,
    isClicking,
    isVisible,
    setCursorToButton,
    setCursorToImage,
    setCursorToText,
    setCursorToDefault,
    setCursorToNone
  };
} 