/** Мобильное меню: нативный диалог, нижняя панель и возврат к той же позиции страницы. */
export function initMobileMenu(): void {
  const dialog = document.querySelector<HTMLDialogElement>('[data-menu]');
  const opener = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  const closer = document.querySelector<HTMLButtonElement>('[data-menu-close]');
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!dialog || !opener || !closer || typeof dialog.showModal !== 'function' || dialog.dataset.menuReady) return;
  dialog.dataset.menuReady = 'true';

  const root = document.documentElement;
  const desktop = window.matchMedia('(min-width: 1024px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollProperty = '--site-menu-scroll-y';
  let scrollY = 0;
  let scrollValue = '';
  let scrollPriority = '';
  let locked = false;
  let closing = false;
  let restoreFocus = true;
  let closeTimer: number | undefined;

  const restoreProperty = (name: string, value: string, priority: string) => {
    if (value) root.style.setProperty(name, value, priority);
    else root.style.removeProperty(name);
  };

  const lockScroll = () => {
    scrollY = window.scrollY;
    scrollValue = root.style.getPropertyValue(scrollProperty);
    scrollPriority = root.style.getPropertyPriority(scrollProperty);
    root.style.setProperty(scrollProperty, `${-scrollY}px`);
    root.classList.add('site-menu-open');
    locked = true;
  };

  const unlockScroll = () => {
    if (!locked) return;
    locked = false;
    const behavior = root.style.getPropertyValue('scroll-behavior');
    const priority = root.style.getPropertyPriority('scroll-behavior');
    // Обычная плавная прокрутка не должна анимировать возврат после снятия position: fixed.
    root.style.setProperty('scroll-behavior', 'auto', 'important');
    root.classList.remove('site-menu-open');
    restoreProperty(scrollProperty, scrollValue, scrollPriority);
    window.scrollTo(0, scrollY);
    restoreProperty('scroll-behavior', behavior, priority);
  };

  const cleanup = () => {
    const hadSession = locked || closing || opener.getAttribute('aria-expanded') === 'true';
    window.clearTimeout(closeTimer);
    closeTimer = undefined;
    closing = false;
    dialog.classList.remove('is-closing');
    opener.setAttribute('aria-expanded', 'false');
    unlockScroll();
    if (!hadSession || !restoreFocus) return;
    header?.classList.remove('is-hidden');
    const target = !desktop.matches && opener.getClientRects().length
      ? opener
      : header?.querySelector<HTMLAnchorElement>('.hdr__brand');
    target?.focus({ preventScroll: true });
  };

  const finishClose = () => {
    if (dialog.open) dialog.close();
    // close-событие приходит позже; очищаем сразу, в том числе перед переходом по ссылке.
    cleanup();
  };

  const close = (immediate = false, focus = true) => {
    if (closing && !immediate) return;
    restoreFocus = focus;
    if (!dialog.open || immediate || reducedMotion.matches) {
      finishClose();
      return;
    }
    closing = true;
    dialog.classList.add('is-closing');
    closeTimer = window.setTimeout(finishClose, 180);
  };

  opener.addEventListener('click', () => {
    if (dialog.open || closing || desktop.matches) return;
    restoreFocus = true;
    header?.classList.remove('is-hidden');
    lockScroll();
    dialog.showModal();
    opener.setAttribute('aria-expanded', 'true');
    closer.focus({ preventScroll: true });
  });
  closer.addEventListener('click', () => close());
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
    else if (event.target instanceof Element && event.target.closest('a[href]')) close(true);
  });
  dialog.addEventListener('close', () => {
    // Отложенное событие предыдущего закрытия не должно затронуть уже открытое меню.
    if (!dialog.open) cleanup();
  });
  desktop.addEventListener('change', (event) => {
    if (event.matches && (dialog.open || locked)) close(true);
  });
  reducedMotion.addEventListener('change', (event) => {
    if (event.matches && closing) close(true);
  });
  window.addEventListener('pagehide', () => close(true, false));

  opener.setAttribute('aria-expanded', 'false');
  opener.hidden = false;
}
