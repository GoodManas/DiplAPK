import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fetchMyTasks, updateTaskStatus } from '../api/requests';
import { ServiceTask, TaskStatus } from '../types';
import { useAuth } from './AuthContext';
import { useServer } from './ServerContext';

type TasksContextValue = {
  tasks: ServiceTask[];
  loading: boolean;
  error: string | null;
  filterStatus: string;
  filterPriority: string;
  search: string;
  setFilterStatus: (v: string) => void;
  setFilterPriority: (v: string) => void;
  setSearch: (v: string) => void;
  refresh: () => Promise<void>;
  updateStatus: (
    taskId: string,
    status: TaskStatus,
    note?: string,
    photoBase64?: string,
  ) => Promise<void>;
};

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const { serverUrl } = useServer();
  const [tasks, setTasks] = useState<ServiceTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [search, setSearch] = useState('');

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const items = await fetchMyTasks({
        status: filterStatus || undefined,
        priority: filterPriority || undefined,
        search: search || undefined,
      });
      setTasks(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить заявки');
    } finally {
      setLoading(false);
    }
  }, [token, filterStatus, filterPriority, search]);

  useEffect(() => {
    if (!token) {
      setTasks([]);
      return;
    }
    const timer = setTimeout(() => refresh(), search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [token, refresh, search]);

  useEffect(() => {
    if (!token || !serverUrl) return;
    const interval = setInterval(refresh, 20000);
    return () => clearInterval(interval);
  }, [token, serverUrl, refresh]);

  const value = useMemo<TasksContextValue>(
    () => ({
      tasks,
      loading,
      error,
      filterStatus,
      filterPriority,
      search,
      setFilterStatus,
      setFilterPriority,
      setSearch,
      refresh,
      updateStatus: async (taskId, status, note, photoBase64) => {
        const item = await updateTaskStatus(taskId, status, note, photoBase64);
        setTasks((prev) => prev.map((t) => (t.id === taskId ? item : t)));
      },
    }),
    [tasks, loading, error, filterStatus, filterPriority, search, refresh],
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used within TasksProvider');
  return ctx;
}
