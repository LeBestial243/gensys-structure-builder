
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

// Define user types
export interface User {
  id: string;
  email: string;
  role: "user" | "admin" | "super_admin" | "educateur";
  name?: string;
  structure_id?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Mock user for demonstration
const MOCK_USER: User = {
  id: "1",
  email: "admin@gensys.app",
  role: "super_admin",
  name: "Admin User"
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to refresh user data
  const refreshUser = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const userData: User = {
          id: data.user.id,
          email: data.user.email || "",
          role: (data.user.user_metadata?.role as "user" | "admin" | "super_admin" | "educateur") || "user",
          name: data.user.user_metadata?.first_name 
            ? `${data.user.user_metadata.first_name} ${data.user.user_metadata.last_name || ""}`
            : undefined,
          structure_id: data.user.user_metadata?.structure_id,
        };
        setCurrentUser(userData);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      setCurrentUser(null);
    }
    setIsLoading(false);
  };

  // Simulate auth loading
  useEffect(() => {
    const loadUser = async () => {
      // Check if we're in development mode or testing
      if (process.env.NODE_ENV === 'development' && !window.location.pathname.includes('inscription')) {
        // For demo, setting the mock user in non-inscription pages
        setTimeout(() => {
          setCurrentUser(MOCK_USER);
          setIsLoading(false);
        }, 500);
        return;
      }
      
      // In production or on inscription page, use actual Supabase auth
      await refreshUser();
    };

    loadUser();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await refreshUser();
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Mock login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      if (process.env.NODE_ENV === 'development' && email === "admin@gensys.app") {
        // Simulate API call for the mock admin user
        await new Promise(resolve => setTimeout(resolve, 800));
        setCurrentUser(MOCK_USER);
      } else {
        // Use actual Supabase auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        if (data.user) {
          await refreshUser();
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      if (process.env.NODE_ENV === 'development' && currentUser?.email === "admin@gensys.app") {
        // Simulate API call for mock logout
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        // Use actual Supabase auth
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setCurrentUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
