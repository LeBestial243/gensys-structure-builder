
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define user types
export interface User {
  id: string;
  email: string;
  role: "user" | "admin" | "super_admin";
  name?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
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

  // Simulate auth loading
  useEffect(() => {
    const loadUser = async () => {
      // In a real app, this would check localStorage or a session cookie
      // and validate with your backend or auth provider
      setTimeout(() => {
        setCurrentUser(MOCK_USER); // For demo, we're setting the mock user
        setIsLoading(false);
      }, 500);
    };

    loadUser();
  }, []);

  // Mock login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setCurrentUser(MOCK_USER);
    setIsLoading(false);
  };

  // Mock logout function
  const logout = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setCurrentUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
