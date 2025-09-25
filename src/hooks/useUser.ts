import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import { User } from "../context/UserContext";

export function useUser() {
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

  useEffect(() => {
    loadUser();

    // Listen for auth changes from localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_token") {
        if (e.newValue) {
          loadUser(); // Token added, load user
        } else {
          setUser(null); // Token removed, clear user
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return { user, loading };
}
