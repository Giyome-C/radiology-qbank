'use client'

import { AuthProvider } from '@/lib/auth/AuthContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

async function uploadImage(file: File, folder: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
  const { data, error } = await supabase.storage.from('question-images').upload(fileName, file);
  if (error) {
    console.error('Supabase Storage upload error:', error);
    throw error;
  }
  const { data: urlData } = supabase.storage.from('question-images').getPublicUrl(fileName);
  return urlData.publicUrl;
}