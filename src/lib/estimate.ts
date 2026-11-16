/**
 * Расчёт из калькулятора как событие страницы: его слушают остров (показывает сумму)
 * и лист «Написать» (прикладывает расчёт к сообщению). Только параметры проекта, без личных данных.
 */
export const ESTIMATE_EVENT = 'site:estimate';

export interface EstimateDetail {
  /** Название пакета: START, BUSINESS, PREMIUM. */
  plan: string;
  /** Ориентировочная сумма в рублях. */
  sum: number;
  /** Расчёт одной строкой — тот же текст, что подставляется в бриф. */
  summary: string;
  /** Адрес брифа с параметрами расчёта. */
  href: string;
}

/** Короткая сумма для острова: 83 000 → «83 тыс. ₽». */
export function shortSum(sum: number): string {
  return `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(sum / 1000)} тыс. ₽`;
}

export function fullSum(sum: number): string {
  return `${new Intl.NumberFormat('ru-RU').format(sum)} ₽`;
}
