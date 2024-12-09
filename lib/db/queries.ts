import { createClient } from '@/utils/supabase/server';
import { user } from './schema';

export async function getUserProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data as user;
}

export async function updateUserProfile(
    userId: string,
    data: Partial<Pick<user, 'name' | 'surname' | 'image_url'>>
  ) {
    const supabase = await createClient();
    const { data: updatedData, error } = await supabase
      .from('user')
      .update(data)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return updatedData as user;
  }