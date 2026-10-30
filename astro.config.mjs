// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/*
 * Адрес и базовый путь задаются переменными окружения, чтобы один и тот же код
 * работал и в подкаталоге GitHub Pages, и на собственном домене:
 *
 *   GitHub Pages без домена:  SITE_URL=https://<логин>.github.io  BASE_PATH=/maltsev-digital
 *   Собственный домен:        SITE_URL=https://maltsev.digital     BASE_PATH=/
 *
 * В GitHub Actions значения берутся из Settings → Secrets and variables → Variables.
 */
const site = process.env.SITE_URL || 'https://example.github.io';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  // CSS встраивается в страницу: без блокирующих запросов на медленных сетях.
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
  image: {
    responsiveStyles: false,
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
});
