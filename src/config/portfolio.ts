/** Категории портфолио. id совпадает с полем `category` в файлах проектов. */
export const categories = [
  { id: 'landing', label: 'Лендинги' },
  { id: 'business', label: 'Сайты для бизнеса' },
  { id: 'catalog', label: 'Каталоги и магазины' },
  { id: 'personal', label: 'Сайты специалистов' },
  { id: 'concept', label: 'Концепты' },
] as const;

export type CategoryId = (typeof categories)[number]['id'];

export function categoryLabel(id: string): string {
  return categories.find((c) => c.id === id)?.label ?? id;
}
