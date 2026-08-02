import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface UserResponse {
  id: number;
  email: string;
  full_name: string | null;
  role: string;
  avatar_url: string | null;
  created_at: string;
}

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  googleSignIn: (email: string, name: string, avatar?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Set default base URL for API queries
axios.defaults.baseURL = 'http://localhost:8000';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Configure Axios interceptor for JWT authorization
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      
      // Fetch user info
      setIsLoading(true);
      axios.get('/api/auth/me')
        .then(res => {
          setUser(res.data);
        })
        .catch(err => {
          console.error("Session verification failed: ", err);
          logout();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setUser(null);
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    // FastAPI OAuth2PasswordRequestForm expects form-data
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    const response = await axios.post('/api/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const { access_token, user: userData } = response.data;
    setUser(userData);
    setToken(access_token);
  };

  const register = async (email: string, password: string, fullName: string) => {
    await axios.post('/api/auth/register', {
      email,
      password,
      full_name: fullName
    });
  };

  const googleSignIn = async (email: string, name: string, avatar?: string) => {
    const response = await axios.post('/api/auth/google', {
      email,
      name,
      avatar
    });
    const { access_token, user: userData } = response.data;
    setUser(userData);
    setToken(access_token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, googleSignIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
