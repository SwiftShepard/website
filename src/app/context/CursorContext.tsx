"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type CursorType = 'default' | 'button' | 'image' | 'text' | 'none';

interface CursorContextType {
  cursorType: CursorType;
  setCursorType: (type: CursorType) => void;
  isCursorEnabled: boolean;
  toggleCursor: () => void;
  enableCursor: () => void;
  disableCursor: () => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export const CursorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cursorType, setCursorType] = useState<CursorType>('default');
  const [isCursorEnabled, setIsCursorEnabled] = useState(true);
  
  // Vérifier si l'appareil est tactile pour désactiver le curseur par défaut
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || 
                    navigator.maxTouchPoints > 0;
    
    // Désactiver le curseur personnalisé sur les appareils tactiles
    if (isTouch) {
      setIsCursorEnabled(false);
    }
    
    // Activer/désactiver la classe globale pour cacher le curseur par défaut
    if (isCursorEnabled) {
      document.documentElement.classList.add('hide-cursor');
    } else {
      document.documentElement.classList.remove('hide-cursor');
    }
    
    return () => {
      document.documentElement.classList.remove('hide-cursor');
    };
  }, [isCursorEnabled]);
  
  const toggleCursor = () => setIsCursorEnabled(prev => !prev);
  const enableCursor = () => setIsCursorEnabled(true);
  const disableCursor = () => setIsCursorEnabled(false);
  
  return (
    <CursorContext.Provider 
      value={{ 
        cursorType, 
        setCursorType,
        isCursorEnabled,
        toggleCursor,
        enableCursor,
        disableCursor
      }}
    >
      {children}
    </CursorContext.Provider>
  );
};

export const useCursor = (): CursorContextType => {
  const context = useContext(CursorContext);
  
  if (context === undefined) {
    throw new Error('useCursor must be used within a CursorProvider');
  }
  
  return context;
}; 