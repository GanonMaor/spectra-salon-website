import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { apiClient } from '../api/client';

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
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCurrentUser();
      setUser(response.user);
    } catch (error) {
      console.log('No authenticated user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await apiClient.logout();
      setUser(null);
      
      // 🔧 כריח רענון בפרודקשן (login וlogout)
      if (!window.location.hostname.includes('localhost')) {
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 🔧 הוסף login function שגם היא תכריח רענון
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await apiClient.login(email, password);
      await loadUser(); // רענן את המשתמש מהשרת
      
      // �� כריח רענון בפרודקשן גם אחרי login
      if (!window.location.hostname.includes('localhost')) {
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } catch (error) {
      throw error; // העבר את השגיאה למי שקורא
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    // Listen for auth changes from localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        if (e.newValue) {
          loadUser(); // Token added, load user
        } else {
          setUser(null); // Token removed, clear user
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    hasRole: (role: 'admin' | 'user' | 'partner') => user?.role === role,
    refreshUser: loadUser,
    logout,
    login, // 🔧 חדש
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