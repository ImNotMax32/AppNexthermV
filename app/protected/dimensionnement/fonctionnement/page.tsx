'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Calculator, Lightbulb, Settings, CheckCircle } from "lucide-react";

export default function HowItWorks() {
  const features = [
    {
      icon: Calculator,
      title: "Calcul Précis",
      description: "Estimation détaillée des déperditions thermiques basée sur des algorithmes développés par nos experts"
    },
    {
      icon: Lightbulb,
      title: "Solutions Adaptées",
      description: "Propositions personnalisées pour optimiser le chauffage de votre habitat"
    },
    {
      icon: Settings,
      title: "Paramétrage Simple",
      description: "Interface intuitive permettant une prise en main rapide et efficace"
    },
    {
      icon: CheckCircle,
      title: "Fiabilité Garantie",
      description: "Logiciel développé et maintenu intégralement par notre équipe d'experts"
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-6 max-w-5xl"
    >
      {/* Section d'introduction */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Comment fonctionne notre logiciel ?</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Découvrez notre solution de dimensionnement, conçue et développée à 100% par Nextherm
        </p>
      </div>

      {/* Présentation principale */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Une solution sur mesure</CardTitle>
          <CardDescription>
            Développé intégralement par nos équipes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Notre logiciel de dimensionnement est le fruit d'une expertise approfondie 
            dans le domaine du chauffage et de la thermique. Chaque ligne de code a été 
            minutieusement pensée et assemblée par nos experts pour garantir une précision 
            optimale dans l'estimation des besoins en chauffage.
          </p>
          <p className="text-gray-600">
            Grâce à une approche logique et méthodique, nous avons créé un outil qui permet 
            d'estimer facilement les déperditions thermiques d'une habitation et de proposer 
            des solutions adaptées, le tout dans une interface simple et intuitive conçue 
            pour le plus grand confort de nos clients.
          </p>
        </CardContent>
      </Card>

      {/* Grille des caractéristiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="border border-gray-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <feature.icon className="h-6 w-6 text-[#86BC29]" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Note de conclusion */}
      <div className="mt-12 text-center">
        <Separator className="my-8" />
        <p className="text-gray-600 italic">
          "Notre engagement : vous fournir un outil professionnel, 
          précis et facile d'utilisation pour répondre à tous vos besoins en dimensionnement thermique."
        </p>
      </div>
    </motion.div>
  );
}