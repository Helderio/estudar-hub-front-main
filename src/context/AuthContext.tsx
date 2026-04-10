import {
  createContext, useContext, useState,
  useCallback, ReactNode
} from 'react';
import { authService } from '@/services/authService';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateUser: (profile: User) => void;
  logout: () => void;
}

export interface RegisterData {
  username: string;
  nome: string;
  email: string;
  password: string;
  telefone: string;
  bio?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  curso: string;
  anoAcademico: string;
  role: string;
  institutionId: number;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const getUserFromStorage = (): User | null => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(getUserFromStorage);
  const [isLoading, setIsLoading] = useState(false);

  const saveSession = (profile: User, token: string) => {
    localStorage.setItem('user', JSON.stringify(profile));
    setUser(profile);
  };

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login({ email, password });
      const { profile, token } = res.data.data as any;
      // token ignored (session cookie is the auth mechanism now)
      saveSession(profile, token ?? '');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const res = await authService.register(data);
      const { profile, token } = res.data.data as any;
      saveSession(profile, token ?? '');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback((profile: User) => {
    localStorage.setItem('user', JSON.stringify(profile));
    setUser(profile);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    throw new Error('Google login não disponível ainda.');
  }, []);

  const loginWithGithub = useCallback(async () => {
    throw new Error('GitHub login não disponível ainda.');
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      loginWithGoogle,
      loginWithGithub,
      register,
      updateUser,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
