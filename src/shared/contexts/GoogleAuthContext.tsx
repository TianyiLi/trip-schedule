import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleOAuthProvider, useGoogleLogin, googleLogout } from '@react-oauth/google';

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  accessToken: string;
}

export interface GoogleAuthContextType {
  user: GoogleUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => void;
  getAccessToken: () => string | null;
}

const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(undefined);

export const useGoogleAuth = () => {
  const context = useContext(GoogleAuthContext);
  if (!context) {
    throw new Error('useGoogleAuth must be used within a GoogleAuthProvider');
  }
  return context;
};

interface GoogleAuthProviderProps {
  children: React.ReactNode;
}

const GoogleAuthProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const savedUser = localStorage.getItem('google_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('google_user');
      }
    }
    setIsLoading(false);
  }, []);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        
        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        
        if (!userInfoResponse.ok) {
          throw new Error('Failed to get user info');
        }
        
        const userInfo = await userInfoResponse.json();
        
        const googleUser: GoogleUser = {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          accessToken: tokenResponse.access_token,
        };
        
        setUser(googleUser);
        setIsAuthenticated(true);
        localStorage.setItem('google_user', JSON.stringify(googleUser));
      } catch (error) {
        console.error('Error during login:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Login failed:', error);
      setIsAuthenticated(false);
    },
    scope: 'openid profile email https://www.googleapis.com/auth/drive.file',
  });

  const login = async (): Promise<void> => {
    googleLogin();
  };

  const logout = () => {
    googleLogout();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('google_user');
  };

  const getAccessToken = (): string | null => {
    return user?.accessToken || null;
  };

  const value: GoogleAuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    getAccessToken,
  };

  return (
    <GoogleAuthContext.Provider value={value}>
      {children}
    </GoogleAuthContext.Provider>
  );
};

export const GoogleAuthProvider: React.FC<GoogleAuthProviderProps> = ({ children }) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    console.error('Google Client ID is not configured');
    return (
      <GoogleAuthContext.Provider value={{
        user: null,
        isLoading: false,
        isAuthenticated: false,
        login: async () => {},
        logout: () => {},
        getAccessToken: () => null,
      }}>
        {children}
      </GoogleAuthContext.Provider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleAuthProviderInner>
        {children}
      </GoogleAuthProviderInner>
    </GoogleOAuthProvider>
  );
};