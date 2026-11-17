import { defineMiddleware } from 'astro:middleware';
import { typograph } from '@/lib/typograph';

/**
 * Прогоняет каждую HTML-страницу через типограф (src/lib/typograph.ts). На статическом сайте
 * срабатывает при сборке, в режиме разработки — на каждый запрос; файлы .txt и .xml не трогает.
 */
export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  if (!(response.headers.get('content-type') ?? '').includes('text/html')) return response;
  const html = await response.text();
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(typograph(html), { status: response.status, statusText: response.statusText, headers });
});
