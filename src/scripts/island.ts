/** Сколько пикселей нужно прокрутить, чтобы остров сменил состояние: защита от дрожания. */
const SCROLL_STEP = 6;
/** Выше этой отметки остров всегда развёрнут. */
const COMPACT_FROM = 240;

const isTextField = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLInputElement &&
      !['checkbox', 'radio', 'range', 'button', 'submit', 'reset', 'file', 'color'].includes(target.type)));

/** Остров в покое: сжимается при чтении вниз и уходит, пока открыта клавиатура. */
export function initIsland(): void {
  const island = document.querySelector<HTMLElement>('[data-island]');
  if (!island || island.dataset.islandReady) return;
  island.dataset.islandReady = 'true';

  const root = document.documentElement;
  const desktop = window.matchMedia('(min-width: 1024px)');
  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    ticking = false;
    // При открытом меню страница зафиксирована и её прокрутка обнулена — это не движение читателя.
    if (root.classList.contains('site-menu-open')) return;
    const y = window.scrollY;
    const delta = y - lastY;
    if (Math.abs(delta) < SCROLL_STEP) return;
    island.classList.toggle('is-compact', !desktop.matches && delta > 0 && y > COMPACT_FROM);
    lastY = y;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });

  document.addEventListener('focusin', (event) => {
    island.classList.toggle('is-away', !desktop.matches && isTextField(event.target));
  });
  document.addEventListener('focusout', () => island.classList.remove('is-away'));

  desktop.addEventListener('change', () => {
    lastY = window.scrollY;
    island.classList.remove('is-compact', 'is-away');
  });
}
