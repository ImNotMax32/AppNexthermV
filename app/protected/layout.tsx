// app/dashboard/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { 
  Users, 
  Settings, 
  Shield, 
  Activity, 
  Menu, 
  FileText, 
  Bot, 
  Home, 
  Calculator, 
  Save, 
  BookOpen,
  Replace,
  Globe,
  LibraryBig,
  HeartHandshake
} from 'lucide-react';


const ComingSoonButton = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <div className="relative flex items-center w-full group">
    <Button
      variant="ghost"
      className="w-full justify-start text-sm opacity-50 cursor-not-allowed hover:bg-transparent"
      disabled
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </Button>
  </div>
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const dimensionnementItems = [
    { href: '/protected/dimensionnement', icon: Calculator, label: 'Logiciel' },
    { href: '/protected/dimensionnement/save', icon: Save, label: 'Fichiers sauvegardés' },
    { href: '/protected/dimensionnement/fonctionnement', icon: BookOpen, label: 'Fonctionnement' },
  ];
  
  const schemaItems = [
    { href: '/protected/schema/schematheque', icon: LibraryBig, label: 'Schémathèque', available: true },
    { href: '/protected/schema/guide', icon: BookOpen, label: 'Guide d\'installation', available: true },
  ];

  const devisItems = [
    { href: '/protected/devis', icon: LibraryBig, label: 'Devis', available: true },
    { href: '/protected/devis/devissave', icon: Save, label: 'Devis sauvegardés', available: true },
  ];

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const NavSection = ({ label, children }: { label: string; children?: React.ReactNode }) => (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-500 px-3 py-2">
        {label}
      </div>
      {children}
    </div>
  );

  return (
    <div className="flex flex-col min-h-[calc(100dvh-68px)] max-w-7xl mx-auto w-full">
      {/* Mobile menu button */}
      <div className="block lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <span className="font-medium">Menu</span>
          <Button
            variant="ghost"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden pt-[60px] lg:pt-0">
        {/* Overlay pour mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside className={`
          fixed lg:static
          w-64
          bg-white 
          border-r 
          border-gray-200
          h-full
          overflow-y-auto
          z-40
          transition-transform
          duration-300
          ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <nav className="h-full p-4 space-y-4">
            <Link href="/protected/VueGenerale" passHref>
              <Button
                variant={pathname === '/protected/VueGenerale' ? 'secondary' : 'ghost'}
                className={`w-full justify-start ${
                  pathname === '/protected/VueGenerale' ? 'bg-[#86BC29] text-white hover:bg-[#86BC29]' : 'hover:bg-gray-100'
                }`}
              >
                <Home className="mr-2 h-4 w-4" />
                Accueil
              </Button>
            </Link>

            <Separator className="my-3" />
            
            {/* Section Outils techniques */}
            <NavSection label="Outils techniques">
              <div className="space-y-1">
                <div className="space-y-1">
                  <Link href="/protected/dimensionnement" passHref>
                    <Button
                      variant={pathname === '/protected/dimensionnement' ? 'secondary' : 'ghost'}
                      className="w-full justify-start text-sm hover:bg-gray-100"
                    >
                      <Calculator className="mr-2 h-4 w-4" />
                      Dimensionnement
                    </Button>
                  </Link>
                  
                  {/* Sous-menu dimensionnement */}
                  <div className="ml-4 space-y-1">
                    {dimensionnementItems.map((item) => (
                      <Link key={item.href} href={item.href} passHref>
                        <Button
                          variant={pathname === item.href ? 'secondary' : 'ghost'}
                          className={`w-full justify-start text-sm ${
                            pathname === item.href ? 'bg-[#86BC29] text-white hover:bg-[#86BC29]' : 'hover:bg-gray-100'
                          }`}
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                  </div>

                  {/* Documents techniques */}
                  <Link href="/protected/schema/schematheque" passHref>
                    <Button
                      variant={pathname.startsWith('/dashboard/schema') ? 'secondary' : 'ghost'}
                      className="w-full justify-start text-sm hover:bg-gray-100"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Documents techniques
                    </Button>
                  </Link>

                  {/* Sous-menu documents techniques */}
                  <div className="ml-4 space-y-1">
                    {schemaItems.map((item) => (
                      <Link key={item.href} href={item.href} passHref>
                        <Button
                          variant={pathname === item.href ? 'secondary' : 'ghost'}
                          className={`w-full justify-start text-sm ${
                            pathname === item.href ? 'bg-[#86BC29] text-white hover:bg-[#86BC29]' : 'hover:bg-gray-100'
                          }`}
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* comming soon 
                <Link href="/protected/remplacement" passHref>
                  <Button
                    variant={pathname === '/protected/remplacement' ? 'secondary' : 'ghost'}
                    className={`w-full justify-start text-sm ${
                      pathname === '/protected/remplacement' ? 'bg-[#86BC29] text-white hover:bg-[#86BC29]' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Replace className="mr-2 h-4 w-4" />
                    Logiciel de remplacement
                  </Button>
                </Link>
*/}

                <Link href="/protected/IA" passHref>
                  <Button
                    variant={pathname === '/protected/IA' ? 'secondary' : 'ghost'}
                    className={`w-full justify-start text-sm ${
                      pathname === '/protected/IA' ? 'bg-[#86BC29] text-white hover:bg-[#86BC29]' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Bot className="mr-2 h-4 w-4" />
                    IA Nextherm
                  </Button>
                </Link>
              </div>
            </NavSection>

            <Separator className="my-3" />

            <NavSection label="Outils commerciaux">
              <div className="space-y-1">
                {/*<Link href="/protected/carnet" passHref>
                  <Button
                    variant={pathname === '/protected/carnet' ? 'secondary' : 'ghost'}
                    className={`w-full justify-start text-sm ${
                      pathname === '/protected/carnet' ? 'bg-[#86BC29] text-white hover:bg-[#86BC29]' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Carnet d'adresses
                  </Button>
                </Link>*/}
                
                <Link href="/protected/doc-co" passHref>
                  <Button
                    variant={pathname === '/protected/doc-co' ? 'secondary' : 'ghost'}
                    className={`w-full justify-start ${
                      pathname === '/protected/doc-co' ? 'bg-[#86BC29] text-white hover:bg-[#86BC29]' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Document commerciaux
                  </Button>
                </Link>
{/* comming soon 
                <Link href="/protected/doc-types" passHref>
                  <Button
                    variant={pathname === '/protected/doc-types' ? 'secondary' : 'ghost'}
                    className={`w-full justify-start ${
                      pathname === '/protected/doc-types' ? 'bg-[#86BC29] text-white hover:bg-[#86BC29]' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Document types
                  </Button>
                </Link>*/}

                <Link href="/protected/devis" passHref>
                  <Button
                    variant={pathname === '/protected/devis' ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-sm hover:bg-gray-100"
                    >
                    <Users className="mr-2 h-4 w-4" />
                    Devis
                  </Button>
                </Link>
                <div className="ml-4 space-y-1">
                    {devisItems.map((item) => (
                      <Link key={item.href} href={item.href} passHref>
                        <Button
                          variant={pathname === item.href ? 'secondary' : 'ghost'}
                          className={`w-full justify-start text-sm ${
                            pathname === item.href ? 'bg-[#86BC29] text-white hover:bg-[#86BC29]' : 'hover:bg-gray-100'
                          }`}
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                  </div>
              </div>
            </NavSection>

            <NavSection label="Paramètres">
              <div className="space-y-1">
                <Link href="/protected/general" passHref>
                  <Button
                    variant={pathname === '/protected/general' ? 'secondary' : 'ghost'}
                    className={`w-full justify-start ${
                      pathname === '/protected/general' ? 'bg-[#86BC29] text-white hover:bg-[#86BC29]' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Mon profil
                  </Button>
                </Link>
                
{/*
                <Link href="/protected/equipe" passHref>
                  <Button
                    variant={pathname === '/protected/equipe' ? 'secondary' : 'ghost'}
                    className={`w-full justify-start ${
                      pathname === '/protected/equipe' ? 'bg-[#86BC29] text-white hover:bg-[#86BC29]' : 'hover:bg-gray-100'
                    }`}
                  >
                    <HeartHandshake className="mr-2 h-4 w-4" />
                    Équipe
                  </Button>
                </Link>*/}

                <Link href="/protected/security" passHref>
                  <Button
                    variant={pathname === '/protected/security' ? 'secondary' : 'ghost'}
                    className={`w-full justify-start ${
                      pathname === '/protected/security' ? 'bg-[#86BC29] text-white hover:bg-[#86BC29]' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Sécurité
                  </Button>
                </Link>
              </div>
            </NavSection>
          </nav>
        </aside>

        {/* Contenu principal */}
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0 }}
            className={`
              flex-1 
              overflow-y-auto 
              p-4
              transition-all
              duration-300
              ease-in-out
              ${isSidebarOpen ? 'lg:ml-0' : 'ml-0'}
            `}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}