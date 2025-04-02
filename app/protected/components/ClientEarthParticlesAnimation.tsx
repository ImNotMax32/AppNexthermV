// On ajoute un nouveau composant pour rendre les icônes de conseil météo côté client
"use client";

import { Bot, Cloud, Lightbulb, Thermometer, Zap } from "lucide-react";
import EarthParticlesAnimation from './EarthParticlesAnimation';

// Wrapper client pour l'animation
function ClientEarthParticlesAnimation() {
  return <EarthParticlesAnimation />;
}

export function WeatherTipIcon({ iconType, iconColor }: { iconType: string, iconColor: string }) {
  // Fonction pour obtenir la classe de couleur appropriée
  const getColorClass = () => {
    switch (iconColor) {
      case 'green':
        return 'text-green-600 dark:text-green-500';
      case 'blue':
        return 'text-blue-600 dark:text-blue-500';
      case 'red':
        return 'text-red-600 dark:text-red-500';
      case 'yellow':
        return 'text-yellow-600 dark:text-yellow-500';
      default:
        return 'text-gray-600 dark:text-gray-500';
    }
  };

  const iconClass = `h-5 w-5 ${getColorClass()}`;

  switch (iconType) {
    case 'zap':
      return <Zap className={iconClass} />;
    case 'cloud':
      return <Cloud className={iconClass} />;
    case 'thermometer':
      return <Thermometer className={iconClass} />;
    case 'lightbulb':
      return <Lightbulb className={iconClass} />;
    default:
      return <Bot className={iconClass} />;
  }
}

export default ClientEarthParticlesAnimation;
