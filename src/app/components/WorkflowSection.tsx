"use client";

import { useTranslations } from '../hooks/useTranslations';
import { useEffect, useState, useRef } from 'react';

// Icônes pour les étapes
const StepIcon = ({ number }: { number: number }) => {
  switch(number) {
    case 1:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#FF3333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      );
    case 2:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#FF3333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      );
    case 3:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#FF3333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    case 4:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#FF3333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#FF3333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
  }
};

// Animation des particules pour représenter le flux de travail
const WorkflowParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const particles: {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      alpha: number;
    }[] = [];
    
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Créer des particules
    const createParticles = () => {
      const particleCount = Math.floor(canvas.width / 20); // Nombre de particules basé sur la largeur
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: Math.random() * 0.5 - 0.25,
          speedY: Math.random() * 1 + 0.2,
          color: `rgba(255, ${Math.floor(Math.random() * 30) + 20}, ${Math.floor(Math.random() * 30) + 20}, `,
          alpha: Math.random() * 0.6 + 0.1
        });
      }
    };
    
    createParticles();
    
    // Animation des particules
    const animate = () => {
      requestAnimationFrame(animate);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle, index) => {
        particle.y += particle.speedY;
        particle.x += particle.speedX;
        
        // Faire tourner les particules autour de centres d'attraction (étapes du workflow)
        const centers = [
          { x: canvas.width * 0.5, y: canvas.height * 0.2 },
          { x: canvas.width * 0.5, y: canvas.height * 0.4 },
          { x: canvas.width * 0.5, y: canvas.height * 0.6 },
          { x: canvas.width * 0.5, y: canvas.height * 0.8 }
        ];
        
        // Trouver le centre le plus proche
        centers.forEach(center => {
          const dx = center.x - particle.x;
          const dy = center.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Si proche d'un centre, ajuster légèrement la trajectoire
          if (distance < 100) {
            particle.speedX += dx * 0.0002;
            particle.speedY += dy * 0.0002;
          }
        });
        
        // Limiter la vitesse
        particle.speedX = Math.min(Math.max(particle.speedX, -1), 1);
        particle.speedY = Math.min(Math.max(particle.speedY, -1), 1);
        
        // Recycler les particules
        if (particle.y > canvas.height) {
          particle.y = 0;
          particle.x = Math.random() * canvas.width;
        }
        
        // Dessiner la particule
        ctx.beginPath();
        ctx.fillStyle = `${particle.color}${particle.alpha})`;
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
    />
  );
};

