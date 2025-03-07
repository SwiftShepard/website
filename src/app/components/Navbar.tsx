"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Link from "next/link";
import ThemeToggle from './ThemeToggle';
import { useCursor } from '../context/CursorContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const { setCursorType } = useCursor();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = {
    en: [
      { label: 'Home', href: '#' },
      { label: 'Portfolio', href: '#portfolio' },
      { label: 'Contact', href: '#contact' }
    ],
    fr: [
      { label: 'Accueil', href: '#' },
      { label: 'Portfolio', href: '#portfolio' },
      { label: 'Contact', href: '#contact' }
    ]
  };

  const currentMenuItems = menuItems[language];

  const handleMenuItemClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className={`fixed w-full z-50 px-4 transition-all duration-300 ${
      isScrolled ? 'top-4' : 'top-6'
    }`}>
      <div className="container mx-auto">
        <div className={`bg-white/95 backdrop-blur-md rounded-full border border-[#FF3333]/10 px-8 py-4 max-w-3xl mx-auto shadow-xl relative transition-all duration-300 ${
          isScrolled ? 'shadow-2xl bg-white/98' : ''
        }`}>
          <div className="flex justify-between items-center relative z-[2]">
            <Link 
              href="/" 
              className="text-[#0D1117] font-bold text-xl relative group"
              aria-label="Home"
            >
              <span className="text-[#FF3333]">V</span>alentin <span className="text-[#FF3333]">L</span>othe
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF3333] transition-all duration-300 group-hover:w-full"></span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              
              <button
                onClick={toggleLanguage}
                className="relative w-16 h-8 rounded-full bg-[#f5f5f0] border border-[#FF3333]/20 flex items-center px-1 micro-scale transition-all duration-300"
                aria-label="Changer de langue"
              >
                <div className={`absolute w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center text-xs font-bold transform transition-transform duration-300 ${
                  language === 'en' ? 'translate-x-0 text-[#333]' : 'translate-x-8 text-[#333]'
                }`}>
                  {language === 'en' ? 'EN' : 'FR'}
                </div>
                <span className={`absolute left-2 text-xs font-semibold transition-opacity duration-300 ${
                  language === 'en' ? 'opacity-0' : 'opacity-100 text-[#FF3333]'
                }`}>
                  EN
                </span>
                <span className={`absolute right-2 text-xs font-semibold transition-opacity duration-300 ${
                  language === 'en' ? 'opacity-100 text-[#FF3333]' : 'opacity-0'
                }`}>
                  FR
                </span>
              </button>
            </div>

            {/* Menu desktop */}
            <div className="hidden md:flex items-center gap-2">
              {currentMenuItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="min-w-[100px] text-center px-4 py-2 text-[#333] hover:text-[#FF3333] transition-colors relative font-medium rounded-full"
                  onClick={handleMenuItemClick}
                >
                  {item.label}
                </a>
              ))}
            </div>
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-[#0D1117] hover:text-[#FF3333] transition-all duration-300 p-2 relative group"
              aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              onMouseEnter={() => setCursorType('button')}
              onMouseLeave={() => setCursorType('default')}
            >
              <div className="relative transform group-hover:scale-110 transition-transform duration-300">
                {isMenuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </div>
            </button>
          </div>

          {/* Effet de brillance */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 rounded-full opacity-50"></div>
        </div>

        {/* Menu mobile */}
        <div className={`
          md:hidden absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl mx-4 shadow-lg overflow-hidden
          transform transition-all duration-300 ease-in-out
          ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
        `}>
          <div className="p-6 space-y-6">
            {currentMenuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                onClick={handleMenuItemClick}
                className="block text-[#0D1117] hover:text-[#FF3333] transition-all duration-300 text-sm font-semibold uppercase tracking-wider relative group"
              >
                <span className="relative z-10 inline-block transform group-hover:translate-x-2 transition-transform duration-300">
                  {item.label}
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-px bg-[#FF3333] group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
            <div className="flex items-center gap-2">
              {/* Bouton de changement de langue */}
              <button 
                onClick={toggleLanguage}
                className="w-[80px] text-center px-4 py-2 transition-colors border border-[#FF3333]/10 rounded-full font-medium hover:bg-gray-100/80 text-[#FF3333]"
              >
                {language === 'en' ? 'Français' : 'English'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 