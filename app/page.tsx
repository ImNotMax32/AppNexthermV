'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calculator, FileText, HeadphonesIcon } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { AnimatePresence, } from 'framer-motion';
import Link from 'next/link';



type TypingAction = {
  type: 'type' | 'delete' | 'pause';
  content?: string;
  duration?: number;
};

const colorizeCode = (code: string) => {
  return code;
};

export default function HomePage() {
  const [displayText, setDisplayText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
  const [openSection, setOpenSection] = useState<number | null>(null);
  const [expandedContent, setExpandedContent] = useState<string>('');

  const typingSequences = [
    // Séquence 1: Informations sur Nextherm
    [
      { type: 'type', content: '🚀 Bienvenue dans l\'écosystème Nextherm !\n\n' },
      { type: 'pause', duration: 300 },
      { type: 'type', content: 'Notre mission : Révolutionner l\'installation des solutions\n' },
      { type: 'type', content: 'géothermiques grâce à des outils numériques de pointe.\n\n' },
      { type: 'pause', duration: 200 },
      { type: 'type', content: '✅ Dimensionnement intelligent avec IA prédictive\n' },
      { type: 'pause', duration: 200 },
      { type: 'type', content: '✅ Bibliothèque technique interactive et personnalisable\n' },
      { type: 'pause', duration: 200 },
      { type: 'type', content: '✅ Création de devis avec base de données Nextherm\n\n' },
      { type: 'pause', duration: 300 },
      { type: 'type', content: 'Rejoignez les professionnels qui transforment le secteur du\nchauffage et de la climatisation avec Nextherm.' }
    ],

    // Séquence 2: Faits sur la géothermie
    [
      { type: 'type', content: '🌍 La géothermie en France - Le saviez-vous ?\n\n' },
      { type: 'pause', duration: 300 },
      { type: 'type', content: 'Une pompe à chaleur géothermique peut couvrir 100% des\n' },
      { type: 'type', content: 'besoins en chauffage et en eau chaude d\'une maison.\n\n' },
      { type: 'pause', duration: 200 },
      { type: 'type', content: '♻️ Elle permet de réduire les émissions de CO2 de 75%\n' },
      { type: 'pause', duration: 200 },
      { type: 'type', content: '💰 Et d\'économiser jusqu\'à 70% sur votre facture énergétique !\n\n' },
      { type: 'pause', duration: 300 },
      { type: 'type', content: 'Une énergie renouvelable, durable et accessible.' }
    ],
    
    // Séquence 3: Avantages Nextherm
    [
      { type: 'type', content: '✨ Pourquoi choisir Nextherm ?\n\n' },
      { type: 'pause', duration: 300 },
      { type: 'type', content: '📊 Des calculs précis pour une performance optimale\n' },
      { type: 'pause', duration: 200 },
      { type: 'type', content: '🔍 Une expertise reconnue depuis plus de 40 ans\n' },
      { type: 'pause', duration: 200 },
      { type: 'type', content: '👥 Une équipe de spécialistes à votre service\n' },
      { type: 'pause', duration: 200 },
      { type: 'type', content: '🛠️ Des outils numériques développés spécifiquement\n' },
      { type: 'type', content: '    pour les professionnels du secteur\n\n' },
      { type: 'pause', duration: 300 },
      { type: 'type', content: 'Nextherm, votre partenaire pour la transition énergétique.' }
    ]
  ];
  useEffect(() => {
    let currentText = '';
    let isRunning = true; // Pour gérer le cleanup

    const getRandomTypingSpeed = () => {
      return Math.random() * 30 + 40;
    };

    const getRandomDeletingSpeed = () => {
      return Math.random() * 15 + 15;
    };

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const deleteText = async () => {
      while (currentText.length > 0 && isRunning) {
        const charsToDelete = Math.min(3 + Math.floor(Math.random() * 2), currentText.length);
        currentText = currentText.slice(0, -charsToDelete);
        setDisplayText(colorizeCode(currentText));
        await sleep(getRandomDeletingSpeed());
      }
    };

    const executeTypingSequence = async () => {
      let localTemplateIndex = 0; // Index local pour suivre la séquence courante

      while (isRunning) {
        const currentSequence = typingSequences[localTemplateIndex];
        currentText = ''; // Réinitialiser le texte au début de chaque séquence

        // Phase de frappe
        for (const action of currentSequence) {
          if (!isRunning) break;
          if (!document.hasFocus()) {
            await sleep(100);
            continue;
          }

          switch (action.type) {
            case 'type':
              if (action.content) {
                for (let char of action.content) {
                  if (!isRunning) break;
                  currentText += char;
                  setDisplayText(colorizeCode(currentText));
                  await sleep(getRandomTypingSpeed());
                }
              }
              break;

            case 'delete':
              const deleteCount = action.duration ? Math.floor(action.duration / 30) : 1;
              for (let i = 0; i < deleteCount; i++) {
                if (!isRunning) break;
                currentText = currentText.slice(0, -1);
                setDisplayText(colorizeCode(currentText));
                await sleep(30);
              }
              break;

            case 'pause':
              if (isRunning) {
                await sleep(action.duration || 150);
              }
              break;
          }
        }

        if (isRunning) {
          setIsTypingComplete(true);
          await sleep(5000);
          setIsTypingComplete(false);
          await deleteText();
          
          // Passer à la séquence suivante
          localTemplateIndex = (localTemplateIndex + 1) % typingSequences.length;
          await sleep(1000);
        }
      }
    };

    executeTypingSequence();

    // Cleanup function
    return () => {
      isRunning = false;
    };
  }, []);

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

    return (
    <div className="min-h-screen">
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Left Column */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              // @ts-ignore
              className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left"
            >
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="font-bold text-gray-900 tracking-tight"
                style={{
                  fontSize: 'clamp(2.25rem, 5vw, 4rem)',
                  lineHeight: '1.1',
                }}
              >
                Les applications
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="block"
                  style={{ 
                    color: '#86BC29',
                    fontSize: 'inherit',
                  }}
                >
                  Nextherm
                </motion.span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                // @ts-ignore
                className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl"
              >
                Des outils professionnels conçus pour les installateurs : dimensionnement précis, schématèques détaillées, et assistance technique complète.
              </motion.p>
              <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0"
                >
                  <Button 
                    asChild 
                    className="bg-white hover:bg-gray-100 text-black border border-gray-200 rounded-full text-lg px-8 py-4 inline-flex items-center justify-center transform transition-all duration-300 hover:shadow-lg"
                  >
                    <Link href="/protected">
                      Accéder aux outils
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </motion.div>
                    </Link>
                  </Button>
                </motion.div>
            </motion.div>

                      {/* Right Column - Terminal clair */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                // @ts-ignore
                className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center"
              >
                <div className="w-full rounded-xl shadow-lg overflow-hidden bg-white border border-gray-200 text-gray-800">
                  {/* Terminal Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="text-sm text-gray-600 font-medium">nextherm-info.txt</div>
                    <div className="w-12"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 overflow-hidden">
                    <pre className="font-sans text-[15px] leading-relaxed tracking-wide whitespace-pre-wrap text-gray-700">
                      <code 
                        className="block relative"
                        dangerouslySetInnerHTML={{ 
                          __html: displayText + (
                            !isTypingComplete ? '<span class="animate-pulse text-[#86BC29] ml-1 -mr-1 inline-block">│</span>' : ''
                          )
                        }}
                      />
                    </pre>
                  </div>
                </div>
              </motion.div>
          </div>
        </div>
      </section>

<motion.section 
  variants={container}
  initial="hidden"
  whileInView="show"
  viewport={{ once: true }}
  className="py-16 bg-white w-full relative"
>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Grid des features */}
    <motion.div 
      variants={container}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full items-stretch"
      style={{
        display: 'grid',
        gridAutoFlow: 'row',
        alignItems: 'stretch',
        minHeight: '250px'
      }}
    >
      {/* Feature 1 - Dimensionnement */}
      <motion.div
        variants={item}
        whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
        onClick={() => {
          if (openSection === 0) {
            setOpenSection(null);
          } else {
            setOpenSection(0);
            setExpandedContent('dimensionnement');
          }
        }}
        className={`
          transform transition-all duration-300 cursor-pointer rounded-xl h-full flex flex-col
          ${openSection === 0 ? 'bg-gradient-to-br from-[#86BC29] to-[#6ca01e]' : 'bg-white hover:bg-gray-50'}
          relative overflow-hidden border border-gray-100
        `}
      >
        <div className="p-6 relative z-10">
          <div className={`
            flex items-center justify-center h-14 w-14 rounded-full transition-colors duration-300 shadow-md
            ${openSection === 0 ? 'bg-white text-[#86BC29]' : 'bg-[#86BC29] text-white'}
          `}>
            <Calculator className="h-7 w-7" />
          </div>
          <div className="mt-5">
            <h2 className={`
              text-xl font-semibold transition-colors duration-300
              ${openSection === 0 ? 'text-white' : 'text-gray-900'}
            `}>
              Dimensionnement Intelligent
            </h2>
            <p className={`
              mt-3 text-base transition-colors duration-300
              ${openSection === 0 ? 'text-gray-100' : 'text-gray-500'}
            `}>
              Calculs ultra-précis et recommandations intelligentes pour chaque projet.
            </p>
          </div>
        </div>
        {openSection === 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute bottom-0 right-0 w-40 h-40 -mb-10 -mr-10 transform rotate-45"
          >
            <div className="w-full h-full bg-white opacity-10 rounded-full" />
          </motion.div>
        )}
      </motion.div>

      {/* Feature 2 - Schématèque */}
      <motion.div
        variants={item}
        whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
        onClick={() => {
          if (openSection === 1) {
            setOpenSection(null);
          } else {
            setOpenSection(1);
            setExpandedContent('schematheque');
          }
        }}
        className={`
          transform transition-all duration-300 cursor-pointer rounded-xl h-full flex flex-col
          ${openSection === 1 ? 'bg-gradient-to-br from-[#86BC29] to-[#6ca01e]' : 'bg-white hover:bg-gray-50'}
          relative overflow-hidden border border-gray-100
        `}
      >
        <div className="p-6 relative z-10">
          <div className={`
            flex items-center justify-center h-14 w-14 rounded-full transition-colors duration-300 shadow-md
            ${openSection === 1 ? 'bg-white text-[#86BC29]' : 'bg-[#86BC29] text-white'}
          `}>
            <FileText className="h-7 w-7" />
          </div>
          <div className="mt-5">
            <h2 className={`
              text-xl font-semibold transition-colors duration-300
              ${openSection === 1 ? 'text-white' : 'text-gray-900'}
            `}>
              Bibliothèque Technique
            </h2>
            <p className={`
              mt-3 text-base transition-colors duration-300
              ${openSection === 1 ? 'text-gray-100' : 'text-gray-500'}
            `}>
              Schémas, plans et documentation technique interactive à portée de main.
            </p>
          </div>
        </div>
        {openSection === 1 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute bottom-0 right-0 w-40 h-40 -mb-10 -mr-10 transform rotate-45"
          >
            <div className="w-full h-full bg-white opacity-10 rounded-full" />
          </motion.div>
        )}
      </motion.div>

      {/* Feature 3 - Support */}
      <motion.div
        variants={item}
        whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
        onClick={() => {
          if (openSection === 2) {
            setOpenSection(null);
          } else {
            setOpenSection(2);
            setExpandedContent('support');
          }
        }}
        className={`
          transform transition-all duration-300 cursor-pointer rounded-xl h-full flex flex-col
          ${openSection === 2 ? 'bg-gradient-to-br from-[#86BC29] to-[#6ca01e]' : 'bg-white hover:bg-gray-50'}
          relative overflow-hidden border border-gray-100
        `}
      >
        <div className="p-6 relative z-10">
          <div className={`
            flex items-center justify-center h-14 w-14 rounded-full transition-colors duration-300 shadow-md
            ${openSection === 2 ? 'bg-white text-[#86BC29]' : 'bg-[#86BC29] text-white'}
          `}>
            <HeadphonesIcon className="h-7 w-7" />
          </div>
          <div className="mt-5">
            <h2 className={`
              text-xl font-semibold transition-colors duration-300
              ${openSection === 2 ? 'text-white' : 'text-gray-900'}
            `}>
              Création de Devis
            </h2>
            <p className={`
              mt-3 text-base transition-colors duration-300
              ${openSection === 2 ? 'text-gray-100' : 'text-gray-500'}
            `}>
              Générateur de devis sur mesure intégrant les produits Nextherm et vos services.
            </p>
          </div>
        </div>
        {openSection === 2 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute bottom-0 right-0 w-40 h-40 -mb-10 -mr-10 transform rotate-45"
          >
            <div className="w-full h-full bg-white opacity-10 rounded-full" />
          </motion.div>
        )}
      </motion.div>
    </motion.div>

    {/* Zone d'expansion commune */}
    <AnimatePresence>
      {openSection !== null && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: "auto", 
            opacity: 1,
            transition: {
              height: { duration: 0.4, ease: "easeOut" },
              opacity: { duration: 0.3, delay: 0.2 }
            }
          }}
          exit={{ 
            height: 0, 
            opacity: 0,
            transition: {
              height: { duration: 0.3, ease: "easeIn" },
              opacity: { duration: 0.2 }
            }
          }}
          // @ts-ignore
          className="w-full overflow-hidden bg-[#86BC29] rounded-xl mt-8"
        >
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            // @ts-ignore
            className="p-8 text-white"
          >
            {/* Contenu de l'expansion - Dimensionnement */}
            {openSection === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Comment ça fonctionne ?</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm mr-3">1</span>
                        <span>Analyse intelligente des besoins thermiques</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm mr-3">2</span>
                        <span>Simulation énergétique selon les normes en vigueur</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm mr-3">3</span>
                        <span>Solutions personnalisées avec étude de rentabilité</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Les avantages</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm mr-3">✓</span>
                        <span>Réduction de 80% du temps de dimensionnement</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm mr-3">✓</span>
                        <span>Précision garantie par notre algorithme propriétaire</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm mr-3">✓</span>
                        <span>Optimisation des coûts et de la performance énergétique</span>
                      </li>
                    </ul>
                  </div>
                  <div className="col-span-1 md:col-span-2 mt-6 flex justify-center">
                    <Button asChild className="bg-white text-[#86BC29] hover:bg-gray-100 shadow-md px-6">
                      <Link href="/protected">
                        Commencer un calcul
                      </Link>
                    </Button>
                  </div>
                </div>
            )}

            {/* Contenu de l'expansion - Schématèque */}
            {openSection === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Notre bibliothèque</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm mr-3">📐</span>
                        <span>Plus de 500 schémas techniques prêts à l'emploi</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm mr-3">🔄</span>
                        <span>Mise à jour régulière selon les évolutions technologiques</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm mr-3">🔎</span>
                        <span>Recherche intelligente par type de projet ou bâtiment</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Personnalisation</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm mr-3">✏️</span>
                        <span>Modification en ligne des schémas selon vos besoins</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm mr-3">💾</span>
                        <span>Enregistrement de vos modèles personnalisés</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm mr-3">🖨️</span>
                        <span>Export en formats PDF, CAD et autres formats courants</span>
                      </li>
                    </ul>
                  </div>
                  <div className="col-span-1 md:col-span-2 mt-6 flex justify-center">
                    <Button asChild className="bg-white text-[#86BC29] hover:bg-gray-100 shadow-md px-6">
                      <Link href="/protected">
                        Explorer la bibliothèque
                      </Link>
                    </Button>
                  </div>
                </div>
            )}

            {/* Contenu de l'expansion - Support */}
            {openSection === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Devis personnalisés</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm mr-3">📝</span>
                        <span>Sélection intuitive des produits Nextherm adaptés au projet</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm mr-3">📊</span>
                        <span>Calcul automatique des tarifs selon les spécifications techniques</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm mr-3">📅</span>
                        <span>Ajout simple de vos services additionnels et options</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Fonctionnalités du module</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm mr-3">💼</span>
                        <span>Export PDF professionnel avec votre identité visuelle</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm mr-3">📱</span>
                        <span>Enregistrement et suivi de l'historique de vos devis</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm mr-3">🔄</span>
                        <span>Connexion avec votre système de gestion existant</span>
                      </li>
                     </ul>
                   </div>
                   <div className="col-span-1 md:col-span-2 mt-6 flex justify-center">
                     <Button asChild className="bg-white text-[#86BC29] hover:bg-gray-100 shadow-md px-6">
                       <Link href="/protected">
                         Créer un devis
                       </Link>
                     </Button>
                   </div>
                 </div>
             )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
</motion.section>

     </div>
  );
}