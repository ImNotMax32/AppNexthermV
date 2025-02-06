'use client';

import Link from "next/link";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Home, User, Settings, Handshake, Menu } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from '@/utils/supabase/client';

type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  image_url: string | null;
};

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    // Émettre un événement personnalisé pour le layout
    const event = new CustomEvent('toggleSidebar');
    window.dispatchEvent(event);
  };

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from('user')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!error) {
          setUserProfile(profile);
        } else {
          console.error('Error fetching profile:', error);
        }
      }
    }

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setTimeout(async () => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('user')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setUserProfile(profile);
        }
        if (event === 'PASSWORD_RECOVERY') {
          router.push('/update-password?type=recovery');
        }
        if (event === 'SIGNED_OUT') {
          setUserProfile(null);
        }
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '';
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  async function handleSignOut() {
    try {
      Promise.race([
        supabase.auth.signOut(),
        new Promise((resolve) => setTimeout(resolve, 3000))
      ]);
      router.push('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      router.push('/');
    }
  }

  return (
    <header className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-3">
          <img
            src="/assets/img/X.png"
            alt="Nextherm Logo"
            className="h-12 w-12 object-contain"
          />
          <div className="flex items-center space-x-2">
            <span className="font-bold text-gray-900" style={{ fontSize: '1.75rem', lineHeight: '2rem' }}>Nextherm</span>
            <span className="font-medium" style={{ fontSize: '1.75rem', lineHeight: '2rem', color: '#86BC29' }}>Applications</span>
          </div>
        </Link>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          {userProfile ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700 hidden md:block">
                {userProfile.name || userProfile.email}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 p-0 overflow-hidden">
                    {userProfile.image_url ? (
                      <div className="h-full w-full rounded-full overflow-hidden">
                        <img
                          src={userProfile.image_url}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-full w-full rounded-full bg-[#86BC29] flex items-center justify-center text-white">
                        {getInitials(userProfile.name || userProfile.email || 'U')}
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userProfile.name}</p>
                      <p className="text-xs leading-none text-gray-500">{userProfile.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <Link href="/protected/VueGenerale" className="flex w-full items-center">
                      <Home className="mr-2 h-4 w-4" />
                      <span>Tableau de bord</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Link href="/protected/general" className="flex w-full items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Mon profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Link href="/protected/" className="flex w-full items-center">
                      <Handshake className="mr-2 h-4 w-4" />
                      <span>Acceuil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <form action={handleSignOut} className="w-full">
                    <button type="submit" className="flex w-full">
                      <DropdownMenuItem className="w-full cursor-pointer text-red-600" onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Déconnexion</span>
                      </DropdownMenuItem>
                    </button>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button
              asChild
              className="bg-black hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-full"
            >
              <Link href="/sign-in">Connexion</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}