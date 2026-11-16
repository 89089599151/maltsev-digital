import { SHEET_OPEN_CLASS } from './island-sheet';
import { ESTIMATE_EVENT, shortSum, type EstimateDetail } from '@/lib/estimate';

/** Остров сжимается, когда до конца страницы осталось не больше этого расстояния. */
const END_ENTER = 8;
/** И разворачивается, когда читатель поднялся от конца дальше этого: запас от дрожания у края. */
const END_LEAVE = 32;
/** На странице короче этой прокрутки остров не сжимается вовсе. */
const COMPACT_FROM = 240;
/** Раздел считается текущим, когда его начало поднялось выше этой доли высоты экрана. */
const PROBE = 0.45;
/** Сколько раздел должен оставаться текущим, чтобы подпись сменилась: быстрая прокрутка её не дёргает. */
const SETTLE_MS = 180;

const EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

const isTextField = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLInputElement &&
      !['checkbox', 'radio', 'range', 'button', 'submit', 'reset', 'file', 'color'].includes(target.type)));

/**
 * Остров в покое. Пока страницу читают, он развёрнут; сжимается до двух кнопок только в самом конце
 * страницы, где навигацию повторяет подвал, и разворачивается при движении вверх. Уходит, пока открыта клавиатура.
 * Подпись кнопки меню следует за читателем: раздел страницы ([data-island-section]) под его взглядом,
 * а после работы с калькулятором — пакет и сумма расчёта; синяя кнопка тогда отправляет расчёт.
 */
export function initIsland(): void {
  const island = document.querySelector<HTMLElement>('[data-island]');
  if (!island || island.dataset.islandReady) return;
  island.dataset.islandReady = 'true';

  const root = document.documentElement;
  const desktop = window.matchMedia('(min-width: 1024px)');
  const narrow = window.matchMedia('(max-width: 359px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const menuLabel = island.querySelector<HTMLElement>('[data-island-menu-label]');
  const writeLabel = island.querySelector<HTMLElement>('[data-island-write-label]');
  const write = island.querySelector<HTMLElement>('[data-write-open]');
  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-island-section]'));
  const pageLabel = menuLabel?.textContent ?? '';
  const writeText = writeLabel?.textContent ?? '';
  const writeAria = write?.getAttribute('aria-label') ?? '';
  let ticking = false;
  let compact = false;
  let section: string | null = null;
  let pending: string | null = null;
  let settleTimer: number | undefined;
  let estimate: EstimateDetail | null = null;

  const canAnimate = () => !reducedMotion.matches && !desktop.matches && typeof island.animate === 'function';

  /** Меняет подпись: новый текст поднимается снизу, ширина кнопки меняется плавно. */
  const setLabel = (label: HTMLElement | null, text: string) => {
    if (!label || label.textContent === text) return;
    const fold = label.parentElement;
    const animate = canAnimate() && !island.classList.contains('is-compact') && fold;
    const from = animate ? fold.getBoundingClientRect().width : 0;
    label.textContent = text;
    if (!animate) return;
    const to = fold.getBoundingClientRect().width;
    if (from !== to) {
      // Пока ширина догоняет новый текст, многоточие не мелькает.
      label.style.textOverflow = 'clip';
      const grow = fold.animate([{ width: `${from}px` }, { width: `${to}px` }], { duration: 280, easing: EASE });
      const restore = () => label.style.removeProperty('text-overflow');
      grow.addEventListener('finish', restore);
      grow.addEventListener('cancel', restore);
    }
    label.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: EASE });
  };

  const render = () => {
    const live = estimate !== null;
    island.classList.toggle('is-live', live);
    // Расчёт остаётся на виду даже в конце страницы.
    island.classList.toggle('is-compact', compact && !live && !desktop.matches);
    const sum = estimate ? shortSum(estimate.sum) : '';
    setLabel(menuLabel, estimate ? (narrow.matches ? sum : `${estimate.plan} · ${sum}`) : (section ?? pageLabel));
    setLabel(writeLabel, live ? 'Отправить' : writeText);
    write?.setAttribute('aria-label', live ? 'Отправить расчёт' : writeAria);
  };

  /** Раздел под взглядом: последний по порядку, чьё начало уже выше контрольной линии. */
  const currentSection = (): string | null => {
    const probe = window.innerHeight * PROBE;
    let found: string | null = null;
    for (const el of sections) {
      const rect = el.getBoundingClientRect();
      if (rect.height > 0 && rect.top <= probe && rect.bottom > 0) found = el.dataset.islandSection || null;
    }
    return found;
  };

  const trackSection = () => {
    const next = currentSection();
    if (next === pending) return;
    pending = next;
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(() => {
      if (pending === section) return;
      section = pending;
      render();
    }, SETTLE_MS);
  };

  const update = () => {
    ticking = false;
    // При открытом листе страница зафиксирована и её прокрутка обнулена — это не движение читателя.
    if (desktop.matches || root.classList.contains(SHEET_OPEN_CLASS)) return;
    if (sections.length) trackSection();
    const range = root.scrollHeight - window.innerHeight;
    const left = range - window.scrollY;
    const next = range > COMPACT_FROM && left <= (compact ? END_LEAVE : END_ENTER);
    if (next === compact) return;
    compact = next;
    render();
  };

  const schedule = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });

  document.addEventListener(ESTIMATE_EVENT, (event) => {
    const first = estimate === null;
    estimate = (event as CustomEvent<EstimateDetail>).detail;
    render();
    // Остров отзывается на каждое изменение суммы — как итог в калькуляторе.
    if (canAnimate()) {
      island.animate([{ scale: 1 }, { scale: first ? 1.06 : 1.03 }, { scale: 1 }], { duration: first ? 420 : 300, easing: EASE });
    }
  });

  document.addEventListener('focusin', (event) => {
    island.classList.toggle('is-away', !desktop.matches && isTextField(event.target));
  });
  document.addEventListener('focusout', () => island.classList.remove('is-away'));

  desktop.addEventListener('change', () => {
    compact = false;
    island.classList.remove('is-away');
    render();
    schedule();
  });
  narrow.addEventListener('change', render);

  // Страница могла открыться уже прокрученной — по якорю или после возврата назад.
  schedule();
}
