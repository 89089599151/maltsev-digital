import type { ImageMetadata } from 'astro';

/**
 * Сгенерированные изображения (IMAGE_GENERATION_PROMPTS.md).
 * Достаточно положить файл в src/assets/gen/ с именем из задания — он подхватится сам.
 * Пока файла нет, используется временная графика из src/assets/placeholder/.
 */
type Mod = { default: ImageMetadata };

const generated = import.meta.glob<Mod>('../assets/gen/*.{png,webp,jpg,jpeg,avif}', { eager: true });
const placeholders = import.meta.glob<Mod>('../assets/placeholder/*.{png,webp}', { eager: true });

const byName = (mods: Record<string, Mod>, name: string) =>
  Object.entries(mods).find(([path]) => path.split('/').pop()?.replace(/\.[^.]+$/, '') === name)?.[1].default;

export function genImage(name: string): { src: ImageMetadata; generated: boolean } | null {
  const real = byName(generated, name);
  if (real) return { src: real, generated: true };
  const temp = byName(placeholders, name);
  return temp ? { src: temp, generated: false } : null;
}
