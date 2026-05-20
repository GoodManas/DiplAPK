import { FormEvent, useCallback, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import {
  assignRequest,
  cancelRequest,
  clearSession,
  createEmployee,
  createRequest,
  fetchAllEmployees,
  fetchExecutors,
  fetchHistory,
  fetchMe,
  fetchRequests,
  fetchStats,
  login,
  saveSession,
  type ServiceRequest,
  type Stats,
  type User,
} from './api';

const statusLabels: Record<string, string> = {
  new: 'Новая',
  assigned: 'Назначена',
  in_progress: 'В работе',
  completed: 'Выполнена',
  cancelled: 'Отменена',
};

const priorityLabels: Record<string, string> = {
  low: 'Низкий',
  normal: 'Обычный',
  high: 'Срочный',
};

type Tab = 'dashboard' | 'requests' | 'create' | 'employees';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('dp_token'));
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [executors, setExecutors] = useState<User[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [history, setHistory] = useState<Record<string, Awaited<ReturnType<typeof fetchHistory>>['items']>>({});

  const [loginForm, setLoginForm] = useState({ employeeCode: 'DISPATCHER', password: 'demo123' });
  const [createForm, setCreateForm] = useState({
    title: '',
    clientName: '',
    clientPhone: '',
    address: '',
    description: '',
    scheduledAt: '',
    priority: 'normal',
  });
  const [employeeForm, setEmployeeForm] = useState({
    employeeCode: '',
    fullName: '',
    password: 'demo123',
    phone: '',
    role: 'executor' as 'executor' | 'dispatcher',
  });

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [reqRes, execRes] = await Promise.all([
        fetchRequests({
          status: filterStatus || undefined,
          priority: filterPriority || undefined,
          search: search || undefined,
        }),
        fetchExecutors(),
      ]);
      setRequests(reqRes.items);
      setExecutors(execRes.items);

      try {
        setStats(await fetchStats());
      } catch {
        setStats(null);
      }

      try {
        const empRes = await fetchAllEmployees();
        setEmployees(empRes.items);
      } catch {
        setEmployees(execRes.items);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, [token, filterStatus, filterPriority, search]);

  useEffect(() => {
    if (!token) return;
    fetchMe().then((r) => setUser(r.user)).catch(() => {});
    loadData();
    const socket = io({ path: '/socket.io' });
    socket.on('sync', () => loadData());
    return () => {
      socket.disconnect();
    };
  }, [token, loadData]);

  const onLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await login(loginForm.employeeCode, loginForm.password);
      if (res.user.role !== 'dispatcher') {
        setError('Вход только для диспетчера');
        return;
      }
      saveSession(res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    }
  };

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createRequest({
        ...createForm,
        scheduledAt: new Date(createForm.scheduledAt).toISOString(),
      });
      setCreateForm({
        title: '',
        clientName: '',
        clientPhone: '',
        address: '',
        description: '',
        scheduledAt: '',
        priority: 'normal',
      });
      setTab('requests');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    }
  };

  const onCreateEmployee = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createEmployee(employeeForm);
      setEmployeeForm({ employeeCode: '', fullName: '', password: 'demo123', phone: '', role: 'executor' });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    }
  };

  const toggleHistory = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!history[id]) {
      const res = await fetchHistory(id);
      setHistory((h) => ({ ...h, [id]: res.items }));
    }
  };

  if (!token) {
    return (
      <div className="app">
        <div className="card" style={{ maxWidth: 420, margin: '80px auto' }}>
          <h1>Диспетчерский модуль</h1>
          <p className="hint">Роль: диспетчер · JWT-авторизация</p>
          <form onSubmit={onLogin}>
            <label>Табельный номер</label>
            <input value={loginForm.employeeCode} onChange={(e) => setLoginForm({ ...loginForm, employeeCode: e.target.value })} />
            <label>Пароль</label>
            <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
            <button type="submit">Войти</button>
          </form>
          {error && <p className="error">{error}</p>}
          <p className="hint">DISPATCHER / demo123</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <div>
          <h1>Диспетчер</h1>
          <p className="hint">{user?.fullName} · {user?.employeeCode}</p>
        </div>
        <button className="secondary" onClick={() => { clearSession(); setToken(null); setUser(null); }}>
          Выйти
        </button>
      </div>

      <div className="tabs">
        {(['dashboard', 'requests', 'create', 'employees'] as Tab[]).map((t) => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {t === 'dashboard' && 'Сводка'}
            {t === 'requests' && 'Заявки'}
            {t === 'create' && 'Новая'}
            {t === 'employees' && 'Сотрудники'}
          </button>
        ))}
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="hint">Обновление...</p>}

      {tab === 'dashboard' && stats && (
        <div className="stats-grid">
          <div className="stat-card"><span>Всего заявок</span><strong>{stats.total}</strong></div>
          <div className="stat-card"><span>Сегодня по графику</span><strong>{stats.scheduledToday}</strong></div>
          <div className="stat-card"><span>Срочных открытых</span><strong>{stats.highPriorityOpen}</strong></div>
          <div className="stat-card"><span>Исполнителей</span><strong>{stats.executorsActive}</strong></div>
          {Object.entries(stats.byStatus).map(([s, n]) => (
            <div key={s} className="stat-card small">
              <span>{statusLabels[s] ?? s}</span><strong>{n}</strong>
            </div>
          ))}
        </div>
      )}

      {tab === 'requests' && (
        <div>
          <div className="filters">
            <input placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Все статусы</option>
              {Object.entries(statusLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="">Все приоритеты</option>
              {Object.entries(priorityLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          {requests.map((req) => (
            <div key={req.id} className="request-row">
              <div style={{ flex: 1 }}>
                <strong>{req.id}</strong> — {req.title}
                <p className="hint">{req.clientName} {req.clientPhone && `· ${req.clientPhone}`}</p>
                <p className="hint">{req.address}</p>
                <p className="hint">
                  {new Date(req.scheduledAt).toLocaleString('ru-RU')} ·{' '}
                  <span className="badge">{statusLabels[req.status]}</span> ·{' '}
                  <span className="badge priority">{priorityLabels[req.priority]}</span>
                  {req.assigneeName && ` · ${req.assigneeName}`}
                </p>
                <button type="button" className="link-btn" onClick={() => toggleHistory(req.id)}>
                  {expandedId === req.id ? 'Скрыть историю' : 'История'}
                </button>
                {expandedId === req.id && history[req.id]?.map((h) => (
                  <div key={h.id} className="history-line">
                    {new Date(h.createdAt).toLocaleString('ru-RU')} — {h.employeeName}: {h.statusFrom} → {h.statusTo}
                    {h.note && ` (${h.note})`}
                    {h.hasPhoto && ' 📷'}
                  </div>
                ))}
              </div>
              <div className="actions-col">
                <label>Исполнитель</label>
                <select
                  value={req.assigneeId ?? ''}
                  onChange={(e) => e.target.value && assignRequest(req.id, Number(e.target.value)).then(loadData)}
                >
                  <option value="">—</option>
                  {executors.map((ex) => (
                    <option key={ex.id} value={ex.id}>{ex.fullName}</option>
                  ))}
                </select>
                {req.status !== 'cancelled' && req.status !== 'completed' && (
                  <button
                    type="button"
                    className="danger"
                    onClick={() => {
                      const reason = prompt('Причина отмены?');
                      if (reason) cancelRequest(req.id, reason).then(loadData);
                    }}
                  >
                    Отменить
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'create' && (
        <div className="card">
          <h2>Регистрация заявки</h2>
          <form onSubmit={onCreate} className="grid">
            <input required placeholder="Тема работ" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} />
            <input required placeholder="Клиент" value={createForm.clientName} onChange={(e) => setCreateForm({ ...createForm, clientName: e.target.value })} />
            <input placeholder="Телефон клиента" value={createForm.clientPhone} onChange={(e) => setCreateForm({ ...createForm, clientPhone: e.target.value })} />
            <input required placeholder="Адрес" value={createForm.address} onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })} />
            <input required type="datetime-local" value={createForm.scheduledAt} onChange={(e) => setCreateForm({ ...createForm, scheduledAt: e.target.value })} />
            <select value={createForm.priority} onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}>
              <option value="low">Низкий приоритет</option>
              <option value="normal">Обычный</option>
              <option value="high">Срочный</option>
            </select>
            <textarea placeholder="Описание" rows={3} value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} />
            <button type="submit">Создать</button>
          </form>
        </div>
      )}

      {tab === 'employees' && (
        <div>
          <div className="card">
            <h2>Добавить сотрудника</h2>
            <form onSubmit={onCreateEmployee} className="grid">
              <input required placeholder="Табельный номер" value={employeeForm.employeeCode} onChange={(e) => setEmployeeForm({ ...employeeForm, employeeCode: e.target.value })} />
              <input required placeholder="ФИО" value={employeeForm.fullName} onChange={(e) => setEmployeeForm({ ...employeeForm, fullName: e.target.value })} />
              <input placeholder="Телефон" value={employeeForm.phone} onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })} />
              <input required type="password" placeholder="Пароль" value={employeeForm.password} onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })} />
              <select value={employeeForm.role} onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value as 'executor' | 'dispatcher' })}>
                <option value="executor">Исполнитель</option>
                <option value="dispatcher">Диспетчер</option>
              </select>
              <button type="submit">Сохранить</button>
            </form>
          </div>
          <h2 style={{ marginTop: 24 }}>Все сотрудники</h2>
          {employees.map((emp) => (
            <div key={emp.id} className="request-row">
              <div>
                <strong>{emp.employeeCode}</strong> — {emp.fullName}
                <p className="hint">Роль: {emp.role === 'dispatcher' ? 'Диспетчер' : 'Исполнитель'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
