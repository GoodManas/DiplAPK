import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { changePasswordApi, fetchMeApi, loginApi, logoutApi } from '../api/auth';
import { setAuthToken } from '../api/client';
import { clearStoredToken, loadStoredToken, saveStoredToken } from '../storage';
import { Executor, RolePermissions } from '../types';

type AuthContextValue = {
  executor: Executor | null;
  permissions: RolePermissions | null;
  token: string | null;
  loading: boolean;
  bootstrapping: boolean;
  signIn: (employeeCode: string, password: string) => Promise<boolean>;
  signOut: () => void;
  changePassword: (current: string, next: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [executor, setExecutor] = useState<Executor | null>(null);
  const [permissions, setPermissions] = useState<RolePermissions | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await loadStoredToken();
        if (!stored) return;
        setAuthToken(stored);
        const me = await fetchMeApi();
        if (me.user.role !== 'executor') {
          await clearStoredToken();
          setAuthToken(null);
          return;
        }
        setToken(stored);
        setExecutor(me.user);
        setPermissions(me.permissions);
      } catch {
        await clearStoredToken();
        setAuthToken(null);
      } finally {
        setBootstrapping(false);
      }
    })();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      executor,
      permissions,
      token,
      loading,
      bootstrapping,
      signIn: async (employeeCode, password) => {
        setLoading(true);
        try {
          const res = await loginApi(employeeCode, password);
          setExecutor(res.executor);
          setPermissions(res.permissions);
          setToken(res.token);
          return true;
        } catch {
          return false;
        } finally {
          setLoading(false);
        }
      },
      signOut: () => {
        logoutApi();
        setExecutor(null);
        setPermissions(null);
        setToken(null);
      },
      changePassword: async (current, next) => {
        await changePasswordApi(current, next);
        if (token) await saveStoredToken(token);
      },
    }),
    [executor, permissions, token, loading, bootstrapping],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
