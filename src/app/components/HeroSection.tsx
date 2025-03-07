"use client";

import { useTranslations } from '../hooks/useTranslations';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import CursorHoverElement from './CursorHoverElement';

// Composant pour l'animation de texte avec apparition progressive
const RevealText = ({ text, delay = 0, color = "var(--text-primary)", className = "" }: { text: string, delay?: number, color?: string, className?: string }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRevealed(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <div className={`relative overflow-hidden inline-block ${className}`} ref={containerRef}>
      <span 
        className="inline-block transform transition-transform duration-1000 ease-out"
        style={{ 
          transform: isRevealed ? 'translateY(0)' : 'translateY(100%)',
          color: color
        }}
      >
        {text}
      </span>
      <div 
        className="absolute inset-0 bg-[#FF3333] transform transition-transform duration-1000 ease-in-out"
        style={{ 
          transformOrigin: 'left',
          transform: isRevealed 
            ? 'scaleX(0) translateX(100%)' 
            : 'scaleX(1) translateX(0)',
          zIndex: 1
        }}
      />
    </div>
  );
};

// Composant de particules amélioré
const Particles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesArray = useRef<any[]>([]);
  const mousePosition = useRef({ x: 0, y: 0 });
  const isMouseMoving = useRef(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
      isMouseMoving.current = true;
      
      // Réinitialiser le flag après un délai
      setTimeout(() => {
        isMouseMoving.current = false;
      }, 100);
    };
    
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    resizeCanvas();
    
    // Création des particules avec plus de variété
    const createParticles = () => {
      particlesArray.current = [];
      const numParticles = Math.floor(window.innerWidth * window.innerHeight / 9000);
      
      for (let i = 0; i < numParticles; i++) {
        const size = Math.random() * 4 + 1;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const baseDirectionX = Math.random() * 0.4 - 0.2;
        const baseDirectionY = Math.random() * 0.4 - 0.2;
        const directionX = baseDirectionX;
        const directionY = baseDirectionY;
        
        // Variation de couleurs pour plus d'impact visuel
        let color;
        const colorRandom = Math.random();
        if (colorRandom > 0.7) {
          // Particules accent (rouge)
          color = `rgba(255, 51, 51, ${Math.random() * 0.5 + 0.3})`;
        } else if (colorRandom > 0.4) {
          // Particules principales (blanc)
          color = `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`;
        } else {
          // Particules secondaires (gris foncé)
          color = `rgba(50, 50, 50, ${Math.random() * 0.2 + 0.1})`;
        }
        
        particlesArray.current.push({
          x,
          y,
          size,
          baseDirectionX,
          baseDirectionY,
          directionX,
          directionY,
          color,
          pulsing: Math.random() > 0.7,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          pulseSize: 0
        });
      }
    };
    
    createParticles();
    
    // Animation des particules améliorée
    const animate = () => {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particlesArray.current.length; i++) {
        const p = particlesArray.current[i];
        
        // Effet de pulsation
        if (p.pulsing) {
          p.pulseSize += p.pulseSpeed;
          if (p.pulseSize > 1 || p.pulseSize < 0) {
            p.pulseSpeed *= -1;
          }
          
          const currentSize = p.size + p.pulseSize;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Influence améliorée de la souris sur les particules proches
        if (isMouseMoving.current) {
          const dx = mousePosition.current.x - p.x;
          const dy = mousePosition.current.y - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            const angle = Math.atan2(dy, dx);
            const force = (150 - distance) / 400;
            p.directionX = p.baseDirectionX - Math.cos(angle) * force;
            p.directionY = p.baseDirectionY - Math.sin(angle) * force;
          } else {
            p.directionX = p.baseDirectionX;
            p.directionY = p.baseDirectionY;
          }
        }
        
        p.x += p.directionX;
        p.y += p.directionY;
        
        // Rebondissement sur les bords avec réinjection
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        
        // Connexion de particules proches avec épaisseur variable
        for (let j = i; j < particlesArray.current.length; j++) {
          const p2 = particlesArray.current[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            ctx.beginPath();
            // Gradient de couleur basé sur la distance
            const opacity = 0.2 * (1 - distance / 150);
            
            // Variation de couleur pour les connexions
            if (p.color.includes('255, 51, 51') || p2.color.includes('255, 51, 51')) {
              ctx.strokeStyle = `rgba(255, 51, 51, ${opacity * 0.8})`;
            } else {
              ctx.strokeStyle = `rgba(150, 150, 150, ${opacity * 0.5})`;
            }
            
            // Épaisseur variable selon la distance
            ctx.lineWidth = 0.5 * (1 - distance / 150);
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-80" />;
};

const HeroSection = () => {
  const { t, language } = useTranslations();
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [skillsHovered, setSkillsHovered] = useState<number | null>(null);

  useEffect(() => {
    setIsVisible(true);
    
    // Démarrer l'animation de révélation après que les autres animations soient terminées
    setTimeout(() => {
      setShowTypewriter(true);
    }, 800);

    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        if (rect.top <= window.innerHeight && rect.bottom >= 0) {
          setScrollY(window.scrollY * 0.4);
        }
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Compétences principales avec couleurs plus vives et descriptions
  const skills = [
    { name: "3D Modeling", color: "from-[#FF3333] to-[#FF5757]", description: "Creating detailed digital assets" },
    { name: "Environment Design", color: "from-[#FF3333] to-[#FF5757]", description: "Crafting immersive worlds" },
    { name: "Lighting", color: "from-[#FF3333] to-[#FF5757]", description: "Setting the perfect mood" },
    { name: "Texturing", color: "from-[#FF3333] to-[#FF5757]", description: "Adding life to surfaces" },
    { name: "Props Creation", color: "from-[#FF3333] to-[#FF5757]", description: "Building unique objects" }
  ];

  return (
    <section 
      ref={sectionRef} 
      className="relative min-h-screen bg-[#F5F5F0] flex items-center justify-center overflow-hidden"
      id="hero"
    >
      {/* Fond de particules */}
      <Particles />
      
      {/* Overlay de couleur subtil */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#000]/5 via-transparent to-[#000]/5 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 py-24 relative z-10">
        <div 
          className="max-w-6xl mx-auto"
          style={{
            transform: `perspective(1000px) rotateX(${mousePosition.y * 0.01}deg) rotateY(${mousePosition.x * 0.01}deg)`
          }}
        >
          <h1 className="text-center relative">
            <span className={`block text-7xl md:text-9xl font-bold text-[#0D1117] mb-4 transform transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              {showTypewriter ? (
                <RevealText 
                  text={t('hero.title')} 
                  delay={500} 
                  className="tracking-tight"
                />
              ) : ''}
            </span>
            <span className={`block text-6xl md:text-8xl font-bold text-[#FF3333] transform transition-all duration-700 delay-500 mb-4 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              {showTypewriter ? (
                <RevealText 
                  text={t('hero.subtitle')} 
                  delay={1000} 
                  color="#FF3333"
                  className="tracking-tight"
                />
              ) : ''}
            </span>
            {/* Ligne décorative */}
            <div className={`h-1 w-32 bg-gradient-to-r from-[#FF3333] to-transparent mx-auto mt-6 mb-8 transform transition-all duration-1000 delay-1500 ${
              isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
            }`}></div>
          </h1>

          <p className={`text-[#4A4A4A] text-xl md:text-2xl text-center mt-6 max-w-3xl mx-auto transform transition-all duration-700 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {t('hero.description')}
          </p>

          {/* Compétences avec animation et effet de survol améliorés */}
          <div className={`flex flex-wrap justify-center gap-3 mt-12 transform transition-all duration-700 delay-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {skills.map((skill, index) => (
              <CursorHoverElement
                key={index}
                className="relative group"
                onMouseEnter={() => setSkillsHovered(index)}
                onMouseLeave={() => setSkillsHovered(null)}
                cursorType="text"
              >
                <span 
                  className={`bg-gradient-to-r ${skill.color} text-white px-6 py-3 rounded-full font-medium shadow-md transition-all duration-300 inline-block`}
                  style={{ 
                    transitionDelay: `${800 + index * 100}ms`,
                    transformStyle: 'preserve-3d',
                    transform: `
                      perspective(1000px) 
                      translateZ(${skillsHovered === index ? '10px' : '0px'})
                      scale(${skillsHovered === index ? 1.1 : 1})
                    `,
                    boxShadow: skillsHovered === index 
                      ? '0 10px 25px -5px rgba(255, 51, 51, 0.3), 0 8px 10px -6px rgba(255, 51, 51, 0.2)' 
                      : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  {skill.name}
                  
                  {/* Effet de brillance */}
                  <span className="absolute inset-0 rounded-full overflow-hidden">
                    <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                  </span>
                </span>
                
                {/* Tooltip de compétence */}
                <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 bg-white text-[#0D1117] text-sm px-3 py-1 rounded shadow-lg transition-all duration-200 pointer-events-none ${
                  skillsHovered === index ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}>
                  {skill.description}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white"></div>
                </div>
              </CursorHoverElement>
            ))}
          </div>

          <div className={`mt-16 text-center transform transition-all duration-700 delay-1200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {/* Indicateur de défilement placé juste au-dessus du bouton */}
            <div className={`mb-6 flex flex-col items-center transition-all duration-1000 delay-1500 text-[#FF3333] ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}>
              <span className="mb-2">{t('common.scroll')}</span>
              <div className="w-6 h-10 border-2 border-[#FF3333] rounded-full flex justify-center p-1">
                <div className="w-1 h-1 bg-[#FF3333] rounded-full animate-scroll-down"></div>
              </div>
            </div>
            
            <CursorHoverElement
              as="a"
              href="#portfolio"
              className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-[#FF3333] to-[#FF5757] text-white font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl relative overflow-hidden group"
              style={{
                transform: `perspective(1000px) translateZ(10px) rotateX(${mousePosition.y * -0.02}deg) rotateY(${mousePosition.x * 0.02}deg)`
              }}
              cursorType="button"
            >
              <span className="relative z-10">{t('hero.cta')}</span>
              
              {/* Ajout d'une icône */}
              <svg className="w-5 h-5 ml-2 relative z-10 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              
              {/* Effet de brillance amélioré */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </div>
              
              {/* Effet d'ombre interne */}
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#FF3333]/20"></div>
            </CursorHoverElement>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 