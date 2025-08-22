import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Database } from '../types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
      user: null,
      profile: null,
      isLoading: true,
      error: null,

      signIn: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          if (data.user) {
            // Récupérer le profil avec gestion d'erreur
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();
            
            // Si le profil n'existe pas, le créer
            if (profileError && profileError.code === 'PGRST116') {
              const { data: newProfile } = await supabase
                .from('profiles')
                .insert({
                  id: data.user.id,
                  email: data.user.email || '',
                  first_name: data.user.email?.split('@')[0] || 'User',
                  role: 'admin'
                })
                .select()
                .single();
              
              set({ 
                user: data.user, 
                profile: newProfile,
                isLoading: false 
              });
            } else {
              set({ 
                user: data.user, 
                profile,
                isLoading: false 
              });
            }
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'Erreur de connexion', 
            isLoading: false 
          });
          throw error;
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true });
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          
          set({ 
            user: null, 
            profile: null,
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Erreur de déconnexion', 
            isLoading: false 
          });
          throw error;
        }
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true });
          
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // Récupérer le profil avec gestion d'erreur
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            // Si le profil n'existe pas, le créer
            if (profileError && profileError.code === 'PGRST116') {
              const { data: newProfile } = await supabase
                .from('profiles')
                .insert({
                  id: session.user.id,
                  email: session.user.email || '',
                  first_name: session.user.email?.split('@')[0] || 'User',
                  role: 'admin'
                })
                .select()
                .single();
              
              set({ 
                user: session.user, 
                profile: newProfile,
                isLoading: false 
              });
            } else {
              set({ 
                user: session.user, 
                profile,
                isLoading: false 
              });
            }
          } else {
            set({ 
              user: null, 
              profile: null,
              isLoading: false 
            });
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'Erreur de vérification', 
            isLoading: false 
          });
        }
      },

      updateProfile: async (updates: Partial<Profile>) => {
        const { user, profile } = get();
        if (!user || !profile) throw new Error('Non authentifié');

        try {
          const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

          if (error) throw error;

          set({ profile: data });
        } catch (error: any) {
          set({ error: error.message || 'Erreur de mise à jour' });
          throw error;
        }
      },
    }));

// Auth listener
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    useAuthStore.getState().checkAuth();
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ user: null, profile: null });
  }
});