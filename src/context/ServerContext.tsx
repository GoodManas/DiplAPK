import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { setApiBaseUrl } from '../api/client';
import {
  clearStoredServerUrl,
  clearStoredToken,
  loadStoredServerUrl,
  saveStoredServerUrl,
} from '../storage';
import { normalizeServerUrl } from '../utils/serverUrl';

type ServerContextValue = {
  serverUrl: string | null;
  bootstrapping: boolean;
  setServerUrl: (input: string) => Promise<string>;
  clearServerUrl: () => Promise<void>;
};

const ServerContext = createContext<ServerContextValue | null>(null);

export function ServerProvider({ children }: { children: ReactNode }) {
  const [serverUrl, setServerUrlState] = useState<string | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await loadStoredServerUrl();
        if (stored) {
          const normalized = normalizeServerUrl(stored);
          setApiBaseUrl(normalized);
          setServerUrlState(normalized);
        }
      } catch {
        await clearStoredServerUrl();
        setApiBaseUrl('');
        setServerUrlState(null);
      } finally {
        setBootstrapping(false);
      }
    })();
  }, []);

  const setServerUrl = useCallback(async (input: string) => {
    const normalized = normalizeServerUrl(input);
    await clearStoredToken();
    await saveStoredServerUrl(normalized);
    setApiBaseUrl(normalized);
    setServerUrlState(normalized);
    return normalized;
  }, [serverUrl]);

  const clearServerUrl = useCallback(async () => {
    await clearStoredToken();
    await clearStoredServerUrl();
    setApiBaseUrl('');
    setServerUrlState(null);
  }, []);

  const value = useMemo<ServerContextValue>(
    () => ({
      serverUrl,
      bootstrapping,
      setServerUrl,
      clearServerUrl,
    }),
    [serverUrl, bootstrapping, setServerUrl, clearServerUrl],
  );

  return (
    <ServerContext.Provider value={value}>{children}</ServerContext.Provider>
  );
}

export function useServer() {
  const ctx = useContext(ServerContext);
  if (!ctx) throw new Error('useServer must be used within ServerProvider');
  return ctx;
}
