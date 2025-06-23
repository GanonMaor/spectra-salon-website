import React, { createContext, useContext, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { useUser } from '../hooks/useUser';

interface UserContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();
  
  const value = {
    user,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
} 