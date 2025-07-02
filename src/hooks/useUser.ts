import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getCurrentUser, getUserProfile, UserProfile } from '../api/supabase/userApi';
import { supabase } from '../api/supabase/supabaseClient';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await getUserProfile(userId);
      if (error) {
        console.warn('Failed to load user profile:', error);
        setProfile(null);
      } else {
        setProfile(profileData);
      }
    } catch (error) {
      console.warn('Error loading user profile:', error);
      setProfile(null);
    }
  };

  useEffect(() => {
    // Get initial user
    getCurrentUser().then(({ data }) => {
      const currentUser = data?.user || null;
      setUser(currentUser);
      
      if (currentUser) {
        loadUserProfile(currentUser.id);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        
        if (currentUser) {
          await loadUserProfile(currentUser.id);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, profile, loading };
} 