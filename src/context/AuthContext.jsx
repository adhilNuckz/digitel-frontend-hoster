import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../lib/auth';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    await authService.login(email, password);
    await checkUser();
  }

  async function signup(email, password, name) {
    await authService.createAccount(email, password, name);
    await authService.login(email, password);
    await checkUser();
  }

  async function loginWithGitHub() {
    await authService.loginWithGitHub();
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  const value = {
    user,
    login,
    signup,
    loginWithGitHub,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
