import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { apiClient } from "../api/client";

// --- User type ---
export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: "admin" | "user" | "partner";
  summit_id?: string;
  created_at: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasRole: (role: "admin" | "user" | "partner") => boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  login: (
    email: string,
    password: string,
  ) => Promise<{ token: any; user: any }>;
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
      console.log("No authenticated user:", error);
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
      localStorage.removeItem("token");

      if (!window.location.hostname.includes("localhost")) {
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("🔑 Attempting login for:", email);

      const { token, user } = await apiClient.login(email, password);
      console.log("✅ Login API response:", { token, user });

      // ✅ Save token to localStorage
      localStorage.setItem("token", token);

      // Sync apiClient token
      apiClient.token = token;

      // Load user info after login
      await loadUser();

      // Refresh user state
      const userData = await apiClient.getCurrentUser();
      setUser(userData);

      console.log("👤 User loaded:", userData);

      return { token, user };
    } catch (error) {
      console.error("❌ Login error:", error);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    // Sync apiClient token if token changes in localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        apiClient.token = e.newValue;
        if (e.newValue) {
          loadUser();
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    hasRole: (role: "admin" | "user" | "partner") => user?.role === role,
    refreshUser: loadUser,
    logout,
    login,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
}
