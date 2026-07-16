import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/authService";
import { STORAGE_KEYS } from "../services/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Restores the session on refresh instead of losing it on every reload.
  useEffect(() => {
    const storedId = localStorage.getItem(STORAGE_KEYS.session);
    if (!storedId) {
      setInitializing(false);
      return;
    }
    authService
      .getUserById(storedId)
      .then(setCurrentUser)
      .catch(() => localStorage.removeItem(STORAGE_KEYS.session))
      .finally(() => setInitializing(false));
  }, []);

  const login = (email, password) =>
    authService.login(email, password).then((user) => {
      localStorage.setItem(STORAGE_KEYS.session, user.id);
      setCurrentUser(user);
      return user;
    });

  const signup = (payload) =>
    authService.signup(payload).then((user) => {
      localStorage.setItem(STORAGE_KEYS.session, user.id);
      setCurrentUser(user);
      return user;
    });

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.session);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, initializing, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
