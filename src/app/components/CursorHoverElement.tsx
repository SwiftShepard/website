"use client";

import React, { ReactNode, ElementType } from 'react';
import { useCursor } from '../context/CursorContext';

interface CursorHoverElementProps {
  children: ReactNode;
  cursorType?: 'button' | 'image' | 'text' | 'default';
  as?: ElementType;
  className?: string;
  [x: string]: any; // Pour les props additionnelles
}

const CursorHoverElement = ({ 
  children, 
  cursorType = 'button', 
  as: Component = 'div',
  className = '',
  ...props 
}: CursorHoverElementProps) => {
  const { setCursorType } = useCursor();
  
  const handleMouseEnter = () => {
    setCursorType(cursorType);
  };
  
  const handleMouseLeave = () => {
    setCursorType('default');
  };
  
  return (
    <Component
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </Component>
  );
};

export default CursorHoverElement; 