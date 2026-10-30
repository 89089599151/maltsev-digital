import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site as config } from '@/config/site';
import { plans, formatPrice, pricingConfirmed } from '@/config/pricing';

/** Краткая карта сайта для ИИ-ассистентов (стандарт llms.txt). */
export const GET: APIRoute = async ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const abs = (p: string) => new URL(`${base}${p}`, site).href;
  const projects = await getCollection('projects');

  const lines = [
    `# ${config.brand.name.value}`,
    '',
    `> ${config.seo.defaultDescription}`,
    '',
    '## Страницы',
    `- [Главная](${abs('/')}): кто делает сайты, подход, тарифы, процесс`,
    `- [Услуги и цены](${abs('/services/')}): состав тарифов, сравнение, калькулятор, этапы работы`,
    `- [Работы](${abs('/portfolio/')}): портфолио с разбором проектов`,
    `- [Обо мне](${abs('/about/')}): как используется ИИ и принципы работы`,
    `- [Вопросы и ответы](${abs('/faq/')})`,
    `- [Контакты](${abs('/contacts/')}): форма заявки`,
    '',
    `## Тарифы${pricingConfirmed ? '' : ' (предварительные)'}`,
    ...plans.map((p) => `- ${p.name} — ${formatPrice(p.price)}, ${p.timeline}: ${p.forWhom}`),
  ];
  if (projects.length) {
    lines.push('', '## Проекты', ...projects.map((p) => `- [${p.data.title}](${abs(`/portfolio/${p.id}/`)}): ${p.data.summary}`));
  }
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
