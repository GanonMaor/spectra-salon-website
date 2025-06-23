import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getCurrentUser } from '../api/supabase/userApi';
import { supabase } from '../api/supabase/supabaseClient';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    getCurrentUser().then(({ data }) => {
      setUser(data?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
} 