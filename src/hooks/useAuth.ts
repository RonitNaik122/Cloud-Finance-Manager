import { useState, useEffect, createContext, useContext } from "react";
import { getUser } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuth = async () => {
      try {
        // Get user ID from localStorage or session
        const userId = localStorage.getItem("userId");
        if (userId) {
          const userData = await getUser(userId);
          setUser(userData);
        }
      } catch (err) {
        console.error("Authentication error:", err);
        setError(err instanceof Error ? err : new Error("Authentication failed"));
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Implement login logic here
      // For now, we'll just simulate a successful login
      const mockUser = {
        id: "user123",
        email,
        name: "Test User",
      };
      setUser(mockUser);
      localStorage.setItem("userId", mockUser.id);
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err : new Error("Login failed"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("userId");
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    setError(null);
    try {
      // Implement registration logic here
      // For now, we'll just simulate a successful registration
      const mockUser = {
        id: "user123",
        email: userData.email,
        name: userData.name,
      };
      setUser(mockUser);
      localStorage.setItem("userId", mockUser.id);
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err : new Error("Registration failed"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 