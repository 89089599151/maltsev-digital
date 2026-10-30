/**
 * Подставляет в бриф выбранный тариф и расчёт калькулятора из адресной строки:
 * /contacts/?plan=business&pages=6&addons=copy,lang&sum=124000
 * В адресе только параметры проекта — никаких персональных данных.
 */
import { addons as addonList } from '@/config/pricing';

export function applyBriefParams(): void {
  const form = document.querySelector<HTMLFormElement>('form[data-lead-form]');
  if (!form) return;
  const params = new URLSearchParams(location.search);

  const plan = params.get('plan');
  if (plan) {
    const radio = form.querySelector<HTMLInputElement>(`input[name="plan"][data-plan-id="${CSS.escape(plan)}"]`);
    if (radio) radio.checked = true;
  }

  const pages = params.get('pages');
  const sum = params.get('sum');
  if (pages || sum) {
    const addons = params
      .get('addons')
      ?.split(',')
      .map((id) => addonList.find((a) => a.id === id)?.name.toLowerCase())
      .filter(Boolean)
      .join(', ');
    const fmt = (n: string) => new Intl.NumberFormat('ru-RU').format(Number(n)) + ' ₽';
    const parts = [
      plan ? `тариф ${plan.toUpperCase()}` : '',
      pages ? `страниц: ${Number(pages)}` : '',
      addons ? `дополнительно: ${addons}` : '',
      sum ? `ориентир ${fmt(sum)}` : '',
    ].filter(Boolean);
    const summary = `Расчёт с сайта: ${parts.join(', ')}`;

    const hidden = form.querySelector<HTMLInputElement>('[data-estimate-field]');
    if (hidden) hidden.value = summary;
    const task = form.querySelector<HTMLTextAreaElement>('textarea[name="message"]');
    if (task && !task.value) task.value = `${summary}.\n\n`;
  }
}
