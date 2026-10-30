import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/*
 * Проекты портфолио: один файл = один проект в src/content/projects/.
 * Файлы, имя которых начинается с «_», не публикуются (это шаблоны и черновики).
 * Чтобы посмотреть шаблон локально: npm run dev:examples
 */
const showExamples = process.env.SHOW_EXAMPLES === '1';

const projects = defineCollection({
  loader: glob({
    base: './src/content/projects',
    pattern: showExamples ? '**/*.md' : '**/[^_]*.md',
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Одна строка о проекте для карточек. */
      summary: z.string(),
      category: z.enum(['landing', 'business', 'catalog', 'personal', 'concept']),
      /** true — демонстрационный проект, не заказ. На сайте помечается «Концепт». */
      isConcept: z.boolean().default(false),
      year: z.number().int(),
      /** Порядок в списках: меньше — выше. */
      order: z.number().default(100),
      featured: z.boolean().default(false),
      cover: image(),
      coverAlt: z.string(),
      task: z.string(),
      stack: z.array(z.string()),
      designNotes: z.array(z.string()).default([]),
      gallery: z
        .array(z.object({ src: image(), alt: z.string(), caption: z.string().optional() }))
        .default([]),
      responsive: z
        .object({
          desktop: image().optional(),
          tablet: image().optional(),
          mobile: image().optional(),
        })
        .default({}),
      /** Результаты проекта — только реальные, проверяемые цифры. */
      results: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
      liveUrl: z.url().optional(),
      repoUrl: z.url().optional(),
    }),
});

export const collections = { projects };
