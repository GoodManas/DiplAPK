let apiBaseUrl = '';
let authToken: string | null = null;

export function setApiBaseUrl(url: string) {
  apiBaseUrl = url;
}

export function getApiBaseUrl() {
  return apiBaseUrl;
}

export function setAuthToken(token: string | null) {
  authToken = token;
}

function buildUrl(path: string): string {
  let url = `${apiBaseUrl}${path}`;
  if (authToken) {
    const sep = url.includes('?') ? '&' : '?';
    url += `${sep}access_token=${encodeURIComponent(authToken)}`;
  }
  return url;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiBaseUrl) {
    throw new Error('Адрес сервера не задан. Укажите его в настройках.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
    headers['X-Auth-Token'] = authToken;
  }

  const res = await fetch(buildUrl(path), {
    ...init,
    headers,
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `Ошибка ${res.status}`);
  }
  return data as T;
}
