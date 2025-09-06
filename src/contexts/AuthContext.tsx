import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id_admin: number;
  username: string;
  email: string;
  role: 'Admin' | 'Super Admin';
  status: 'Actif' | 'Inactif';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const checkAuthStatus = () => {
      try {
        const savedUser = localStorage.getItem('iptv_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        localStorage.removeItem('iptv_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // For now, we'll use a simple authentication with the seeded data
      // In production, this should make an API call to verify credentials
      const defaultUsers = [
        { id_admin: 1, username: 'ADMIN', email: 'admin@blacknashop.local', password: 'admin123', role: 'Super Admin' as const, status: 'Actif' as const },
        { id_admin: 2, username: 'DJO', email: 'DJO@GMAIL.COM', password: 'djo123', role: 'Admin' as const, status: 'Actif' as const },
        { id_admin: 3, username: 'SALAH', email: 'houidi.salaheddine@gmail.com', password: 'salah123', role: 'Admin' as const, status: 'Actif' as const }
      ];

      const foundUser = defaultUsers.find(u => 
        (u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()) && 
        u.password === password
      );

      if (foundUser) {
        const userData: User = {
          id_admin: foundUser.id_admin,
          username: foundUser.username,
          email: foundUser.email,
          role: foundUser.role,
          status: foundUser.status
        };
        
        setUser(userData);
        localStorage.setItem('iptv_user', JSON.stringify(userData));
        
        // Log the activity
        try {
          await fetch('https://iptv-management-api.houidi-salaheddine.workers.dev/api/admin-activity', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id_admin: userData.id_admin,
              action: 'Connexion',
              description: `Connexion réussie de ${userData.username}`,
              ip_address: 'Unknown', // In production, get real IP
              user_agent: navigator.userAgent
            })
          });
        } catch (error) {
          console.warn('Failed to log activity:', error);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('iptv_user');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
