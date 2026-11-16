import { createSheet } from './island-sheet';
import { refreshAvailability } from './availability-status';

/** Сколько держать кнопку меню, чтобы оно открылось под пальцем. */
const HOLD_MS = 220;
/** Сдвиг пальца, после которого нажатие считается жестом, а не обычным касанием. */
const SLIDE_PX = 10;

interface Press {
  id: number;
  x: number;
  y: number;
  timer: number;
  sliding: boolean;
  target: HTMLElement | null;
}

/**
 * Мобильное меню «Остров»: лист вырастает из капсулы у нижнего края (island-sheet.ts).
 * Открывается касанием или одним жестом — зажал кнопку, провёл до раздела, отпустил.
 */
export function initMobileMenu(): void {
  const dialog = document.querySelector<HTMLDialogElement>('[data-menu]');
  const opener = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  if (!dialog || !opener || dialog.dataset.menuReady) return;

  const scroller = dialog.querySelector<HTMLElement>('[data-sheet-scroll]');
  const desktop = window.matchMedia('(min-width: 1024px)');
  let press: Press | null = null;

  const endPress = () => {
    if (!press) return;
    window.clearTimeout(press.timer);
    press.target?.classList.remove('is-target');
    press = null;
    window.removeEventListener('pointermove', onPressMove);
    window.removeEventListener('pointerup', onPressUp);
    window.removeEventListener('pointercancel', onPressCancel);
  };

  const sheet = createSheet({
    dialog,
    opener,
    beforeOpen: () => refreshAvailability(dialog),
    onCleanup: endPress,
    busy: () => press !== null,
  });
  if (!sheet) return;
  dialog.dataset.menuReady = 'true';

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
    if (!dialog.open && !sheet.open()) {
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
    if (press || dialog.open || sheet.closing || desktop.matches) return;
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
    sheet.open();
  });

  refreshAvailability(dialog);
  opener.hidden = false;
}
