
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User } from '../types';
import { apiService } from '../services/apiService';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<User | null>;
  register: (name: string, email: string, pass: string) => Promise<{success: boolean, message: string}>;
  logout: () => Promise<void>;
  loadingAuth: boolean;
  error: string | null;
  clearError: () => void;
  fetchUserProfile: () => Promise<User | null>; // Exposed for manual refresh if needed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const fetchUserProfile = useCallback(async (): Promise<User | null> => {
    setError(null);
    try {
      const currentUser = await apiService.getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        localStorage.setItem('tinyLinkerUser', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('tinyLinkerUser');
        localStorage.removeItem('tinyLinkerToken'); // Ensure token is also cleared if profile fetch fails
      }
      return currentUser;
    } catch (err: any) {
      setError(err.message || 'טעינת פרופיל המשתמש נכשלה.');
      setUser(null);
      localStorage.removeItem('tinyLinkerUser');
      localStorage.removeItem('tinyLinkerToken');
      return null;
    }
  }, []);


  const checkUserSession = useCallback(async () => {
    setLoadingAuth(true);
    const token = localStorage.getItem('tinyLinkerToken');
    if (token) {
      await fetchUserProfile();
    } else {
      // Check for cached user details, but prioritize token then profile fetch
      const storedUser = localStorage.getItem('tinyLinkerUser');
      if (storedUser) {
          try {
              setUser(JSON.parse(storedUser));
          } catch {
              localStorage.removeItem('tinyLinkerUser');
              setUser(null);
          }
      } else {
          setUser(null);
      }
    }
    setLoadingAuth(false);
  }, [fetchUserProfile]);


  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  const login = async (email: string, pass: string): Promise<User | null> => {
    setLoadingAuth(true);
    setError(null);
    try {
      // apiService.login now returns { user: (partial), token }
      // The token is stored by apiService.login, then we fetch full profile.
      await apiService.login(email, pass); 
      const loggedInUser = await fetchUserProfile(); // Fetches full profile using stored token
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err: any) {
      setError(err.message || 'ההתחברות נכשלה. בדוק את פרטיך.');
      setUser(null);
      localStorage.removeItem('tinyLinkerToken');
      localStorage.removeItem('tinyLinkerUser');
      return null;
    } finally {
      setLoadingAuth(false);
    }
  };

  const register = async (name: string, email: string, pass: string): Promise<{success: boolean, message: string}> => {
    setLoadingAuth(true);
    setError(null);
    try {
      // apiService.register returns { message, userId }
      const result = await apiService.register(name, email, pass);
      // Registration doesn't log the user in with the current backend.
      // User needs to log in separately.
      return { success: true, message: result.message || 'ההרשמה הסתיימה בהצלחה. אנא התחבר.' };
    } catch (err: any) {
      const errorMessage = err.message || 'ההרשמה נכשלה.';
      setError(errorMessage);
      return { success: false, message: errorMessage};
    } finally {
      setLoadingAuth(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoadingAuth(true);
    setError(null);
    try {
      await apiService.logout(); // Client-side: clears localStorage
      setUser(null);
    } catch (err: any) {
       setError(err.message || 'ההתנתקות נכשלה.');
    } finally {
      setLoadingAuth(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loadingAuth, error, clearError, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};