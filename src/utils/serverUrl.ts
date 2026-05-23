/** Нормализует введённый адрес: схема, без хвостового /api и слэшей. */
export function normalizeServerUrl(input: string): string {
  let url = input.trim();
  if (!url) {
    throw new Error('Введите адрес сервера');
  }
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  url = url.replace(/\/+$/, '');
  if (url.endsWith('/api')) {
    url = url.slice(0, -4);
  }
  return url;
}
