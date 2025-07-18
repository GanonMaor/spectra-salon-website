import React, { createContext, useContext, ReactNode } from 'react';
import { useUser } from '../hooks/useUser';

// Define our own User type (no longer dependent on Supabase)
export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: 'admin' | 'user' | 'partner';
  summit_id?: string;
  created_at: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasRole: (role: 'admin' | 'user' | 'partner') => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();
  
  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    hasRole: (role: 'admin' | 'user' | 'partner') => user?.role === role,
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