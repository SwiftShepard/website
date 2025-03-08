"use client";

import { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';

export default function TransitionPage() {
  // États pour gérer la transition
  const [destination, setDestination] = useState<string>('/');
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Chargement');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Références pour les animations
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const objectsRef = useRef<THREE.Object3D[]>([]);
  const frameRef = useRef<number | null>(null);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const totalLoadingTime = 1000; // Réduit à 1 seconde (était 2250ms)
  const minimumLoadingTime = 500; // Réduit à 0.5 seconde (était 750ms)
  
  // Effet pour animer les points de chargement
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingText(prev => {
        if (prev === "Chargement...") return "Chargement";
        return prev + ".";
      });
    }, 400);
    
    return () => clearInterval(interval);
  }, []);
  
  // Initialisation et animation de la scène 3D avec Three.js
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Initialisation de Three.js
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Définir le fond blanc cassé
    scene.background = new THREE.Color('#F5F5F0');
    
    // Créer la caméra
    const camera = new THREE.PerspectiveCamera(
      60, // FOV
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1, // Near
      1000 // Far
    );
    camera.position.z = 10;
    cameraRef.current = camera;
    
    // Créer le renderer
    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    
    // Matériaux - plus élégants et similaires au cube
    const redGradientTexture = new THREE.CanvasTexture(createGradientTexture('#FF3333', 0.05, 0.12));
    const grayGradientTexture = new THREE.CanvasTexture(createGradientTexture('#CCCCCC', 0.02, 0.08));
    
    // Création d'un matériau avec contour pour simuler une bordure comme le cube CSS
    const createBorderedMaterial = (color: number, opacity: number, gradientTexture: THREE.Texture) => {
      // Matériau principal pour la face avec gradient
      const mainMaterial = new THREE.MeshPhysicalMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
        roughness: 0.3,
        metalness: 0.2, 
        reflectivity: 0.5,
        clearcoat: 0.4,
        clearcoatRoughness: 0.2,
        map: gradientTexture,
        emissive: new THREE.Color(color).multiplyScalar(0.2), // Effet de lueur subtil
        emissiveIntensity: 0.3,
        side: THREE.DoubleSide
      });
      
      return mainMaterial;
    };
    
    // Créer une texture de dégradé similaire au cube CSS
    function createGradientTexture(color: string, startOpacity: number, endOpacity: number): HTMLCanvasElement {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Créer un dégradé similaire aux faces du cube
        const gradient = ctx.createLinearGradient(0, 0, 128, 128);
        const baseColor = new THREE.Color(color);
        
        // Convertir la couleur en format rgba
        const getColorString = (opacity: number) => {
          return `rgba(${Math.floor(baseColor.r * 255)}, ${Math.floor(baseColor.g * 255)}, ${Math.floor(baseColor.b * 255)}, ${opacity})`;
        };
        
        gradient.addColorStop(0, getColorString(startOpacity));
        gradient.addColorStop(0.5, getColorString((startOpacity + endOpacity) / 2));
        gradient.addColorStop(1, getColorString(endOpacity));
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);
      }
      
      return canvas;
    }
    
    // Matériaux avec bordures comme le cube
    const redMaterial = createBorderedMaterial(0xFF3333, 0.85, redGradientTexture);
    const grayMaterial = createBorderedMaterial(0xCCCCCC, 0.65, grayGradientTexture);
    
    const materials = [redMaterial, grayMaterial];
    
    // Créer des primitives aléatoires
    const createObjects = () => {
      // Vider les objets existants
      objectsRef.current.forEach(obj => scene.remove(obj));
      objectsRef.current = [];
      
      // Nombre d'objets basé sur la taille de l'écran
      const objectCount = Math.min(Math.floor(window.innerWidth * 0.02), 20);
      
      // Liste des primitives possibles
      const primitiveTypes = ['box', 'sphere', 'cone', 'tetrahedron', 'cylinder', 'torus'];
      
      // Créer des primitives aléatoires
      for (let i = 0; i < objectCount; i++) {
        let geometry;
        const type = primitiveTypes[Math.floor(Math.random() * primitiveTypes.length)];
        const size = Math.random() * 0.5 + 0.2; // Taille entre 0.2 et 0.7
        
        switch(type) {
          case 'box':
            geometry = new THREE.BoxGeometry(size, size, size);
            break;
          case 'sphere':
            geometry = new THREE.SphereGeometry(size / 2, 16, 16);
            break;
          case 'cone':
            geometry = new THREE.ConeGeometry(size / 2, size, 16);
            break;
          case 'tetrahedron':
            geometry = new THREE.TetrahedronGeometry(size / 2);
            break;
          case 'cylinder':
            geometry = new THREE.CylinderGeometry(size / 3, size / 3, size, 16);
            break;
          case 'torus':
            geometry = new THREE.TorusGeometry(size / 2, size / 6, 16, 32);
            break;
          default:
            geometry = new THREE.BoxGeometry(size, size, size);
        }
        
        // Choisir un matériau (70% chance de gris, 30% chance de rouge)
        const material = materials[Math.random() > 0.3 ? 1 : 0];
        
        // Créer le mesh
        const mesh = new THREE.Mesh(geometry, material);
        
        // Ajouter des bordures (wireframe) pour un effet similaire au cube CSS
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ 
          color: material === redMaterial ? 0xFF3333 : 0xCCCCCC,
          transparent: true,
          opacity: 0.7,
          linewidth: 1 // Note: en WebGL, linewidth est limité à 1
        });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        mesh.add(wireframe);
        
        // Position aléatoire dans l'espace
        mesh.position.set(
          (Math.random() - 0.5) * 12, // x
          (Math.random() - 0.5) * 7,  // y
          (Math.random() - 0.5) * 5   // z
        );
        
        // Rotation aléatoire
        mesh.rotation.set(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        );
        
        // Vitesse et axe de rotation aléatoires
        mesh.userData = {
          rotateX: (Math.random() - 0.5) * 0.01,
          rotateY: (Math.random() - 0.5) * 0.01,
          rotateZ: (Math.random() - 0.5) * 0.01,
          posSpeed: {
            x: (Math.random() - 0.5) * 0.01,
            y: (Math.random() - 0.5) * 0.01,
            z: (Math.random() - 0.5) * 0.005
          }
        };
        
        // Ajouter à la scène et au tableau de référence
        scene.add(mesh);
        objectsRef.current.push(mesh);
      }
      
      // Ajouter des lumières
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      objectsRef.current.push(ambientLight);
      
      const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
      mainLight.position.set(5, 5, 5);
      scene.add(mainLight);
      objectsRef.current.push(mainLight);
      
      const secondaryLight = new THREE.DirectionalLight(0xFF5555, 0.3);
      secondaryLight.position.set(-5, -5, -5);
      scene.add(secondaryLight);
      objectsRef.current.push(secondaryLight);
      
      // Ajouter une lumière ponctuelle au centre pour l'effet de lueur
      const pointLight = new THREE.PointLight(0xFF3333, 0.5, 10);
      pointLight.position.set(0, 0, 2);
      scene.add(pointLight);
      objectsRef.current.push(pointLight);
    };
    
    // Gérer le redimensionnement de la fenêtre
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      
      // Mettre à jour la taille du canvas
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      
      // Mettre à jour la caméra
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      
      // Recréer les objets pour s'adapter à la nouvelle taille
      createObjects();
    };
    
    // Animation de la scène
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
      
      // Animer chaque objet
      objectsRef.current.forEach(obj => {
        if (obj.userData && obj.userData.rotateX) {
          // Rotation continue
          obj.rotation.x += obj.userData.rotateX;
          obj.rotation.y += obj.userData.rotateY;
          obj.rotation.z += obj.userData.rotateZ;
          
          // Mouvement libre
          obj.position.x += obj.userData.posSpeed.x;
          obj.position.y += obj.userData.posSpeed.y;
          obj.position.z += obj.userData.posSpeed.z;
          
          // Effet de pulsation subtil (variation de taille)
          if (obj.userData.pulseFactor === undefined) {
            obj.userData.pulseFactor = 0;
            obj.userData.pulseSpeed = Math.random() * 0.02 + 0.01;
            obj.userData.originalScale = obj.scale.x;
          }
          
          obj.userData.pulseFactor += obj.userData.pulseSpeed;
          const pulseMagnitude = Math.sin(obj.userData.pulseFactor) * 0.05 + 1;
          obj.scale.set(
            obj.userData.originalScale * pulseMagnitude,
            obj.userData.originalScale * pulseMagnitude,
            obj.userData.originalScale * pulseMagnitude
          );
          
          // Faire varier légèrement l'opacité pour un effet de brillance
          if (obj.children.length > 0 && obj.children[0].type === 'LineSegments') {
            const wireframe = obj.children[0] as THREE.LineSegments;
            if (wireframe.material instanceof THREE.LineBasicMaterial) {
              wireframe.material.opacity = 0.6 + Math.sin(obj.userData.pulseFactor * 2) * 0.2;
            }
          }
          
          // Rebonds sur les bords
          const limit = { x: 6, y: 4, z: 3 };
          
          // Vérifier les limites en X
          if (Math.abs(obj.position.x) > limit.x) {
            obj.userData.posSpeed.x *= -1;
          }
          
          // Vérifier les limites en Y
          if (Math.abs(obj.position.y) > limit.y) {
            obj.userData.posSpeed.y *= -1;
          }
          
          // Vérifier les limites en Z
          if (Math.abs(obj.position.z) > limit.z) {
            obj.userData.posSpeed.z *= -1;
          }
        }
      });
      
      // Faible rotation de la caméra pour un effet dynamique
      if (cameraRef.current) {
        cameraRef.current.position.x = Math.sin(Date.now() * 0.0003) * 0.5;
        cameraRef.current.position.y = Math.cos(Date.now() * 0.0004) * 0.3;
        cameraRef.current.lookAt(0, 0, 0);
      }
      
      // Rendu de la scène
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      
      // Continuer l'animation
      frameRef.current = requestAnimationFrame(animate);
    };
    
    // Initialiser la scène
    createObjects();
    window.addEventListener('resize', handleResize);
    
    // Démarrer l'animation
    animate();
    
    // Nettoyage
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      // Nettoyer la mémoire Three.js
      objectsRef.current.forEach(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          
          if (obj.material instanceof THREE.Material) {
            obj.material.dispose();
          } else if (Array.isArray(obj.material)) {
            obj.material.forEach(material => material.dispose());
          }
        }
      });
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);
  
  // Effet pour gérer la transition et la redirection
  useEffect(() => {
    // Récupère l'URL de destination
    const urlFromStorage = localStorage.getItem('nextPageUrl');
    const targetUrl = urlFromStorage || '/';
    console.log('URL cible :', targetUrl);
    setDestination(targetUrl);
    
    // Enregistrer le temps de démarrage
    startTimeRef.current = Date.now();
    
    // Simulation du chargement linéaire basée sur le temps
    const updateProgress = () => {
      const elapsedTime = Date.now() - startTimeRef.current;
      const calculatedProgress = Math.min((elapsedTime / totalLoadingTime) * 100, 99);
      setProgress(calculatedProgress);
      
      if (calculatedProgress < 99) {
        requestAnimationFrame(updateProgress);
      }
    };
    
    // Démarrer la mise à jour de la progression
    requestAnimationFrame(updateProgress);
    
    // Fonction pour terminer le chargement et rediriger
    const finishLoadingAndRedirect = () => {
      console.log('Préparation de la redirection vers', targetUrl);
      setProgress(100);
      
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
      
      // Déclencher l'animation de sortie
      redirectTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(true);
        
        // Attendre que l'animation de transition soit terminée
        setTimeout(() => {
          try {
            // Ajouter une classe temporaire pour la transition au body
            document.body.classList.add('page-transition-out');
            document.documentElement.style.setProperty('--transition-bg-color', '#F5F5F0');
            
            // Nettoyage avant redirection
            localStorage.removeItem('nextPageUrl');
            
            // Redirection
            console.log('Redirection vers', targetUrl);
            window.location.href = targetUrl;
          } catch (error) {
            console.error('Erreur lors de la redirection:', error);
            window.location.href = '/';
          }
        }, 300); // Délai de transition réduit de 750ms à 300ms
      }, 100); // Délai pour montrer la barre à 100% réduit de 300ms à 100ms
    };
    
    // Préprepare la redirection au cas où le chargement régulier échouerait
    const safetyTimeout = setTimeout(() => {
      console.log('Délai de sécurité atteint, redirection forcée');
      finishLoadingAndRedirect();
    }, 3000); // Réduit de 6 secondes à 3 secondes
    
    // Précharger la page de destination si c'est une page de projet
    if (targetUrl.startsWith('/projects/')) {
      const projectSlug = targetUrl.split('/').pop();
      const lang = localStorage.getItem('language') || 'fr';
      
      console.log('Préchargement du projet:', projectSlug);
      
      fetch(`/api/admin/projects?slug=${projectSlug}&language=${lang}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Projet non trouvé');
          }
          return response.json();
        })
        .then(data => {
          console.log('Projet préchargé avec succès:', projectSlug);
          
          // S'assurer que le temps minimum de chargement est respecté
          const elapsedTime = Date.now() - startTimeRef.current;
          const remainingTime = Math.max(0, totalLoadingTime - elapsedTime);
          
          setTimeout(() => {
            finishLoadingAndRedirect();
          }, remainingTime);
        })
        .catch(error => {
          console.error('Erreur lors du préchargement:', error);
          
          // En cas d'erreur, attendre au moins le temps minimum
          const elapsedTime = Date.now() - startTimeRef.current;
          const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);
          
          setTimeout(() => {
            finishLoadingAndRedirect();
          }, remainingTime);
        });
    } else {
      // Pour les autres pages, attendre le temps de chargement total
      setTimeout(finishLoadingAndRedirect, totalLoadingTime);
    }
    
    return () => {
      clearTimeout(safetyTimeout);
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);
  
  const handleForceRedirect = () => {
    localStorage.removeItem('nextPageUrl');
    window.location.href = destination;
  };
  
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#F5F5F0] text-[#333]">
      {/* Fond 3D avec primitives Three.js */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      
      {/* Contenu central */}
      <div className={`relative z-10 flex flex-col items-center transition-opacity duration-700 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {/* Cube 3D tournoyant */}
        <div className="mb-12">
          <div className="cube-container">
            <div className="cube">
              <div className="cube-face cube-face-front"></div>
              <div className="cube-face cube-face-back"></div>
              <div className="cube-face cube-face-right"></div>
              <div className="cube-face cube-face-left"></div>
              <div className="cube-face cube-face-top"></div>
              <div className="cube-face cube-face-bottom"></div>
            </div>
          </div>
        </div>
        
        {/* Barre de progression */}
        <div className="w-80 h-1 bg-[#E0E0E0] rounded-full overflow-hidden mb-6">
          <div 
            className="h-full bg-gradient-to-r from-[#FF3333] to-[#FF5757] rounded-full"
            style={{ width: `${progress}%`, transition: 'width 0.2s linear' }}
          />
        </div>
        
        {/* Texte et pourcentage */}
        <div className="flex items-center mb-2">
          <span className="text-[#555] font-medium">{loadingText}</span>
          <span className="ml-2 text-[#FF3333] font-medium">({Math.round(progress)}%)</span>
        </div>
        
        {/* Destination */}
        <div className="text-xs text-[#777] mb-8">
          Vers: {destination.replace('/projects/', 'Projet: ')}
        </div>
      </div>
      
      {/* Overlay de transition pour sortie élégante */}
      <div 
        className={`absolute inset-0 z-20 transition-opacity duration-750 ease-in-out ${
          isTransitioning ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: 'var(--transition-bg-color)' }}
      />
    </div>
  );
} 