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
  return code
    .replace(
      /(function|return|if)/g,
      '<span style="color: #C586C0; font-weight: 500;">$1</span>'
    )
    .replace(
      /(projet|type|besoin|phase)/g,
      '<span style="color: #9CDCFE;">$1</span>'
    )
    .replace(
      /('dimensionnement'|'documentation'|'installation')/g,
      '<span style="color: #CE9178;">$1</span>'
    )
    .replace(
      /(===)/g,
      '<span style="color: #56B6C2; font-weight: 500;">$1</span>'
    )
    .replace(
      /({|})/g,
      '<span style="color: #D4D4D4;">$1</span>'
    )
    .replace(
      /(🚀|📊|📑|⚡|🏠|📐|🌟)/g,
      '<span style="color: #FFD700;">$1</span>'
    )
    .replace(
      /((\/\/ .+))/g,
      '<span style="color: #6A9955; font-style: italic;">$1</span>'
    );
};

export default function HomePage() {
  const [displayText, setDisplayText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
  const [openSection, setOpenSection] = useState<number | null>(null);
  const [expandedContent, setExpandedContent] = useState<string>('');

  const typingSequences = [
    // Séquence 1: Code original Nextherm
    [
      { type: 'type', content: 'function ' },
      { type: 'type', content: 'assissta' },
      { type: 'pause', duration: 200 },
      { type: 'delete', duration: 100 },
      { type: 'type', content: 'tance' },
      { type: 'type', content: 'Installateur(projet) {' },
      { type: 'type', content: '\n' },
      { type: 'pause', duration: 300 },
      { type: 'type', content: '  // Aide au dimensionnement\n' },
      { type: 'type', content: '  if (projet.type === ' },
      { type: 'type', content: "'dimensionnement') {\n" },
      { type: 'type', content: '    return "Calcul précis adapté au bâtiment 🏠";\n  }\n\n' },
      { type: 'type', content: "  if (projet.besoin === '" },
      { type: 'type', content: "schéma') {\n" },
      { type: 'type', content: '    return "Schématèque complète et détaillée 📐";\n  }\n\n' },
      { type: 'type', content: "  if (projet.phase === 'installation') {\n" },
      { type: 'type', content: '    return "Support technique dédié ⚡";\n  }\n\n' },
      { type: 'pause', duration: 300 },
      { type: 'type', content: '  // Avantages installateur\n' },
      { type: 'type', content: '  return {\n' },
      { type: 'type', content: '    dimensionnement: "Sélection PAC optimale",\n' },
      { type: 'type', content: '    assistance: "Équipe technique dédiée",\n' },
      { type: 'type', content: '    documentation: "Schémas techniques détaillés"\n' },
      { type: 'type', content: '  };\n}' }
    ],

    // Blague

    [
      { type: 'type', content: '// Pourquoi les programmeurs préfèrent le froid ?\n' },
      { type: 'pause', duration: 800 },
      { type: 'type', content: 'function blagueProgrammeur() {\n' },
      { type: 'type', content: '  let raison = {\n' },
      { type: 'type', content: '    température: 0,\n' },
      { type: 'type', content: '    explication: "Parce que" '},
      { type: 'pause', duration: 400 },
      { type: 'type', content: '...\n' },
      { type: 'pause', duration: 800 },
      { type: 'type', content: '    // À zéro degré, il n\'y a pas de bug ! 🐛❄️\n' },
      { type: 'type', content: '  };\n' },
      { type: 'type', content: '  return raison.température === 0 ? "Code parfait" : "Debugger";\n' },
      { type: 'type', content: '}\n' },
      { type: 'type', content: '\n// 404: Humour not found 😅' }
    ],
    
    // Séquence 3: Citation Nietzsche
    [
      { type: 'type', content: '/* 🎭 Friedrich Nietzsche - Le Code du Philosophe */\n\n' },
      { type: 'type', content: 'class Übermensch {\n' },
      { type: 'type', content: '  constructor() {\n' },
      { type: 'type', content: '    this.wisdom = "Celui qui lutte contre les bugs\n' },
      { type: 'type', content: '                   peut prendre garde à ne pas\n' },
      { type: 'type', content: '                   devenir bug lui-même...";\n' },
      { type: 'pause', duration: 500 },
      { type: 'type', content: '    this.author = "Nietzsche, Par-delà le Code et le Debug";\n' },
      { type: 'type', content: '  }\n\n' },
      { type: 'type', content: '  contemplate() {\n' },
      { type: 'type', content: '    return `Si tu fixes longtemps l\'abîme du code,\n' },
      { type: 'type', content: '            l\'abîme du code te fixe aussi.`;\n' },
      { type: 'type', content: '  }\n' },
      { type: 'type', content: '}\n' },
      { type: 'type', content: '\n// L\'éternel retour du bug 🔄' }
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
                    <Link href="/protected/VueGenerale">
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

                      {/* Right Column - Terminal */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                // @ts-ignore
                className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center"
              >
                <div className="w-full rounded-xl shadow-2xl overflow-hidden bg-[#111827] text-white">
                  {/* Terminal Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-[#1F2937] border-b border-gray-800">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-sm text-gray-400 font-jetbrains">assistant.nextherm.js</div>
                    <div className="w-12"></div>
                  </div>
                  
                  {/* Code Content */}
                  <div className="p-6 overflow-hidden">
                    <pre className="font-jetbrains text-[15px] leading-relaxed tracking-wide whitespace-pre-wrap">
                      <code 
                        className="block relative"
                        style={{
                          WebkitFontSmoothing: 'antialiased',
                          MozOsxFontSmoothing: 'grayscale',
                        }}
                        dangerouslySetInnerHTML={{ 
                          __html: displayText + (
                            !isTypingComplete ? '<span class="animate-pulse ml-1 -mr-1 inline-block">│</span>' : ''
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
        whileHover={{ scale: 1.02 }}
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
          ${openSection === 0 ? 'bg-[#86BC29]' : 'bg-white hover:bg-gray-50'}
          relative overflow-hidden
        `}
      >
        <div className="p-6 relative z-10">
          <div className={`
            flex items-center justify-center h-12 w-12 rounded-xl transition-colors duration-300
            ${openSection === 0 ? 'bg-white text-[#86BC29]' : 'bg-[#86BC29] text-white'}
          `}>
            <Calculator className="h-6 w-6" />
          </div>
          <div className="mt-5">
            <h2 className={`
              text-lg font-medium transition-colors duration-300
              ${openSection === 0 ? 'text-white' : 'text-gray-900'}
            `}>
              Dimensionnement Précis
            </h2>
            <p className={`
              mt-2 text-base transition-colors duration-300
              ${openSection === 0 ? 'text-gray-100' : 'text-gray-500'}
            `}>
              Calculez rapidement la puissance nécessaire et sélectionnez la PAC idéale.
            </p>
          </div>
        </div>
        {openSection === 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            // @ts-ignore
            className="absolute bottom-0 right-0 w-32 h-32 -mb-8 -mr-8 transform rotate-45"
          >
            <div className="w-full h-full bg-white opacity-10 rounded-full" />
          </motion.div>
        )}
      </motion.div>

      {/* Feature 2 - Schématèque */}
      <motion.div
        variants={item}
        whileHover={{ scale: 1.02 }}
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
          ${openSection === 1 ? 'bg-[#86BC29]' : 'bg-white hover:bg-gray-50'}
          relative overflow-hidden
        `}
      >
        <div className="p-6 relative z-10">
          <div className={`
            flex items-center justify-center h-12 w-12 rounded-xl transition-colors duration-300
            ${openSection === 1 ? 'bg-white text-[#86BC29]' : 'bg-[#86BC29] text-white'}
          `}>
            <FileText className="h-6 w-6" />
          </div>
          <div className="mt-5">
            <h2 className={`
              text-lg font-medium transition-colors duration-300
              ${openSection === 1 ? 'text-white' : 'text-gray-900'}
            `}>
              Schématèque Complète
            </h2>
            <p className={`
              mt-2 text-base transition-colors duration-300
              ${openSection === 1 ? 'text-gray-100' : 'text-gray-500'}
            `}>
              Accédez à une bibliothèque de schémas techniques détaillés.
            </p>
          </div>
        </div>
        {openSection === 1 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            // @ts-ignore
            className="absolute bottom-0 right-0 w-32 h-32 -mb-8 -mr-8 transform rotate-45"
          >
            <div className="w-full h-full bg-white opacity-10 rounded-full" />
          </motion.div>
        )}
      </motion.div>

      {/* Feature 3 - Support */}
      <motion.div
        variants={item}
        whileHover={{ scale: 1.02 }}
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
          ${openSection === 2 ? 'bg-[#86BC29]' : 'bg-white hover:bg-gray-50'}
          relative overflow-hidden
        `}
      >
        <div className="p-6 relative z-10">
          <div className={`
            flex items-center justify-center h-12 w-12 rounded-xl transition-colors duration-300
            ${openSection === 2 ? 'bg-white text-[#86BC29]' : 'bg-[#86BC29] text-white'}
          `}>
            <HeadphonesIcon className="h-6 w-6" />
          </div>
          <div className="mt-5">
            <h2 className={`
              text-lg font-medium transition-colors duration-300
              ${openSection === 2 ? 'text-white' : 'text-gray-900'}
            `}>
              Support Technique
            </h2>
            <p className={`
              mt-2 text-base transition-colors duration-300
              ${openSection === 2 ? 'text-gray-100' : 'text-gray-500'}
            `}>
              Bénéficiez d'une assistance technique experte.
            </p>
          </div>
        </div>
        {openSection === 2 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            // @ts-ignore
            className="absolute bottom-0 right-0 w-32 h-32 -mb-8 -mr-8 transform rotate-45"
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
                        <span className="mr-2">•</span>
                        Analyse détaillée des besoins thermiques
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        Calcul automatique selon la norme EN 14825
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        Recommandations personnalisées
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Les avantages</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        Gain de temps considérable
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        Précision garantie
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        Optimisation des coûts
                      </li>
                    </ul>
                    <Button asChild className="mt-6 bg-white text-[#86BC29] hover:bg-gray-100">
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
                      <h3 className="text-2xl font-semibold mb-4">Bibliothèque technique</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          Schémas hydrauliques complets
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          Plans électriques détaillés
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          Guides d'installation pas à pas
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold mb-4">Ressources disponibles</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          Plus de 200 schémas
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          Mises à jour régulières
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          Formats CAD & PDF
                        </li>
                      </ul>
                      <Button asChild className="mt-6 bg-white text-[#86BC29] hover:bg-gray-100">
                        <Link href="/protected">
                          Explorer la schématèque
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Contenu de l'expansion - Support */}
                {openSection === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-2xl font-semibold mb-4">Assistance premium</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          Support téléphonique dédié
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          Assistance à la mise en service
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          Suivi personnalisé des installations
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold mb-4">Nos engagements</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          Réponse sous 24h
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          Experts qualifiés
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          Disponibilité 6j/7
                        </li>
                      </ul>
                      <Button asChild className="mt-6 bg-white text-[#86BC29] hover:bg-gray-100">
                        <Link href="/protected">
                          Contacter le support
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