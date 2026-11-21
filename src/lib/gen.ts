import type { ImageMetadata } from 'astro';

/**
 * Сгенерированные изображения (IMAGE_GENERATION_PROMPTS.md), которые сейчас стоят на страницах.
 * Список явный: в сборку попадают только эти файлы. Раньше подключалась вся папка src/assets/gen
 * целиком — и на хостинг уходили около 17 МБ неиспользуемых PNG.
 * Новый объект: положите файл в src/assets/gen/ и добавьте его строкой ниже.
 */
import heroGlassWave from '@/assets/gen/hero-glass-wave.png';
import heroObjectV2 from '@/assets/gen/hero-object-v2.png';
import pricePearl from '@/assets/gen/price-pearl.png';
import servicesOctopus from '@/assets/gen/services-octopus.png';
import contactsBottle from '@/assets/gen/contacts-bottle.png';
import faqSeahorse from '@/assets/gen/faq-seahorse.png';
import notfoundBuoy from '@/assets/gen/notfound-buoy.png';

const images: Record<string, ImageMetadata> = {
  'hero-glass-wave': heroGlassWave,
  'hero-object-v2': heroObjectV2,
  'price-pearl': pricePearl,
  'services-octopus': servicesOctopus,
  'contacts-bottle': contactsBottle,
  'faq-seahorse': faqSeahorse,
  'notfound-buoy': notfoundBuoy,
};

export function genImage(name: string): { src: ImageMetadata; generated: boolean } | null {
  const src = images[name];
  return src ? { src, generated: true } : null;
}
