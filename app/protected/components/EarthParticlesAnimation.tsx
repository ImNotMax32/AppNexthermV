'use client';

import { useEffect, useState, useRef } from 'react';

// Composant d'animation pour la bannière avec effet de particules géothermiques
function EarthParticlesAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [timeOfDay, setTimeOfDay] = useState<string>('day');
  
  // Effet pour déterminer l'heure actuelle à Paris et définir l'ambiance du ciel
  useEffect(() => {
    // Obtenir l'heure actuelle à Paris (GMT+1)
    const updateTimeOfDay = () => {
      const now = new Date();
      const parisHour = now.getHours(); // On est déjà en heure locale
      
      // Définir le moment de la journée
      if (parisHour >= 6 && parisHour < 8) {
        setTimeOfDay('dawn'); // Aube
      } else if (parisHour >= 8 && parisHour < 17) {
        setTimeOfDay('day'); // Journée
      } else if (parisHour >= 17 && parisHour < 20) {
        setTimeOfDay('dusk'); // Crépuscule
      } else {
        setTimeOfDay('night'); // Nuit
      }
    };
    
    // Mettre à jour l'heure immédiatement
    updateTimeOfDay();
    
    // Mettre à jour l'heure toutes les minutes
    const interval = setInterval(updateTimeOfDay, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    // Récupérer les dimensions du parent
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const updateDimensions = () => {
      const parent = canvas.parentElement;
      if (parent) {
        setDimensions({
          width: parent.clientWidth,
          height: parent.clientHeight
        });
      }
    };
    
    // Mettre à jour les dimensions au chargement et au resize
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    // Vérifier que le canvas existe et a des dimensions
    if (!canvas || dimensions.width === 0) {
      return; // Sortir tôt si le canvas n'est pas prêt
    }
    
    // Définir les dimensions du canvas
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return; // Sortir tôt si le contexte 2D n'est pas disponible
    }
    
    // Constantes pour les couleurs selon le moment de la journée
    const getColors = () => {
      switch (timeOfDay) {
        case 'dawn':
          return {
            skyTop: 'rgb(255, 165, 70)',
            skyBottom: 'rgb(245, 215, 150)',
            cloudColor: 'rgba(255, 255, 255, 0.7)',
            treeColor: 'rgb(40, 70, 30)',
            particleBaseColor: {r: 230, g: 180, b: 50}
          };
        case 'day':
          return {
            skyTop: 'rgb(135, 206, 235)',
            skyBottom: 'rgb(220, 240, 255)',
            cloudColor: 'rgba(255, 255, 255, 0.8)',
            treeColor: 'rgb(34, 139, 34)',
            particleBaseColor: {r: 225, g: 180, b: 0}
          };
        case 'dusk':
          return {
            skyTop: 'rgb(255, 100, 100)',
            skyBottom: 'rgb(70, 100, 180)',
            cloudColor: 'rgba(255, 230, 230, 0.65)',
            treeColor: 'rgb(25, 55, 25)',
            particleBaseColor: {r: 220, g: 150, b: 100}
          };
        case 'night':
          return {
            skyTop: 'rgb(5, 10, 60)',
            skyBottom: 'rgb(30, 45, 110)',
            cloudColor: 'rgba(200, 200, 230, 0.3)',
            treeColor: 'rgb(10, 30, 20)',
            particleBaseColor: {r: 100, g: 130, b: 200}
          };
        default:
          return {
            skyTop: 'rgb(135, 206, 235)',
            skyBottom: 'rgb(220, 240, 255)',
            cloudColor: 'rgba(255, 255, 255, 0.8)',
            treeColor: 'rgb(34, 139, 34)',
            particleBaseColor: {r: 225, g: 180, b: 0}
          };
      }
    };
    
    const colors = getColors();
    
    // Classe pour créer des particules
    class Particle {
      x: number;
      y: number;
      radius: number;
      color: string;
      speedX: number;
      speedY: number;
      pulseFactor: number;
      pulseSpeed: number;
      originalRadius: number;
      
      constructor() {
        // On utilise l'assertion non-null (!) car on a déjà vérifié que canvas existe dans l'effet
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.radius = Math.random() * 5 + 1;
        this.originalRadius = this.radius;
        
        // Couleur des particules ajustée avec les couleurs prédéfinies
        const { r, g, b } = colors.particleBaseColor;
        const rVariation = Math.floor(Math.random() * 50);
        const gVariation = Math.floor(Math.random() * 50);
        const bVariation = Math.floor(Math.random() * 50);
        const alpha = Math.random() * 0.5 + 0.5;
        
        this.color = `rgba(${Math.min(r + rVariation, 255)}, ${Math.min(g + gVariation, 255)}, ${Math.min(b + bVariation, 255)}, ${alpha})`;
        
        this.speedX = (Math.random() - 0.5) * 1.5;
        this.speedY = (Math.random() - 0.5) * 1.5;
        this.pulseFactor = 0;
        this.pulseSpeed = Math.random() * 0.05 + 0.01;
      }
      
      // Mettre à jour la position et taille des particules
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Effet de pulsation
        this.pulseFactor += this.pulseSpeed;
        this.radius = this.originalRadius + Math.sin(this.pulseFactor) * (this.originalRadius * 0.3);
        
        // Rebondir sur les bords
        // On utilise l'assertion non-null (!) car on a déjà vérifié que canvas existe
        if (this.x + this.radius > canvas!.width || this.x - this.radius < 0) {
          this.speedX = -this.speedX;
        }
        
        if (this.y + this.radius > canvas!.height || this.y - this.radius < 0) {
          this.speedY = -this.speedY;
        }
      }
      
      // Dessiner la particule
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }
    
    // Créer un tableau de particules (nombre adaptatif selon la taille)
    const particleCount = Math.min(Math.floor((canvas!.width * canvas!.height) / 6000), 100);
    const particleArray: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      particleArray.push(new Particle());
    }
    
    // Dessiner les couches terrestres ondulantes
    function drawEarthLayers() {
      // Vérification de sécurité
      if (!canvas || !ctx) return;
      
      // Dessiner plusieurs couches avec ondulation différente pour chaque
      const layers = [
        { y: canvas!.height * 0.7, color: 'rgba(139, 69, 19, 0.7)' },  // Terre
        { y: canvas!.height * 0.8, color: 'rgba(205, 133, 63, 0.6)' }, // Argile
        { y: canvas!.height * 0.9, color: 'rgba(160, 82, 45, 0.5)' }   // Roche
      ];
      
      layers.forEach(layer => {
        ctx.beginPath();
        ctx.moveTo(0, canvas!.height);
        
        // Dessiner une courbe ondulante pour chaque couche
        for (let x = 0; x <= canvas!.width; x += 10) {
          // Réduire l'amplitude des ondulations (de 15 à 5)
          const waveHeight = Math.sin(x * 0.01 + Date.now() * 0.0005) * 5;
          ctx.lineTo(x, layer.y + waveHeight);
        }
        
        ctx.lineTo(canvas!.width, canvas!.height);
        ctx.lineTo(0, canvas!.height);
        ctx.fillStyle = layer.color;
        ctx.fill();
      });
    }
    
    // Connecter les particules proches pour créer un réseau énergétique
    function connectParticles() {
      if (!ctx) return;
      
      const maxDistance = 100;
      
      for (let i = 0; i < particleArray.length; i++) {
        for (let j = i; j < particleArray.length; j++) {
          const dx = particleArray[i].x - particleArray[j].x;
          const dy = particleArray[i].y - particleArray[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            const opacity = 1 - (distance / maxDistance);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particleArray[i].x, particleArray[i].y);
            ctx.lineTo(particleArray[j].x, particleArray[j].y);
            ctx.stroke();
          }
        }
      }
    }
    
    // Fonction pour dessiner des nuages
    function drawClouds() {
      // Vérification de sécurité
      if (!canvas || !ctx) return;
      
      const clouds = [
        { x: canvas!.width * 0.1, y: canvas!.height * 0.15, size: 40 },
        { x: canvas!.width * 0.5, y: canvas!.height * 0.1, size: 30 },
        { x: canvas!.width * 0.8, y: canvas!.height * 0.2, size: 50 }
      ];
      
      // Couleur des nuages selon le moment de la journée
      let cloudColor = colors.cloudColor;
      
      clouds.forEach(cloud => {
        // Animation légère des nuages
        const cloudX = cloud.x + Math.sin(Date.now() * 0.001) * 5;
        
        ctx.fillStyle = cloudColor;
        ctx.beginPath();
        ctx.arc(cloudX, cloud.y, cloud.size, 0, Math.PI * 2);
        ctx.arc(cloudX + cloud.size * 0.5, cloud.y - cloud.size * 0.2, cloud.size * 0.7, 0, Math.PI * 2);
        ctx.arc(cloudX + cloud.size * 0.8, cloud.y, cloud.size * 0.6, 0, Math.PI * 2);
        ctx.arc(cloudX + cloud.size * 0.4, cloud.y + cloud.size * 0.2, cloud.size * 0.7, 0, Math.PI * 2);
        ctx.arc(cloudX - cloud.size * 0.3, cloud.y + cloud.size * 0.1, cloud.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    
    // Fonction pour dessiner des arbres
    function drawTrees() {
      // Vérification de sécurité
      if (!canvas || !ctx) return;
      
      // Définir 4 arbres avec des positions et tailles différentes
      const trees = [
        { x: canvas!.width * 0.15, scale: 1.3 },   // Grand arbre à gauche
        { x: canvas!.width * 0.38, scale: 0.85 },  // Petit arbre
        { x: canvas!.width * 0.67, scale: 1.1 },   // Arbre moyen-grand
        { x: canvas!.width * 0.88, scale: 0.95 }   // Arbre moyen-petit
      ];
      
      trees.forEach(tree => {
        const x = tree.x;
        const scale = tree.scale;
        const treeHeight = canvas!.height * 0.25 * scale; // Hauteur de l'arbre ajustée
        const groundY = canvas!.height * 0.7; // Position du sol
        
        // Tronc de l'arbre avec largeur proportionnelle à la taille
        const trunkWidth = 20 * scale;
        ctx.fillStyle = 'rgba(101, 67, 33, 1)'; // Marron pour le tronc
        ctx.fillRect(x - trunkWidth/2, groundY - treeHeight * 0.4, trunkWidth, treeHeight * 0.4);
        
        // Feuillage de l'arbre (plusieurs cercles pour donner l'effet touffu)
        // Ajuster la couleur du feuillage selon le moment de la journée
        let greenHue = 120 + (Math.random() * 30 - 15);
        let leafSaturation = 70;
        let leafLightness = 35;
        
        if (timeOfDay === 'dawn') {
          // Aube: feuillage légèrement plus clair avec teinte bleutée
          leafLightness = 40;
          greenHue -= 5;
        } else if (timeOfDay === 'dusk') {
          // Crépuscule: teinte légèrement orangée
          greenHue -= 10;
        } else if (timeOfDay === 'night') {
          // Nuit: feuillage plus sombre et bleuté
          leafLightness = 20;
          leafSaturation = 50;
          greenHue += 10;
        }
        
        ctx.fillStyle = `hsla(${greenHue}, ${leafSaturation}%, ${leafLightness}%, 0.8)`;
        
        // Animation légère du feuillage avec le vent (réduite)
        const swayFactor = Math.sin(Date.now() * 0.001 + x) * 3 * scale;
        
        // Dessiner plusieurs cercles pour créer un feuillage touffu
        // Taille des cercles proportionnelle à l'échelle de l'arbre
        const radius = treeHeight * 0.25;
        
        ctx.beginPath();
        ctx.arc(x + swayFactor * 0.3, groundY - treeHeight * 0.45, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x - 15 * scale + swayFactor * 0.2, groundY - treeHeight * 0.55, radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x + 15 * scale + swayFactor * 0.4, groundY - treeHeight * 0.5, radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x + swayFactor * 0.2, groundY - treeHeight * 0.7, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    
    // Fonction d'animation principale
    function animate() {
      // S'assurer que ctx existe
      if (!ctx) return;
      
      // Nettoyer le canvas
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      
      // Dessiner le ciel en dégradé selon le moment de la journée
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas!.height * 0.7);
      
      // Définir les couleurs du ciel selon le moment de la journée
      skyGradient.addColorStop(0, colors.skyTop);
      skyGradient.addColorStop(1, colors.skyBottom);
      
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas!.width, canvas!.height * 0.7);
      
      // Dessiner quelques nuages légers
      drawClouds();
      
      // Dessiner le dégradé de terre
      const earthGradient = ctx.createLinearGradient(0, canvas!.height * 0.7, 0, canvas!.height);
      
      // Ajuster la couleur de la terre selon le moment de la journée
      if (timeOfDay === 'night') {
        // Nuit: couleurs plus sombres
        earthGradient.addColorStop(0, 'rgba(20, 80, 20, 0.9)'); // Vert foncé
        earthGradient.addColorStop(1, 'rgba(80, 40, 10, 1)'); // Marron foncé
      } else {
        // Jour: couleurs normales
        earthGradient.addColorStop(0, 'rgba(34, 139, 34, 0.9)'); // Vert forestier
        earthGradient.addColorStop(1, 'rgba(139, 69, 19, 1)'); // Marron pour la terre
      }
      
      ctx.fillStyle = earthGradient;
      ctx.fillRect(0, canvas!.height * 0.7, canvas!.width, canvas!.height * 0.3);
      
      // Dessiner les couches terrestres
      drawEarthLayers();
      
      // Dessiner un ou plusieurs arbres
      drawTrees();
      
      // Mise à jour et dessin des particules
      particleArray.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      // Connecter les particules
      connectParticles();
      
      // Continuer l'animation
      requestAnimationFrame(animate);
    }
    
    // Démarrer l'animation
    animate();
    
    // Nettoyer l'animation lors du démontage
    return () => {
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      }
    };
  }, [dimensions, timeOfDay]); // Ajouter timeOfDay comme dépendance
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full"
      style={{ zIndex: 1 }}
    />
  );
}

export default EarthParticlesAnimation;
