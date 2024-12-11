'use client';

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  ArrowRight, 
  Settings, 
  FileText, 
  ThermometerSun,
  Save,
  FileDown,
  Receipt
} from "lucide-react";
import { useRouter } from 'next/navigation';

export default function HowItWorks() {
  const router = useRouter();

  const steps = [
    {
      icon: Calculator,
      title: "Calcul des déperditions",
      description: "Notre algorithme analyse en détail les caractéristiques de votre bâtiment pour calculer précisément les déperditions thermiques.",
      details: [
        "Surface et hauteur des étages",
        "Type et année de construction",
        "Isolation et matériaux",
        "Ventilation et orientation",
      ],
      color: "from-[#86BC29]/5 to-[#86BC29]/20"
    },
    {
      icon: Settings,
      title: "Configuration du système",
      description: "Définissez les paramètres de votre future installation pour un dimensionnement optimal.",
      details: [
        "Type de pompe à chaleur",
        "Système d'émission",
        "Options de confort",
        "Paramètres techniques",
      ],
      color: "from-[#75a625]/10 to-[#86BC29]/30"
    },
    {
      icon: FileText,
      title: "Résultat et préconisations",
      description: "Obtenez une analyse complète avec les produits NEXTHERM compatibles avec votre projet.",
      details: [
        "Puissance recommandée",
        "Produits compatibles",
        "Rapport détaillé",
        "Devis personnalisé",
      ],
      color: "from-[#86BC29]/20 to-[#86BC29]/40"
    }
  ];

  const features = [
    {
      icon: Save,
      title: "Sauvegarde des projets",
      description: "Enregistrez vos dimensionnements pour y accéder ultérieurement et les modifier à tout moment"
    },
    {
      icon: FileDown,
      title: "Export PDF",
      description: "Générez des rapports détaillés au format PDF pour vos clients"
    },
    {
      icon: Receipt,
      title: "Création de devis",
      description: "Transformez facilement vos dimensionnements en devis professionnels"
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* En-tête avec animation */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl font-bold mb-4">
          Un processus simple en <span className="text-[#86BC29]">3 étapes</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Notre logiciel vous guide à travers un processus intuitif pour déterminer la solution 
          de chauffage idéale pour votre projet
        </p>
      </motion.div>

      {/* Timeline des étapes */}
      <div className="relative">
        {/* Ligne de connexion */}
        <div className="absolute left-12 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-[#86BC29]/20 to-[#86BC29]/20" />

        {/* Étapes */}
        <div className="space-y-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className="ml-20 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className={`bg-gradient-to-r ${step.color}`}>
                  <div className="flex items-center gap-3">
                    {/* Numéro d'étape */}
                    <div className="absolute -left-2 w-8 h-8 bg-[#86BC29] rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                    </div>
                    <step.icon className="h-8 w-8 text-[#86BC29]" />
                    <CardTitle className="text-2xl">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-6">{step.description}</p>
                  <ul className="grid grid-cols-2 gap-3">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 bg-[#86BC29] rounded-full" />
                        <span className="text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Section Fonctionnalités */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-16"
      >
        <h2 className="text-2xl font-bold text-center mb-8">Fonctionnalités avancées</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className=" from-[#86BC29]/5 to-[#86BC29]/10">
              <CardContent className="p-6 text-center">
                <feature.icon className="h-10 w-10 text-[#86BC29] mx-auto mb-4" />
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Appel à l'action */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-16 text-center"
      >
        <Card className=" from-[#86BC29]/10 to-transparent">
          <CardContent className="p-8">
            <ThermometerSun className="w-12 h-12 text-[#86BC29] mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Prêt à commencer ?</h3>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Notre interface intuitive vous guide à chaque étape pour vous assurer 
              un dimensionnement précis et une solution parfaitement adaptée à vos besoins.
            </p>
            <Button 
              className="bg-[#86BC29] hover:bg-[#75a625] text-white px-8 py-6 text-lg"
              onClick={() => router.push('/protected/dimensionnement')}
            >
              Commencer le dimensionnement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}