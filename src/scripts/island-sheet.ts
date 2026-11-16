/** Длительность закрытия — совпадает с анимациями sheet-shrink и sheet-drop в sheet.css. */
const CLOSE_MS = 220;
/** На сколько нужно стянуть карточку вниз, чтобы она закрылась. */
const DROP_PX = 80;
/** Класс на <html>, пока открыт любой лист: страница зафиксирована, остров скрыт. */
export const SHEET_OPEN_CLASS = 'site-menu-open';

const SCROLL_PROPERTY = '--site-menu-scroll-y';

export interface SheetOptions {
  /** Диалог с карточкой [data-sheet-board] и кнопкой [data-sheet-close]. */
  dialog: HTMLDialogElement;
  /** Кнопка в острове, которая открывает лист: ей возвращается фокус после закрытия. */
  opener: HTMLElement;
  /** Перед показом листа: обновить содержимое. */
  beforeOpen?: () => void;
  /** После закрытия; может вызываться повторно. */
  onCleanup?: () => void;
  /** Пока возвращает true, смахивание вниз не начинается (идёт другой жест). */
  busy?: () => boolean;
}

export interface Sheet {
  /** Открывает лист. false — не открыт: широкий экран, идёт закрытие или открыт другой лист. */
  open(): boolean;
  close(immediate?: boolean, focus?: boolean, drop?: boolean): void;
  readonly closing: boolean;
  readonly board: HTMLElement;
}

/**
 * Лист, вырастающий из острова: нативный диалог, блокировка прокрутки страницы, возврат фокуса,
 * закрытие кнопкой, фоном, Escape и смахиванием вниз. Работает только на ширине меньше 1024 px.
 */
