/**
 * Основные настройки сайта: бренд, контакты, приём заявок.
 *
 * Поля с `confirmed: false` — заполнители. Пока хотя бы одно из них не подтверждено,
 * на сайте видна плашка «Предварительная версия», контакты не превращаются в ссылки,
 * а `npm run check:launch` (и публикация через GitHub Actions) завершается ошибкой.
 */

export interface Confirmable<T> {
  value: T;
  confirmed: boolean;
}

export const site = {
  brand: {
    /** Название бренда. Рабочее, требует подтверждения. */
    name: { value: 'MALTSEV DIGITAL', confirmed: false } as Confirmable<string>,
    /** Короткая форма для логотипа и футера. */
    short: 'MALTSEV',
    second: 'DIGITAL',
    /** Имя автора — используется на странице «Обо мне» и в разметке Schema.org. */
    owner: { value: 'Сергей Мальцев', confirmed: false } as Confirmable<string>,
    tagline: 'Разработка сайтов под задачу бизнеса',
  },

  seo: {
    defaultTitle: 'MALTSEV DIGITAL — разработка сайтов под ключ',
    defaultDescription:
      'Независимый веб-разработчик: лендинги, сайты для бизнеса и индивидуальные проекты. Продуманный дизайн, быстрый код, фиксированная цена до старта.',
    locale: 'ru_RU',
  },

  contacts: {
    /** Логин Telegram без @. */
    telegram: { value: 'maltsev_digital', confirmed: false } as Confirmable<string>,
    email: { value: 'hello@maltsev.digital', confirmed: false } as Confirmable<string>,
    /** Через какое время вы обычно отвечаете. Обещание клиенту — подтвердите. */
    responseTime: { value: 'в течение рабочего дня', confirmed: false } as Confirmable<string>,
    workFormat: 'Удалённо, по всей России',
  },

  forms: {
    /**
     * ID формы Formspree (часть адреса https://formspree.io/f/<ID>).
     * Пустая строка — форма показывает, что приём заявок ещё не подключён,
     * и предлагает написать напрямую. Ничего не имитирует.
     */
    formspreeId: '',
  },

  legal: {
    /** Кто обрабатывает персональные данные — ФИО самозанятого/ИП. */
    operatorName: { value: '[ФИО оператора]', confirmed: false } as Confirmable<string>,
    operatorStatus: { value: '[самозанятый / ИП, ИНН]', confirmed: false } as Confirmable<string>,
    policyDate: { value: '30 октября 2026', confirmed: false } as Confirmable<string>,
  },

  /** Подтверждение содержания портфолио перед запуском. */
  portfolioConfirmed: false,
} as const;

export function telegramUrl(): string | null {
  const tg = site.contacts.telegram;
  return tg.confirmed ? `https://t.me/${tg.value}` : null;
}

export function emailUrl(subject?: string): string | null {
  const em = site.contacts.email;
  if (!em.confirmed) return null;
  return `mailto:${em.value}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
}
