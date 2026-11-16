import { ESTIMATE_EVENT, type EstimateDetail } from '@/lib/estimate';

interface EstPlan {
  id: string;
  name: string;
  price: number;
  maxPages: number;
  timeline: string;
}

interface EstConfig {
  plans: EstPlan[];
  addons: { id: string; name: string; price: number }[];
  extraPagePrice: number;
  includedIn: Record<string, string[]>;
  contactUrl: string;
}

const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';

/**
 * Калькулятор на странице услуг. Тип сайта и страницы — в форме [data-estimator];
 * дополнительные работы — кнопки [data-addon] в списке «Дополнительно» под калькулятором.
 * Без скрипта кнопки скрыты, а список остаётся обычным прайсом.
 */
export function initEstimator(): void {
  const form = document.querySelector<HTMLFormElement>('[data-estimator]');
  if (!form?.dataset.config) return;
  const cfg = JSON.parse(form.dataset.config) as EstConfig;

  const range = form.querySelector<HTMLInputElement>('input[name="pages"]')!;
  const pagesOut = form.querySelector<HTMLOutputElement>('[data-pages-out]')!;
  const pagesNote = form.querySelector<HTMLElement>('[data-pages-note]');
  const defaultNote = pagesNote?.textContent ?? '';
  const outPlan = form.querySelector<HTMLElement>('[data-out-plan]')!;
  const outSum = form.querySelector<HTMLElement>('[data-out-sum]')!;
  const outTime = form.querySelector<HTMLElement>('[data-out-time]')!;
  const outExtra = form.querySelector<HTMLElement>('[data-out-extra]')!;
  const outLink = form.querySelector<HTMLAnchorElement>('[data-out-link]')!;
  const mirror = document.querySelector<HTMLElement>('[data-out-mirror]');
  const mirrorSum = document.querySelector<HTMLElement>('[data-out-mirror-sum]');
  const toggles = Array.from(document.querySelectorAll<HTMLButtonElement>('button[data-addon]'));
  const chosen = new Set<string>();
  // Расчёт уходит в остров и лист «Написать» только после того, как посетитель сам что-то поменял.
  let touched = false;

  form.addEventListener('submit', (e) => e.preventDefault());

  const calc = () => {
    const type = form.querySelector<HTMLInputElement>('input[name="type"]:checked')?.value ?? 'business';
    // Лендинг — всегда одна страница: ползунок закрыт, чтобы цена не менялась без объяснения.
    const isLanding = type === 'start';
    if (isLanding) range.value = '1';
    range.disabled = isLanding;
    if (pagesNote) {
      pagesNote.textContent = isLanding
        ? 'Лендинг — одна страница. Нужно больше — выберите «Сайт компании».'
        : defaultNote;
    }
    const pages = Number(range.value);
    pagesOut.value = String(pages);

    // Пакет определяется типом сайта. Страницы сверх пакета — доплата за каждую, без смены пакета.
    const plan = cfg.plans.find((p) => p.id === type) ?? cfg.plans[1];
    const included = cfg.includedIn[plan.id] ?? [];
    const extraPages = Math.max(0, pages - plan.maxPages);

    let sum = plan.price + extraPages * cfg.extraPagePrice;
    const names: string[] = [];
    const ids: string[] = [];
    for (const btn of toggles) {
      const id = btn.dataset.addon!;
      const addon = cfg.addons.find((a) => a.id === id);
      if (!addon) continue;
      const row = btn.closest<HTMLElement>('[data-addon-row]');
      const price = row?.querySelector<HTMLElement>('[data-addon-price]');
      const isIncluded = included.includes(id);
      const isOn = chosen.has(id) && !isIncluded;

      btn.disabled = isIncluded;
      btn.setAttribute('aria-pressed', String(isOn));
      btn.setAttribute('aria-label', isIncluded ? `${addon.name}: уже входит в ${plan.name}` : `${isOn ? 'Убрать из расчёта' : 'Добавить в расчёт'}: ${addon.name}`);
      // «+» — можно добавить, «−» — добавлено, галочка — уже входит в пакет.
      btn.querySelector('[data-icon-plus]')?.toggleAttribute('hidden', isOn || isIncluded);
      btn.querySelector('[data-icon-minus]')?.toggleAttribute('hidden', !isOn);
      btn.querySelector('[data-icon-check]')?.toggleAttribute('hidden', !isIncluded);
      row?.classList.toggle('is-on', isOn);
      row?.classList.toggle('is-included', isIncluded);
      if (price) price.textContent = isIncluded ? `входит в ${plan.name}` : fmt(addon.price);

      if (isOn) {
        sum += addon.price;
        names.push(addon.name);
        ids.push(id);
      }
    }

    outPlan.textContent = plan.name;
    outSum.textContent = fmt(sum);
    // Доп. страницы удлиняют работу — точный срок называется в предложении.
    outTime.textContent = extraPages ? `${plan.timeline} и больше — уточню в предложении` : plan.timeline;
    const notes: string[] = [];
    if (extraPages) notes.push(`Сверх пакета: ${extraPages} стр. × ${fmt(cfg.extraPagePrice)}`);
    if (names.length) notes.push(`Добавлено: ${names.join(', ')}`);
    outExtra.textContent = notes.join('. ');
    if (mirrorSum) mirrorSum.textContent = `${fmt(sum)} · ${plan.name}`;

    const params = new URLSearchParams({ plan: plan.id, pages: String(pages), sum: String(sum) });
    if (ids.length) params.set('addons', ids.join(','));
    outLink.href = `${cfg.contactUrl}?${params}`;

    if (!touched) return;
    // Тот же порядок и слова, что в брифе (brief-params.ts).
    const parts = [`пакет ${plan.name}`, `страниц: ${pages}`];
    if (names.length) parts.push(`дополнительно: ${names.join(', ').toLowerCase()}`);
    parts.push(`ориентир ${fmt(sum)}`);
    const detail: EstimateDetail = { plan: plan.name, sum, summary: parts.join(', '), href: outLink.href };
    document.dispatchEvent(new CustomEvent(ESTIMATE_EVENT, { detail }));
  };

  form.querySelectorAll<HTMLInputElement>('input[name="type"]').forEach((r) =>
    r.addEventListener('change', () => {
      range.value = r.dataset.pages ?? range.value;
      touched = true;
      calc();
    }),
  );
  form.addEventListener('input', () => {
    touched = true;
    calc();
  });

  for (const btn of toggles) {
    btn.hidden = false;
    btn.addEventListener('click', () => {
      const id = btn.dataset.addon!;
      if (chosen.has(id)) chosen.delete(id);
      else chosen.add(id);
      touched = true;
      calc();
      // Итог чуть «подпрыгивает», чтобы изменение заметили.
      outSum.classList.remove('is-bumped');
      void outSum.offsetWidth;
      outSum.classList.add('is-bumped');
    });
  }
  if (mirror) mirror.hidden = false;
  calc();
}