const WorkflowStep = ({ step, index, isVisible, activeStep, setActiveStep }: any) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);
  
  // Effet d'animation lors de l'entrée en vue
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setAnimate(true);
      }, index * 150); // Animation séquentielle
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, index]);
  
  // Effet de rotation 3D au survol
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientY - rect.top - rect.height / 2) / 20;
    const y = -(e.clientX - rect.left - rect.width / 2) / 20;
    
    setRotation({ x, y });
  };
  
  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };
  
  // Alternance des étapes à gauche et à droite
  const isEven = index % 2 === 0;
  
  return (
    <div 
      className={`flex items-center justify-center mb-20 w-full transform transition-all duration-700 ${
        animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className={`flex w-full items-center ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Numéro et cercle de l'étape avec animation */}
        <div className={`w-1/3 flex ${isEven ? 'justify-end mr-8' : 'justify-start ml-8'}`}>
          <div 
            className={`relative group cursor-pointer overflow-visible transform transition-transform duration-500 ${
              animate ? 'scale-100' : 'scale-0'
            }`}
            style={{ transitionDelay: `${index * 200 + 300}ms` }}
            onMouseEnter={() => setActiveStep(step.number)}
          >
            <div className={`w-24 h-24 rounded-full bg-white flex flex-col items-center justify-center border-2 transition-all duration-500 ${
              activeStep === step.number 
                ? 'border-[#FF3333] shadow-[0_0_30px_rgba(255,51,51,0.3)]' 
                : 'border-[#FF3333]/30 group-hover:border-[#FF3333] group-hover:shadow-lg'
            }`}>
              {/* Animation de l'icône et du numéro */}
              <div className="relative h-12 w-12 flex items-center justify-center">
                {/* Icône avec animation */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                  activeStep === step.number ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'
                }`} style={{ transitionDelay: '0.1s' }}>
                  <StepIcon number={index + 1} />
                </div>
                
                {/* Numéro */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                  activeStep === step.number ? 'opacity-0 scale-150' : 'opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-150'
                }`}>
                  <span className="text-2xl font-bold text-[#FF3333]">{step.number}</span>
                </div>
              </div>
            </div>
            
            {/* Cercle de pulsation */}
            <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
              activeStep === step.number ? 'animate-pulse-ring' : ''
            }`}></div>
            
            {/* Lignes rayonnantes */}
            {activeStep === step.number && (
              <div className="absolute inset-0 w-full h-full">
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute top-1/2 left-1/2 w-12 h-px bg-[#FF3333]/20 origin-left"
                    style={{ 
                      transform: `rotate(${i * 60}deg) translateY(-50%)`,
                      animation: `growLine 1.5s infinite ${i * 0.25}s` 
                    }}
                  ></div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contenu de l'étape avec effets 3D */}
        <div className="w-2/3">
          <div 
            ref={cardRef}
            className={`relative overflow-hidden p-8 rounded-xl backdrop-blur-sm transition-all duration-500 transform ${
              activeStep === step.number ? 'bg-white/95 shadow-2xl -translate-y-2 scale-[1.02]' : 'bg-white/80 shadow-md hover:shadow-xl hover:-translate-y-1'
            } group`}
            style={{
              transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) ${
                activeStep === step.number ? 'scale(1.02) translateY(-8px)' : ''
              }`,
              transitionDelay: `${index * 100}ms`
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={() => setActiveStep(step.number)}
          >
            <div className="relative z-10">
              <h3 className={`text-2xl font-bold mb-4 transition-all duration-300 ${
                activeStep === step.number ? 'text-[#FF3333]' : 'text-[#0D1117] group-hover:text-[#FF3333]'
              }`}>
                {step.title}
              </h3>
              <p className="text-[#4A4A4A] leading-relaxed">
                {step.description}
              </p>
            </div>
            
            {/* Effet de brillance */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#FF3333]/5 to-transparent transform rotate-45 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
            </div>
            
            {/* Indicateur de coin */}
            <div className={`absolute top-0 right-0 w-12 h-12 overflow-hidden transition-all duration-500 ${
              activeStep === step.number ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}>
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#FF3333] rotate-45 transform translate-x-1/4 -translate-y-1/2"></div>
              <svg className="absolute top-2 right-2 w-4 h-4 text-white z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WorkflowSection = () => {
  const { t } = useTranslations();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        if (rect.top <= window.innerHeight && rect.bottom >= 0) {
          setScrollY(window.scrollY * 0.1);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-[#F5F5F0] overflow-hidden relative">
      {/* Éléments de fond avec parallaxe */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#FF3333]/5 blur-3xl" 
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}></div>
        <div className="absolute -left-32 top-1/3 w-96 h-96 rounded-full bg-[#FF3333]/5 blur-3xl"
          style={{ transform: `translateY(${scrollY * -0.3}px)` }}></div>
        <div className="absolute right-1/4 bottom-1/4 w-48 h-48 rounded-full bg-[#FF3333]/5 blur-3xl"
          style={{ transform: `translateY(${scrollY * 0.7}px)` }}></div>
      </div>
      
      {/* Effet de particules animées */}
      <WorkflowParticles />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className={`max-w-4xl mx-auto text-center mb-16 transform transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-4xl md:text-5xl font-bold text-[#0D1117] mb-6 relative group">
            {t('workflow.title')}
            <div className="absolute -bottom-2 left-1/2 w-24 h-1 bg-[#FF3333] transform -translate-x-1/2 group-hover:w-32 transition-all duration-300"></div>
          </h2>
          <p className="text-xl text-[#4A4A4A]">
            {t('workflow.description')}
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Ligne de connexion verticale avec animation */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#FF3333]/10 via-[#FF3333]/30 to-[#FF3333]/10 transform -translate-x-1/2">
              <div className="absolute top-0 h-full w-full">
                <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-transparent via-[#FF3333] to-transparent opacity-70 animate-flow-down"></div>
              </div>
            </div>

            {/* Étapes */}
            {t('workflow.steps').map((step: any, index: number) => (
              <WorkflowStep
                key={step.number}
                step={step}
                index={index}
                isVisible={isVisible}
                activeStep={activeStep}
                setActiveStep={setActiveStep}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Styles pour les animations personnalisées */}
      <style jsx global>{`
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(255, 51, 51, 0.3); }
          70% { box-shadow: 0 0 0 10px rgba(255, 51, 51, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 51, 51, 0); }
        }
        
        @keyframes flowDown {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        
        @keyframes growLine {
          0% { transform: rotate(var(--rotation)) translateY(-50%) scaleX(0); opacity: 0.8; }
          50% { transform: rotate(var(--rotation)) translateY(-50%) scaleX(1); opacity: 0.4; }
          100% { transform: rotate(var(--rotation)) translateY(-50%) scaleX(0); opacity: 0; }
        }
        
        .animate-pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
        }
        
        .animate-flow-down {
          animation: flowDown 8s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default WorkflowSection; 