export function createSheet({ dialog, opener, beforeOpen, onCleanup, busy }: SheetOptions): Sheet | null {
  const board = dialog.querySelector<HTMLElement>('[data-sheet-board]');
  const closer = dialog.querySelector<HTMLButtonElement>('[data-sheet-close]');
  if (!board || !closer || typeof dialog.showModal !== 'function') return null;

  const island = document.querySelector<HTMLElement>('[data-island]');
  const header = document.querySelector<HTMLElement>('[data-header]');
  const root = document.documentElement;
  const desktop = window.matchMedia('(min-width: 1024px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let scrollY = 0;
  let scrollValue = '';
  let scrollPriority = '';
  let locked = false;
  let closing = false;
  let restoreFocus = true;
  let closeTimer: number | undefined;
  let drag: { y: number; dy: number; active: boolean } | null = null;

  /** Прокручиваемая часть листа: у листа с несколькими видами — та, что сейчас показана. */
  const scroller = () =>
    Array.from(dialog.querySelectorAll<HTMLElement>('[data-sheet-scroll]')).find((el) => !el.closest('[hidden]')) ?? null;

  const restoreProperty = (name: string, value: string, priority: string) => {
    if (value) root.style.setProperty(name, value, priority);
    else root.style.removeProperty(name);
  };

  const lockScroll = () => {
    scrollY = window.scrollY;
    scrollValue = root.style.getPropertyValue(SCROLL_PROPERTY);
    scrollPriority = root.style.getPropertyPriority(SCROLL_PROPERTY);
    root.style.setProperty(SCROLL_PROPERTY, `${-scrollY}px`);
    root.classList.add(SHEET_OPEN_CLASS);
    locked = true;
  };

  const unlockScroll = () => {
    if (!locked) return;
    locked = false;
    const behavior = root.style.getPropertyValue('scroll-behavior');
    const priority = root.style.getPropertyPriority('scroll-behavior');
    // Обычная плавная прокрутка не должна анимировать возврат после снятия position: fixed.
    root.style.setProperty('scroll-behavior', 'auto', 'important');
    root.classList.remove(SHEET_OPEN_CLASS);
    restoreProperty(SCROLL_PROPERTY, scrollValue, scrollPriority);
    window.scrollTo(0, scrollY);
    restoreProperty('scroll-behavior', behavior, priority);
  };

  /** Записывает место острова относительно карточки: из него она вырастает и в него сжимается. */
  const setGrowOrigin = (from: DOMRect | undefined) => {
    const to = board.getBoundingClientRect();
    const gap = (value: number) => `${Math.max(0, Math.round(value))}px`;
    const known = from && from.width > 0 && from.height > 0;
    board.style.setProperty('--isl-t', gap(known ? from.top - to.top : to.height - 62));
    board.style.setProperty('--isl-r', gap(known ? to.right - from.right : 0));
    board.style.setProperty('--isl-b', gap(known ? to.bottom - from.bottom : 0));
    board.style.setProperty('--isl-l', gap(known ? from.left - to.left : 0));
  };

  const endDrag = (apply: boolean) => {
    if (!drag) return;
    const { active, dy } = drag;
    drag = null;
    board.classList.remove('is-dragging');
    if (!active) return;
    if (apply && dy >= DROP_PX) close(false, true, true);
    else board.style.removeProperty('--sheet-drag');
  };

  const cleanup = () => {
    const hadSession = locked || closing || opener.getAttribute('aria-expanded') === 'true';
    window.clearTimeout(closeTimer);
    closeTimer = undefined;
    closing = false;
    endDrag(false);
    dialog.classList.remove('is-closing', 'is-dropping', 'is-measuring');
    board.style.removeProperty('--sheet-drag');
    opener.setAttribute('aria-expanded', 'false');
    unlockScroll();
    onCleanup?.();
    if (!hadSession || !restoreFocus) return;
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

  const close = (immediate = false, focus = true, drop = false): void => {
    if (closing && !immediate) return;
    restoreFocus = focus;
    if (!dialog.open || immediate || reducedMotion.matches) {
      finishClose();
      return;
    }
    closing = true;
    dialog.classList.add('is-closing');
    dialog.classList.toggle('is-dropping', drop);
    closeTimer = window.setTimeout(finishClose, CLOSE_MS);
  };

  const open = (): boolean => {
    if (dialog.open || closing || desktop.matches || root.classList.contains(SHEET_OPEN_CLASS)) return false;
    restoreFocus = true;
    beforeOpen?.();
    // Остров измеряется до блокировки страницы: после неё он скрыт.
    const from = island?.getBoundingClientRect();
    lockScroll();
    dialog.classList.add('is-measuring');
    dialog.showModal();
    setGrowOrigin(from);
    dialog.classList.remove('is-measuring');
    const list = scroller();
    if (list) list.scrollTop = 0;
    opener.setAttribute('aria-expanded', 'true');
    closer.focus({ preventScroll: true });
    return true;
  };

  // --- Смахивание карточки вниз -------------------------------------------

  board.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    // Список прокручен — палец управляет списком, а не карточкой.
    drag = event.touches.length === 1 && touch && !closing && !busy?.() && (scroller()?.scrollTop ?? 0) <= 0
      ? { y: touch.clientY, dy: 0, active: false }
      : null;
  }, { passive: true });

  board.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    if (!drag || !touch) return;
    const dy = touch.clientY - drag.y;
    if (!drag.active) {
      if (dy < 8) {
        // Движение вверх — это прокрутка списка; жест карточки отменяется.
        if (dy < -8) drag = null;
        return;
      }
      drag.active = true;
      board.classList.add('is-dragging');
    }
    if (event.cancelable) event.preventDefault();
    drag.dy = Math.max(0, dy);
    board.style.setProperty('--sheet-drag', `${Math.round(drag.dy)}px`);
  }, { passive: false });

  board.addEventListener('touchend', () => endDrag(true));
  board.addEventListener('touchcancel', () => endDrag(false));

  // --- Закрытие -----------------------------------------------------------

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
    // Отложенное событие предыдущего закрытия не должно затронуть уже открытый лист.
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

  return {
    open,
    close,
    get closing() {
      return closing;
    },
    board,
  };
}
