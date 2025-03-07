"use client";

import Image from 'next/image';
import HeroSection from "./components/HeroSection";
import Navbar from "./components/Navbar";
import PortfolioSection from "./components/GallerySection";
import WorkflowSection from "./components/WorkflowSection";
import Footer from "./components/Footer";
import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "./hooks/useTranslations";

// Composant pour indiquer les sections de la page
const SectionIndicator = () => {
  const [activeSection, setActiveSection] = useState("hero");
  const { t } = useTranslations();

  useEffect(() => {
    const sections = ["hero", "portfolio", "workflow"];
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop,
        behavior: "smooth"
      });
    }
  };

  // Mapping des noms de sections pour un affichage plus propre
  const sectionDisplayNames: {[key: string]: string} = {
    "hero": t('sections.hero'),
    "portfolio": t('sections.portfolio'),
    "workflow": t('sections.workflow')
  };

  return (
    <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50 hidden md:block">
      <div className="relative">
        {/* Ligne verticale de fond */}
        <div className="absolute left-[9px] top-0 h-full w-[2px] bg-gradient-to-b from-transparent via-[#FF3333]/20 to-transparent rounded-full"></div>
        
        {/* Indicateurs de section */}
        <div className="flex flex-col space-y-8">
          {["hero", "portfolio", "workflow"].map((section) => (
            <button
              key={section}
              onClick={() => scrollToSection(section)}
              className="group relative flex items-center"
              aria-label={`${t('scroller.ariaLabel')} ${sectionDisplayNames[section]}`}
            >
              {/* Cercle indicateur */}
              <div className={`relative z-10 rounded-full border transition-all duration-300 ${
                activeSection === section 
                  ? "w-5 h-5 bg-[#FF3333] border-[#FF3333] shadow-[0_0_12px_rgba(255,51,51,0.6)]" 
                  : "w-4 h-4 bg-white border-[#FF3333]/40 group-hover:border-[#FF3333]"
              }`}></div>
              
              {/* Texte de la section */}
              <div className="relative overflow-hidden">
                <span className={`ml-3 text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  activeSection === section
                    ? "opacity-100 translate-x-0 text-[#FF3333]"
                    : "opacity-0 -translate-x-4 text-gray-600 group-hover:opacity-80 group-hover:-translate-x-1"
                }`}>
                  {sectionDisplayNames[section]}
                </span>
              </div>
              
              {/* Effet de survol */}
              {activeSection === section && (
                <div className="absolute left-[9px] w-[2px] h-6 -top-6 rounded-full bg-gradient-to-t from-[#FF3333] to-transparent"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Composant pour le bouton de retour en haut
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useTranslations();

  const handleScroll = useCallback(() => {
    if (window.scrollY > 500) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <button
      onClick={scrollToTop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed bottom-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white text-[#FF3333] border border-[#FF3333]/20 shadow-lg transition-all duration-500 z-50 overflow-hidden ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12 pointer-events-none"
      }`}
      aria-label={t('scrollToTop')}
    >
      <div className={`absolute inset-0 bg-[#FF3333] transition-all duration-500 ${
        isHovered ? "opacity-100" : "opacity-0"
      }`}></div>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-6 w-6 relative z-10 transition-colors duration-300 ${isHovered ? 'text-white' : 'text-[#FF3333]'}`} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
      <div className={`absolute -bottom-6 left-0 w-full h-2 bg-[#FF3333]/10 transform scale-x-0 transition-transform duration-500 ${
        isHovered ? "scale-x-100" : ""
      }`}></div>
    </button>
  );
};

// Composant pour les sections avec animation de défilement
const AnimatedSection = ({ id, children }: { id: string, children: React.ReactNode }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true);
          setHasAnimated(true);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <div 
      id={id} 
      ref={sectionRef}
      className={`transition-all duration-1000 ease-out ${isVisible ? 'visible opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
    >
      {children}
    </div>
  );
};

// Composant de préchargement
const Preloader = ({ onFinish }: { onFinish: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [onFinish]);
  
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <div className="w-64 bg-gray-200 h-1 rounded-full overflow-hidden">
        <div className="bg-[#FF3333] h-full w-full origin-left transform-gpu animate-[loader_2s_ease-in-out]"></div>
      </div>
    </div>
  );
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <main className="overflow-x-hidden">
      {isLoading ? (
        <Preloader onFinish={() => setIsLoading(false)} />
      ) : (
        <>
          <Navbar />
          <SectionIndicator />
          <ScrollToTop />
          
          <AnimatedSection id="hero">
            <HeroSection />
          </AnimatedSection>

          <AnimatedSection id="portfolio">
            <PortfolioSection />
          </AnimatedSection>

          <AnimatedSection id="workflow">
            <WorkflowSection />
          </AnimatedSection>

          <Footer />
        </>
      )}
    </main>
  );
}
