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

const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';

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

  form.addEventListener('submit', (e) => e.preventDefault());

  const calc = () => {
    const type = (form.querySelector<HTMLInputElement>('input[name="type"]:checked')?.value ?? 'business');
    const pages = Number(range.value);
    pagesOut.value = String(pages);

    // Тариф определяется типом сайта. Лендинг больше чем на одну страницу — уже сайт компании.
    // Страницы сверх лимита тарифа считаются доплатой, а не переводом в более дорогой пакет.
    const planId = type === 'start' && pages > 1 ? 'business' : type;
    const plan = cfg.plans.find((p) => p.id === planId) ?? cfg.plans[1];
    const included = cfg.includedIn[plan.id] ?? [];
    const extraPages = Math.max(0, pages - plan.maxPages);

    let sum = plan.price + extraPages * cfg.extraPagePrice;
    const chosen: string[] = [];
    form.querySelectorAll<HTMLInputElement>('input[name="addons"]').forEach((box) => {
      const label = box.closest<HTMLElement>('[data-addon-label]');
      const price = label?.querySelector<HTMLElement>('[data-addon-price]');
      const addon = cfg.addons.find((a) => a.id === box.value);
      const isIncluded = included.includes(box.value);
      label?.classList.toggle('is-included', isIncluded);
      box.disabled = isIncluded;
      if (price && addon) price.textContent = isIncluded ? `входит в ${plan.name}` : `+${fmt(addon.price)}`;
      if (box.checked && !isIncluded && addon) {
        sum += addon.price;
        chosen.push(addon.name);
      }
    });

    outPlan.textContent = plan.name;
    outSum.textContent = fmt(sum);
    outTime.textContent = plan.timeline;
    const notes: string[] = [];
    if (extraPages) notes.push(`${extraPages} доп. стр. × ${fmt(cfg.extraPagePrice)}`);
    if (chosen.length) notes.push(chosen.join(', '));
    outExtra.textContent = notes.length ? `Включено: ${notes.join('; ')}` : '';

    const params = new URLSearchParams({ plan: plan.id, pages: String(pages), sum: String(sum) });
    const ids = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="addons"]:checked:not(:disabled)')).map((b) => b.value);
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
  calc();
}
