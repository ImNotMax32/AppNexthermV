// app/protected/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  HeartHandshake,
  LayoutDashboard,
  BarChart3
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface MenuItem {
  href: string;
  icon: any;
  label: string;
  onClick?: () => void;
  available?: boolean;
}

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
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleToggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
    };

    window.addEventListener('toggleSidebar', handleToggleSidebar);
    return () => window.removeEventListener('toggleSidebar', handleToggleSidebar);
  }, [isSidebarOpen]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    };
    
    checkAuth();
  }, [router]);

  useEffect(() => {
    const checkIfDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
      
      // Si on passe en mode desktop, on s'assure que le menu est visible
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      }
    };
    
    // Vérification initiale
    checkIfDesktop();
    
    // Écouteur pour les changements de taille
    window.addEventListener('resize', checkIfDesktop);
    
    return () => {
      window.removeEventListener('resize', checkIfDesktop);
    };
  }, []);

  const dimensionnementItems: MenuItem[] = [
    { href: '/protected/dimensionnement', icon: Calculator, label: 'Logiciel' },
    { href: '/protected/dimensionnement/save', icon: Save, label: 'Fichiers sauvegardés' },
    { 
      href: '/protected/dimensionnement/resume/comparatif', 
      icon: BarChart3, 
      label: 'Comparatif solutions',
      onClick: () => {
        // Nettoyer les données pour forcer le mode sélection
        localStorage.removeItem('selected_product');
        localStorage.removeItem('selected_model');
        sessionStorage.removeItem('buildingData');
      }
    },
  ];
  
  const schemaItems: MenuItem[] = [
    { href: '/protected/schema/schematheque', icon: LibraryBig, label: 'Schémathèque', available: true },
    { href: '/protected/schema/guide', icon: BookOpen, label: 'Guide d\'installation', available: true },
  ];

  const devisItems: MenuItem[] = [
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
      <div className="flex flex-1 overflow-hidden">
        {/* Overlay pour mobile */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-[110] lg:hidden"
              onClick={() => {
                setIsSidebarOpen(false);
                // Émettre un événement pour synchroniser l'état de l'icône
                const event = new CustomEvent('toggleSidebarClose');
                window.dispatchEvent(event);
              }}
            />
          )}
        </AnimatePresence>
        
        {/* Sidebar */}
        <motion.aside 
          animate={{
            x: isSidebarOpen || isDesktop ? 0 : -320,
            boxShadow: (isSidebarOpen && !isDesktop) ? "10px 0 50px rgba(0, 0, 0, 0.1)" : "none",
          }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 40,
            mass: 1
          }}
          className={`
            fixed ${isDesktop ? 'lg:static' : ''}
            top-0
            w-64
            bg-white 
            border-r-2
            border-gray-200
            h-screen
            overflow-y-auto
            ${isDesktop ? 'lg:z-[80]' : 'z-[120]'}
            ${isDesktop ? 'lg:translate-x-0' : ''}
            rounded-r-xl
            pt-0
            ease-in-out
          `}
        >
          <nav className="h-full p-4 px-3 space-y-4 pt-12 lg:pt-2">
            <Link href="/protected" passHref>
              <Button
                variant={pathname === '/protected' ? 'secondary' : 'ghost'}
                className={`w-full justify-start rounded-xl transition-all ${
                  pathname === '/protected' ? 'bg-[#86BC29] text-white hover:bg-[#86BC29]' : 'hover:bg-gray-100'
                }`}
              >
                <Home className="mr-2 h-4 w-4" />
                Accueil
              </Button>
            </Link>

            <Link href="/protected/VueGenerale" passHref>
              <Button
                variant={pathname === '/protected/VueGenerale' ? 'secondary' : 'ghost'}
                className={`w-full justify-start rounded-xl transition-all ${
                  pathname === '/protected/VueGenerale' ? 'bg-[#86BC29] text-white hover:bg-[#86BC29]' : 'hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Vue Générale
              </Button>
            </Link>

            <Separator className="my-3 bg-gray-200" />
            
            {/* Section Outils techniques */}
            <NavSection label="Outils techniques">
              <div className="space-y-1">
                <div className="space-y-1">
                  <Link href="/protected/dimensionnement" passHref>
                    <Button
                      variant={pathname === '/protected/dimensionnement' ? 'secondary' : 'ghost'}
                      className="w-full justify-start text-sm hover:bg-gray-100 rounded-xl transition-colors duration-200"
                    >
                      <Calculator className="mr-2 h-4 w-4" />
                      Dimensionnement
                    </Button>
                  </Link>
                  
                  {/* Sous-menu dimensionnement */}
                  <div className="ml-4 space-y-1 mt-1">
                    {dimensionnementItems.map((item) => (
                      <Link key={item.href} href={item.href} passHref>
                        <Button
                          variant={pathname === item.href ? 'secondary' : 'ghost'}
                          className={`w-full justify-start text-sm rounded-lg transition-all duration-200 ${
                            pathname === item.href ? 'bg-[#86BC29] text-white hover:bg-[#86BC29]/90' : 'hover:bg-gray-100'
                           }`}
                          onClick={item.onClick || undefined}
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
                      className="w-full justify-start text-sm hover:bg-gray-100 rounded-xl transition-colors duration-200 mt-2"
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
                          className={`w-full justify-start text-sm rounded-lg transition-all duration-200 ${
                            pathname === item.href ? 'bg-[#86BC29] text-white hover:bg-[#86BC29]/90' : 'hover:bg-gray-100'
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

                <div className="relative group">
                  <ComingSoonButton icon={Activity} label="Fiche de mise en service" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-[9999] pointer-events-none">
                    Bientôt disponible
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
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
                    className={`w-full justify-start text-sm ${
                      pathname === '/protected/devis' ? 'bg-[#86BC29] text-white hover:bg-[#86BC29]' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Devis
                  </Button>
                </Link>
                <div className="ml-4 space-y-1">
                  <Link href="/protected/devis" passHref>
                    <Button
                      variant={pathname === '/protected/devis' ? 'secondary' : 'ghost'}
                      className={`w-full justify-start text-sm ${
                        pathname === '/protected/devis' ? 'bg-[#86BC29] text-white hover:bg-[#86BC29]' : 'hover:bg-gray-100'
                      }`}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Devis
                    </Button>
                  </Link>
                  <Link href="/protected/devis/devissave" passHref>
                    <Button
                      variant={pathname === '/protected/devis/devissave' ? 'secondary' : 'ghost'}
                      className={`w-full justify-start text-sm ${
                        pathname === '/protected/devis/devissave' ? 'bg-[#86BC29] text-white hover:bg-[#86BC29]' : 'hover:bg-gray-100'
                      }`}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Devis sauvegardés
                    </Button>
                  </Link>
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
        </motion.aside>

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