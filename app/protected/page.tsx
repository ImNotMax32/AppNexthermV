// Partie serveur de la page - composant principal
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  BookOpen,
  FileText,
  Calculator,
  Save,
  FileSpreadsheet,
  Building2,
  BrainCircuit,
  ArrowRight,
  Library,
  LibraryBig,
  Sparkles,
  ChevronRight,
  PlusCircle,
  Zap,
  MousePointerClick,
  Lightbulb,
  Thermometer,
  Cloud
} from "lucide-react";
import ClientEarthParticlesAnimation, { WeatherTipIcon } from "./components/ClientEarthParticlesAnimation";

// Composant principal qui charge les données et affiche la page
export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Récupérer le prénom de l'utilisateur depuis diverses sources possibles
  let firstName = user.user_metadata?.firstName || 
                 user.user_metadata?.first_name || 
                 user.user_metadata?.name || 
                 user.user_metadata?.full_name?.split(' ')[0] ||
                 user.email?.split('@')[0] ||
                 "utilisateur";
  
  // Déterminer le message de bienvenue en fonction de l'heure
  let greeting = "Bonjour";
  
  // Définition des villes pour le conseil météo
  const cities = [
    { name: 'Lyon', lat: 45.7578, lon: 4.8320 },
    { name: 'Marseille', lat: 43.2965, lon: 5.3698 },
    { name: 'Lille', lat: 50.6292, lon: 3.0573 },
    { name: 'Toulouse', lat: 43.6047, lon: 1.4442 },
    { name: 'Nantes', lat: 47.2184, lon: -1.5536 },
    { name: 'Strasbourg', lat: 48.5734, lon: 7.7521 },
    { name: 'Bordeaux', lat: 44.8378, lon: -0.5792 }
  ];
  
  // Générer aléatoirement un conseil météo pour l'utilisateur
  const randomCity = cities[Math.floor(Math.random() * cities.length)];
  const weatherTip = await fetchWeatherTip(randomCity);

  // Définition des actions principales
  const mainActions = [
    {
      title: "Dimensionnement",
      description: "Créez un dimensionnement précis de pompe à chaleur",
      icon: <Calculator className="h-8 w-8 text-white" />,
      href: "/protected/dimensionnement",
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-700",
      hoverEffect: "hover:shadow-blue-200",
      animation: "animate-fadeIn",
      buttonText: "Commencer"
    },
    {
      title: "Devis",
      description: "Générez un devis professionnel pour vos clients",
      icon: <LibraryBig className="h-8 w-8 text-white" />,
      href: "/protected/devis",
      bgColor: "bg-gradient-to-br from-purple-500 to-purple-700",
      hoverEffect: "hover:shadow-purple-200",
      animation: "animate-fadeIn animation-delay-200",
      buttonText: "Créer"
    },
    {
      title: "IA Nextherm",
      description: "Utilisez notre assistant IA pour vos questions",
      icon: <BrainCircuit className="h-8 w-8 text-white" />,
      href: "/protected/IA",
      bgColor: "bg-gradient-to-br from-emerald-500 to-emerald-700",
      hoverEffect: "hover:shadow-emerald-200",
      animation: "animate-fadeIn animation-delay-400",
      buttonText: "Consulter",
      isNew: true
    },
    {
      title: "Mes Projets",
      description: "Accédez à vos travaux et projets sauvegardés",
      icon: <Save className="h-8 w-8 text-white" />,
      href: "/protected/dimensionnement/save",
      bgColor: "bg-gradient-to-br from-amber-500 to-amber-700",
      hoverEffect: "hover:shadow-amber-200",
      animation: "animate-fadeIn animation-delay-600",
      buttonText: "Voir"
    }
  ];

  // Définition des outils additionnels
  const additionalTools = [
    {
      title: "Documentation",
      icon: <BookOpen className="h-5 w-5" />,
      href: "/protected/schema/guide",
      color: "text-indigo-600"
    },
    {
      title: "Schémathèque",
      icon: <Library className="h-5 w-5" />,
      href: "/protected/schema/schematheque",
      color: "text-teal-600"
    },
    {
      title: "Calculateurs",
      icon: <Calculator className="h-5 w-5" />,
      href: "/protected/dimensionnement",
      color: "text-orange-600"
    },
    {
      title: "Catalogue",
      icon: <FileSpreadsheet className="h-5 w-5" />,
      href: "/protected/doc-co",
      color: "text-rose-600"
    },
    {
      title: "Fonctionnement",
      icon: <Building2 className="h-5 w-5" />,
      href: "/protected/dimensionnement/fonctionnement",
      color: "text-emerald-600"
    }
  ];

  // Rendu de l'interface
  return (
    <div className="flex-1 w-full flex flex-col gap-6 p-4 md:p-8 bg-white dark:bg-gray-900 min-h-screen">
      {/* Bannière de bienvenue avec animation complexe */}
      <div className="relative overflow-hidden rounded-lg mb-8 h-48">
        {/* Animation de particules façon géothermique - côté client uniquement */}
        <ClientEarthParticlesAnimation />
        
        {/* Contenu - avec un léger effet de glassmorphisme */}
        <div className="absolute inset-0 z-10 bg-white/10 backdrop-blur-sm border border-white/20 flex flex-col justify-center px-8">
          <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md">
            {greeting}, {firstName} <Sparkles className="h-6 w-6 ml-2 text-yellow-300 animate-pulse" />
          </h1>
          <p className="mt-2 text-xl text-white/90 drop-shadow">
            Découvrez les outils qui vous attendent aujourd'hui
          </p>
        </div>
      </div>

      {/* Conseil rapide avec animation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-100 dark:border-gray-700 flex items-center gap-3 animate-slideInFromRight">
        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
          <WeatherTipIcon iconType={weatherTip.iconType} iconColor={weatherTip.iconColor} />
        </div>
        <div className="flex flex-col flex-grow">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {weatherTip.text}
          </p>
          {'source' in weatherTip && weatherTip.source && (
            <p className="text-xs text-gray-400 mt-1">Source: {weatherTip.source}</p>
          )}
        </div>
        <Button size="sm" variant="ghost" asChild>
          <a href="/protected/IA" className="text-xs flex items-center gap-1">
            Plus de conseils <ChevronRight className="h-3 w-3" />
          </a>
        </Button>
      </div>

      {/* Grille principale d'actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {mainActions.map((action: any, idx: number) => (
          <div key={action.title} className={`${action.animation} rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-[1.03] hover:translate-y-[-3px] ${action.hoverEffect}`}>
            <a href={action.href} className="block h-full">
              <div className={`h-full flex flex-col ${action.bgColor} text-white`}>
                <div className="p-4 md:p-5">
                  <div className="bg-white/10 rounded-full p-3 inline-flex mb-3">
                    {action.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-1 truncate">{action.title}</h3>
                  <p className="text-xs sm:text-sm text-white/80 mb-4 line-clamp-2 md:line-clamp-3">{action.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="flex items-center gap-1 text-xs md:text-sm font-medium group-hover:underline truncate max-w-[70%]">
                      {action.buttonText} <MousePointerClick className="h-4 w-4 animate-bounce" />
                    </span>
                    
                    {action.isNew && (
                      <Badge className="bg-white/20 text-white hover:bg-white/30 transition-colors border-0 text-xs whitespace-nowrap">
                        Nouveau
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>

      {/* Notes de mise à jour */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-blue-100 dark:border-gray-600">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Notes de mise à jour</h3>
        </div>
        
        <div className="space-y-4">
          {/* Mise à jour du jour */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-gray-300 dark:border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">Version 1.05</h4>
                <span className="text-sm text-gray-500 dark:text-gray-400">• 18 juin 2025</span>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Nouveau</Badge>
            </div>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• <strong>Sélection multiple de modèles :</strong> Possibilité de choisir parmi plusieurs modèles compatibles dans la même famille de produits</li>
              <li>• <strong>Amélioration PDF :</strong> Correction des températures d'arrêt et simplification du formulaire (seule la société est obligatoire)</li>
              <li>• <strong>Interface utilisateur :</strong> Sélecteur de modèles avec animations et recommandations visuelles</li>
            </ul>
          </div>

          {/* Mise à jour d'il y a 3 semaines */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-gray-300 dark:border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">Version 1.04.5</h4>
                <span className="text-sm text-gray-500 dark:text-gray-400">• 28 mai 2025</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Stable</Badge>
            </div>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• <strong>Page d'accueil :</strong> Nouvelle interface moderne avec animations et conseils météo personnalisés</li>
              <li>• <strong>Corrections mineures :</strong> Amélioration de la stabilité et de la performance générale</li>
              <li>• <strong>Navigation :</strong> Optimisation de l'expérience utilisateur sur tous les appareils</li>
              <li>• <strong>Design :</strong> Mise à jour de l'identité visuelle et des composants UI</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Outils supplémentaires */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
        {additionalTools.map((tool: any) => (
          <a 
            key={tool.title}
            href={tool.href}
            className="inline-flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700"
          >
            <span className={`${tool.color}`}>{tool.icon}</span>
            <span className="text-xs md:text-sm font-medium truncate">{tool.title}</span>
          </a>
        ))}
      </div>

      {/* Pied de page avec animation */}
      <div className="mt-auto pt-6 flex justify-center animate-fadeIn animation-delay-1000">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Nextherm v2.0 • Propulsé par la communauté des installateurs
        </p>
      </div>
    </div>
  );
}

// Fonction qui récupère un conseil basé sur des données météo
async function fetchWeatherTip(randomCity: { name: string; lat: number; lon: number }) {
  try {
    // Déterminer la saison actuelle (approche plus générique)
    const now = new Date();
    const month = now.getMonth(); // 0-11 (jan-dec)
    
    // Définir un type pour la variable season
    type Season = 'printemps' | 'été' | 'automne' | 'hiver';
    let season: Season = 'printemps'; // Valeur par défaut
    
    if (month >= 2 && month <= 4) {
      season = 'printemps';
    } else if (month >= 5 && month <= 7) {
      season = 'été';
    } else if (month >= 8 && month <= 10) {
      season = 'automne';
    } else {
      season = 'hiver';
    }
    
    // Conseils basés sur la saison, indépendamment de la météo actuelle
    const seasonalTips = {
      'printemps': [
        {
          id: 'spring-1',
          text: `Au printemps, c'est le moment idéal pour effectuer la maintenance annuelle de votre pompe à chaleur avant les fortes chaleurs.`,
          iconType: 'zap',
          iconColor: 'green',
          source: 'Conseils saisonniers'
        },
        {
          id: 'spring-2',
          text: `Contrôlez le bon fonctionnement de votre système de rafraîchissement avant l'arrivée des températures estivales.`,
          iconType: 'cloud',
          iconColor: 'blue',
          source: 'Conseils saisonniers'
        }
      ],
      'été': [
        {
          id: 'summer-1',
          text: `En été, réglez votre pompe à chaleur réversible à 26°C maximum pour un confort optimal et des économies d'énergie.`,
          iconType: 'thermometer',
          iconColor: 'red',
          source: 'Conseils saisonniers'
        },
        {
          id: 'summer-2',
          text: `Vérifiez que votre unité extérieure est à l'ombre pour améliorer les performances de rafraîchissement.`,
          iconType: 'cloud',
          iconColor: 'blue',
          source: 'Conseils saisonniers'
        }
      ],
      'automne': [
        {
          id: 'autumn-1',
          text: `En automne, vérifiez l'isolation de vos fenêtres et portes pour optimiser le rendement de votre chauffage.`,
          iconType: 'lightbulb',
          iconColor: 'yellow',
          source: 'Conseils saisonniers'
        },
        {
          id: 'autumn-2',
          text: `Contrôlez la pression du circuit de chauffage avant de basculer en mode hiver.`,
          iconType: 'zap',
          iconColor: 'green',
          source: 'Conseils saisonniers'
        }
      ],
      'hiver': [
        {
          id: 'winter-1',
          text: `En hiver, dégagez régulièrement l'unité extérieure de toute neige ou glace pour maintenir l'efficacité.`,
          iconType: 'thermometer',
          iconColor: 'blue',
          source: 'Conseils saisonniers'
        },
        {
          id: 'winter-2',
          text: `Réglez votre pompe à chaleur entre 19°C et 21°C pour un confort optimal et une consommation maîtrisée.`,
          iconType: 'zap',
          iconColor: 'green',
          source: 'Conseils saisonniers'
        }
      ]
    };
    
    // Obtenir aussi les données météo réelles pour enrichir le conseil
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${randomCity.lat}&longitude=${randomCity.lon}&current=temperature_2m,weather_code&timezone=auto`,
      { next: { revalidate: 3600 } } // Mettre en cache pendant 1 heure
    );

    if (weatherResponse.ok) {
      const weatherData = await weatherResponse.json();
      const temperature = weatherData.current?.temperature_2m;
      
      // Sélectionner un conseil saisonnier aléatoire pour cette saison
      const seasonTips = seasonalTips[season];
      const seasonTip = seasonTips[Math.floor(Math.random() * seasonTips.length)];
      
      // Ajouter l'information de température si disponible
      if (temperature !== undefined) {
        return {
          ...seasonTip,
          text: `${seasonTip.text} À ${randomCity.name}, il fait actuellement ${Math.round(temperature)}°C.`,
        };
      }
      
      return seasonTip;
    } else {
      // Si l'API météo échoue, utiliser uniquement le conseil saisonnier
      const seasonTips = seasonalTips[season];
      const seasonTip = seasonTips[Math.floor(Math.random() * seasonTips.length)];
      return seasonTip;
    }
    
  } catch (error) {
    console.error('Erreur météo:', error);
    
    // En cas d'erreur, utiliser des conseils statiques
    const tips = [
      {
        id: 1,
        text: "Pour un confort optimal, pensez aux systèmes réversibles qui peuvent chauffer et refroidir votre logement.",
        iconType: 'thermometer',
        iconColor: 'blue'
      },
      {
        id: 2,
        text: "Aujourd'hui est un jour idéal pour faire contrôler le rendement de votre pompe à chaleur.",
        iconType: 'zap',
        iconColor: 'yellow'
      },
      {
        id: 3,
        text: "Pensez à vérifier l'isolation de votre maison pour maximiser l'efficacité de votre chauffage géothermique.",
        iconType: 'lightbulb',
        iconColor: 'yellow'
      },
      {
        id: 4,
        text: "Un entretien régulier de votre système de pompe à chaleur peut réduire votre consommation d'énergie de 10%.",
        iconType: 'zap',
        iconColor: 'green'
      },
      {
        id: 5,
        text: "La température idéale pour un système géothermique se situe entre 18 et 20°C pour un confort optimal.",
        iconType: 'thermometer',
        iconColor: 'red'
      },
      {
        id: 6,
        text: "Saviez-vous que les pompes à chaleur air-eau peuvent fonctionner jusqu'à -20°C extérieur?",
        iconType: 'cloud',
        iconColor: 'blue'
      }
    ];
    
    // Sélection aléatoire d'un conseil du jour
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    return randomTip;
  }
}