"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useCursor } from '../context/CursorContext';

interface CursorTrail {
  x: number;
  y: number;
  opacity: number;
  id: number;
}

const CustomCursor: React.FC = () => {
  const { cursorType, isCursorEnabled } = useCursor();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [trails, setTrails] = useState<CursorTrail[]>([]);
  const trailIdRef = useRef(0);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);

  // Ne pas rendre le curseur si désactivé ou sur appareil mobile
  useEffect(() => {
    if (!isCursorEnabled) return;

    let frameCount = 0;
    const trailLifetime = 500; // Durée de vie d'une traînée en ms
    
    const updateCursorPosition = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      setPosition({ x: clientX, y: clientY });
      
      // Mise à jour de la position actuelle
      lastPositionRef.current = { x: clientX, y: clientY };
      
      if (!isVisible) setIsVisible(true);
    };

    const updateTrails = () => {
      frameCount++;
      
      // Ajouter une nouvelle traînée toutes les 3 frames
      if (frameCount % 3 === 0) {
        const { x, y } = lastPositionRef.current;
        setTrails(prevTrails => [
          ...prevTrails,
          { 
            x, 
            y, 
            opacity: 0.8, 
            id: trailIdRef.current++ 
          }
        ]);
      }
      
      // Mettre à jour l'opacité des traînées existantes et supprimer celles qui sont trop anciennes
      setTrails(prevTrails => 
        prevTrails
          .map(trail => ({
            ...trail,
            opacity: trail.opacity - 0.02 // Diminuer progressivement l'opacité
          }))
          .filter(trail => trail.opacity > 0)
      );
      
      // Continuer l'animation
      frameRef.current = requestAnimationFrame(updateTrails);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Démarrer l'animation des traînées
    frameRef.current = requestAnimationFrame(updateTrails);

    window.addEventListener('mousemove', updateCursorPosition);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', updateCursorPosition);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mouseenter', handleMouseEnter);
      
      // Annuler l'animation
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isCursorEnabled, isVisible]);

  if (!isCursorEnabled) {
    return null;
  }

  // Détermination des classes CSS en fonction de l'état du curseur
  const cursorClasses = `
    custom-cursor 
    ${isVisible ? 'cursor-visible' : ''}
    ${isClicking ? 'cursor-click' : ''} 
    ${cursorType !== 'default' ? `cursor-${cursorType}` : ''}
    ${!isClicking && cursorType === 'button' ? 'cursor-hover' : ''}
  `.trim();

  return (
    <div className="custom-cursor-container">
      {/* Traînées du curseur */}
      {trails.map(trail => (
        <div 
          key={trail.id}
          className="cursor-trail"
          style={{ 
            left: `${trail.x}px`, 
            top: `${trail.y}px`,
            opacity: trail.opacity
          }}
        />
      ))}
      
      {/* Curseur principal */}
      <div 
        className={cursorClasses}
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`
        }}
      />
    </div>
  );
};

export default CustomCursor; 