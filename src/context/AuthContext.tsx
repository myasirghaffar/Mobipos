import * as React from 'react';
import { User } from '../types';
import { storageService } from '../services/storage';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const savedUser = storageService.getCurrentUser();
    if (savedUser) setUser(savedUser);
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    // Mock authentication
    if (username === 'admin' && password === 'admin') {
      const newUser: User = { id: '1', username: 'Admin', role: 'admin' };
      setUser(newUser);
      storageService.setCurrentUser(newUser);
      return true;
    }
    if (username === 'staff' && password === 'staff') {
      const newUser: User = { id: '2', username: 'Staff User', role: 'staff' };
      setUser(newUser);
      storageService.setCurrentUser(newUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    storageService.setCurrentUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
