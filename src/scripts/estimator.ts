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
  const outPlan = form.querySelector<HTMLElement>('[data-out-plan]')!;
  const outSum = form.querySelector<HTMLElement>('[data-out-sum]')!;
  const outTime = form.querySelector<HTMLElement>('[data-out-time]')!;
  const outExtra = form.querySelector<HTMLElement>('[data-out-extra]')!;
  const outLink = form.querySelector<HTMLAnchorElement>('[data-out-link]')!;
  const mirror = document.querySelector<HTMLElement>('[data-out-mirror]');
  const mirrorSum = document.querySelector<HTMLElement>('[data-out-mirror-sum]');
  const toggles = Array.from(document.querySelectorAll<HTMLButtonElement>('button[data-addon]'));
  const chosen = new Set<string>();

  form.addEventListener('submit', (e) => e.preventDefault());

  const calc = () => {
    const type = form.querySelector<HTMLInputElement>('input[name="type"]:checked')?.value ?? 'business';
    const pages = Number(range.value);
    pagesOut.value = String(pages);

    // Тариф определяется типом сайта. Лендинг больше чем на одну страницу — уже сайт компании.
    // Страницы сверх лимита тарифа считаются доплатой, а не переводом в более дорогой пакет.
    const planId = type === 'start' && pages > 1 ? 'business' : type;
    const plan = cfg.plans.find((p) => p.id === planId) ?? cfg.plans[1];
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
      // «+» — можно добавить, «−» — добавлено, галочка — уже входит в тариф.
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
    outTime.textContent = plan.timeline;
    const notes: string[] = [];
    if (extraPages) notes.push(`${extraPages} доп. стр. × ${fmt(cfg.extraPagePrice)}`);
    if (names.length) notes.push(names.join(', '));
    outExtra.textContent = notes.length ? `Включено: ${notes.join('; ')}` : '';
    if (mirrorSum) mirrorSum.textContent = `${fmt(sum)} · ${plan.name}`;

    const params = new URLSearchParams({ plan: plan.id, pages: String(pages), sum: String(sum) });
    if (ids.length) params.set('addons', ids.join(','));
    outLink.href = `${cfg.contactUrl}?${params}`;
  };

  form.querySelectorAll<HTMLInputElement>('input[name="type"]').forEach((r) =>
    r.addEventListener('change', () => {
      range.value = r.dataset.pages ?? range.value;
      calc();
    }),
  );
  form.addEventListener('input', calc);

  for (const btn of toggles) {
    btn.hidden = false;
    btn.addEventListener('click', () => {
      const id = btn.dataset.addon!;
      if (chosen.has(id)) chosen.delete(id);
      else chosen.add(id);
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
