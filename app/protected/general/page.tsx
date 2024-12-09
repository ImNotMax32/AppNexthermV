'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { AvatarUploader } from '@/components/AvatarUploader';

type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  surname: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function GeneralPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const supabase = createClient();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);
          // Met à jour l'URL de l'image si elle existe
          if (profile.image_url) {
            setCurrentImageUrl(profile.image_url);
          }
        }
      }
    }
    getUser();
  }, []);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '';
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const handleImageChange = async (newImageUrl: string) => {
    if (userProfile) {
      const { error: updateError } = await supabase
        .from('user')
        .update({ image_url: newImageUrl })
        .eq('id', userProfile.id);

      if (updateError) {
        setError(updateError.message);
      } else {
        setUserProfile({ ...userProfile, image_url: newImageUrl });
        setCurrentImageUrl(newImageUrl); // Met à jour l'URL de l'image courante
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
  
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const surname = formData.get('surname') as string;
  
    if (userProfile) {
      const { error: updateError } = await supabase
        .from('user')
        .update({ name, surname })
        .eq('id', userProfile.id);
  
      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess('Profil mis à jour avec succès');
        setUserProfile({ ...userProfile, name, surname });
      }
    }
    
    setIsLoading(false);
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Paramètres Généraux
      </h1>

      <div className="space-y-6">
        <div className="bg-white shadow sm:rounded-lg p-6">
          <AvatarUploader
            currentImageUrl={currentImageUrl}
            userInitials={getInitials(userProfile?.name)}
            onImageChange={handleImageChange}
          />
        </div>

        <div className="bg-white shadow sm:rounded-lg p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="name">Prénom</Label>
              <Input
                id="name"
                name="name"
                placeholder="Entrez votre Prénom"
                defaultValue={userProfile?.name || ''}
                required
              />
            </div>
            <div>
              <Label htmlFor="surname">Nom</Label>
              <Input
                id="surname"
                name="surname"
                placeholder="Entrez votre nom"
                defaultValue={userProfile?.surname || ''}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
            <Button
              type="submit"
              className="bg-[#86BC29] hover:bg-[#75a625] text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer les modifications'
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}