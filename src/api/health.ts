import { normalizeServerUrl } from '../utils/serverUrl';

export type HealthCheckResult = {
  ok: boolean;
  message: string;
  service?: string;
};

export async function checkServerHealth(input: string): Promise<HealthCheckResult> {
  let baseUrl: string;
  try {
    baseUrl = normalizeServerUrl(input);
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : 'Некорректный адрес',
    };
  }

  try {
    const res = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      service?: string;
      error?: string;
    };
    if (res.ok && data.ok) {
      return {
        ok: true,
        message: 'Сервер доступен',
        service: data.service,
      };
    }
    return {
      ok: false,
      message: data.error ?? `Сервер ответил с кодом ${res.status}`,
    };
  } catch {
    return {
      ok: false,
      message:
        'Нет связи с сервером. Проверьте URL (https://....lhr.life), что туннель SSH открыт и на ПК запущен API (run_mobile_api.py).',
    };
  }
}
