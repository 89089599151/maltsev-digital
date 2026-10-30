import { site } from '@/config/site';
import { pricingConfirmed } from '@/config/pricing';

/** Список того, что ещё не подтверждено владельцем. Пустой — сайт готов к запуску. */
export function pendingItems(): string[] {
  const items: string[] = [];
  if (!site.brand.name.confirmed) items.push('название бренда');
  if (!site.brand.owner.confirmed) items.push('имя владельца');
  if (!site.contacts.telegram.confirmed) items.push('Telegram');
  if (!site.contacts.email.confirmed) items.push('электронная почта');
  if (!site.contacts.responseTime.confirmed) items.push('срок ответа');
  if (!pricingConfirmed) items.push('цены и сроки');
  if (!site.forms.formspreeId) items.push('приём заявок (Formspree)');
  if (!site.legal.operatorName.confirmed || !site.legal.operatorStatus.confirmed)
    items.push('данные оператора персональных данных');
  if (!site.portfolioConfirmed) items.push('содержание портфолио');
  return items;
}
