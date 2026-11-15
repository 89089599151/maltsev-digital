import { isOnline } from '@/lib/availability';

/** Длительность закрытия — совпадает с анимациями menu-shrink и menu-drop в Header.astro. */
const CLOSE_MS = 220;
/** Сколько держать кнопку меню, чтобы оно открылось под пальцем. */
const HOLD_MS = 220;
/** Сдвиг пальца, после которого нажатие считается жестом, а не обычным касанием. */
const SLIDE_PX = 10;
/** На сколько нужно стянуть карточку вниз, чтобы она закрылась. */
const DROP_PX = 80;

interface Press {
  id: number;
  x: number;
  y: number;
  timer: number;
  sliding: boolean;
  target: HTMLElement | null;
}

/**
 * Мобильное меню «Остров»: нативный диалог вырастает из капсулы у нижнего края.
 * Открывается касанием или одним жестом — зажал кнопку, провёл до раздела, отпустил.
 */
export function initMobileMenu(): void {
  const dialog = document.querySelector<HTMLDialogElement>('[data-menu]');
  const opener = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  const closer = document.querySelector<HTMLButtonElement>('[data-menu-close]');
  const board = document.querySelector<HTMLElement>('[data-menu-board]');
  const island = document.querySelector<HTMLElement>('[data-island]');
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!dialog || !opener || !closer || !board || typeof dialog.showModal !== 'function' || dialog.dataset.menuReady) return;
  dialog.dataset.menuReady = 'true';

  const scroller = dialog.querySelector<HTMLElement>('[data-menu-scroll]');
  const status = dialog.querySelector<HTMLElement>('[data-status]');
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
  let press: Press | null = null;
  let drag: { y: number; dy: number; active: boolean } | null = null;

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

  /** Статус пересчитывается при каждом открытии: в 20:00 он меняется без перезагрузки страницы. */
  const updateStatus = () => {
    const text = status?.querySelector<HTMLElement>('[data-status-text]');
    if (!status || !text) return;
    const { from, to, tz, onlineText, offlineText } = status.dataset;
    if (!from || !to || !tz || !onlineText || !offlineText) return;
    try {
      const online = isOnline(new Date(), { from: Number(from), to: Number(to), timeZone: tz });
      status.dataset.online = String(online);
      text.textContent = online ? onlineText : offlineText;
    } catch {
      // Браузер не знает часовой пояс — остаётся нейтральная строка с часами из разметки.
    }
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

  const endPress = () => {
    if (!press) return;
    window.clearTimeout(press.timer);
    press.target?.classList.remove('is-target');
    press = null;
    window.removeEventListener('pointermove', onPressMove);
    window.removeEventListener('pointerup', onPressUp);
    window.removeEventListener('pointercancel', onPressCancel);
  };

  const endDrag = (apply: boolean) => {
    if (!drag) return;
    const { active, dy } = drag;
    drag = null;
    board.classList.remove('is-dragging');
    if (!active) return;
    if (apply && dy >= DROP_PX) close(false, true, true);
    else board.style.removeProperty('--menu-drag');
  };

  const cleanup = () => {
    const hadSession = locked || closing || opener.getAttribute('aria-expanded') === 'true';
    window.clearTimeout(closeTimer);
    closeTimer = undefined;
    closing = false;
    endPress();
    endDrag(false);
    dialog.classList.remove('is-closing', 'is-dropping', 'is-measuring');
    board.style.removeProperty('--menu-drag');
    opener.setAttribute('aria-expanded', 'false');
    unlockScroll();
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
    if (dialog.open || closing || desktop.matches) return false;
    restoreFocus = true;
    updateStatus();
    // Остров измеряется до блокировки страницы: после неё он скрыт.
    const from = island?.getBoundingClientRect();
    lockScroll();
    dialog.classList.add('is-measuring');
    dialog.showModal();
    setGrowOrigin(from);
    dialog.classList.remove('is-measuring');
    if (scroller) scroller.scrollTop = 0;
    opener.setAttribute('aria-expanded', 'true');
    closer.focus({ preventScroll: true });
    return true;
  };

  // --- Жест «зажал — провёл — отпустил» -----------------------------------

  /**
   * Раздел под точкой — по координатам, а не через elementFromPoint: пока карточка растёт,
   * её обрезанная часть не ловит касания, и быстрый жест прошёл бы мимо.
   */
  const itemAt = (x: number, y: number): HTMLElement | null => {
    const view = scroller?.getBoundingClientRect();
    for (const item of dialog.querySelectorAll<HTMLElement>('[data-menu-item]')) {
      const rect = item.getBoundingClientRect();
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) continue;
      // Строка, прокрученная за край списка, не считается.
      if (view && scroller?.contains(item) && (y < view.top || y > view.bottom)) continue;
      return item;
    }
    return null;
  };

  const setPressTarget = (target: HTMLElement | null) => {
    if (!press || press.target === target) return;
    press.target?.classList.remove('is-target');
    press.target = target;
    if (!target) return;
    target.classList.add('is-target');
    // Короткий отклик там, где телефон его поддерживает.
    if (typeof navigator.vibrate === 'function') navigator.vibrate(8);
  };

  const startSlide = () => {
    if (!press || press.sliding) return;
    window.clearTimeout(press.timer);
    if (!dialog.open && !open()) {
      endPress();
      return;
    }
    press.sliding = true;
  };

  const onPressMove = (event: PointerEvent): void => {
    if (!press || event.pointerId !== press.id) return;
    if (!press.sliding) {
      if (Math.hypot(event.clientX - press.x, event.clientY - press.y) < SLIDE_PX) return;
      startSlide();
      if (!press?.sliding) return;
    }
    setPressTarget(itemAt(event.clientX, event.clientY));
  };

  const onPressUp = (event: PointerEvent): void => {
    if (!press || event.pointerId !== press.id) return;
    // Быстрое движение может закончиться без промежуточных событий — сверяемся с точкой отпускания.
    if (press.sliding) setPressTarget(itemAt(event.clientX, event.clientY));
    const { sliding, target } = press;
    endPress();
    // Отпустили на разделе — переходим; мимо — меню остаётся открытым.
    if (sliding && target) target.click();
  };

  const onPressCancel = (event: PointerEvent): void => {
    if (press && event.pointerId === press.id) endPress();
  };

  opener.addEventListener('pointerdown', (event) => {
    if (press || dialog.open || closing || desktop.matches) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    // Касание по умолчанию «привязано» к кнопке; отпускаем его, чтобы события шли к разделам под пальцем.
    try {
      opener.releasePointerCapture(event.pointerId);
    } catch {
      // Захвата не было — ничего не делаем.
    }
    press = { id: event.pointerId, x: event.clientX, y: event.clientY, timer: 0, sliding: false, target: null };
    press.timer = window.setTimeout(startSlide, HOLD_MS);
    window.addEventListener('pointermove', onPressMove);
    window.addEventListener('pointerup', onPressUp);
    window.addEventListener('pointercancel', onPressCancel);
  });
  // Карточка появляется под уже нажатой мышью, и браузер пытается «потащить» ссылку — это оборвало бы жест.
  dialog.addEventListener('dragstart', (event) => {
    if (press) event.preventDefault();
  });
  // Долгое нажатие открывает меню, а не контекстное меню браузера.
  opener.addEventListener('contextmenu', (event) => event.preventDefault());
  opener.addEventListener('click', () => {
    open();
  });

  // --- Смахивание карточки вниз -------------------------------------------

  board.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    // Список прокручен — палец управляет списком, а не карточкой.
    drag = event.touches.length === 1 && touch && !closing && !press && (scroller?.scrollTop ?? 0) <= 0
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
    board.style.setProperty('--menu-drag', `${Math.round(drag.dy)}px`);
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

  updateStatus();
  opener.setAttribute('aria-expanded', 'false');
  opener.hidden = false;
}
