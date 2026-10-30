/** Ссылка с учётом базового пути (подкаталог GitHub Pages или корень домена). */
export function url(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}

/** Проверка активного раздела для навигации. */
export function isActive(current: string, href: string): boolean {
  const target = url(href);
  if (href === '/') return current === target;
  return current.startsWith(target);
}
