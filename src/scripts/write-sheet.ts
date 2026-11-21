import { createSheet, SHEET_OPEN_CLASS } from './island-sheet';
import { refreshAvailability } from './availability-status';
import { initLeadForms } from './forms';
import { ESTIMATE_EVENT, fullSum, type EstimateDetail } from '@/lib/estimate';

/** Сколько держится отметка «скопировано». */
const COPIED_MS = 2400;

type View = 'ways' | 'form';

/**
 * Лист «Написать»: синяя кнопка острова открывает способы связи, не уводя со страницы.
 * Без скрипта и на широком экране кнопка остаётся обычной ссылкой на страницу контактов.
 */
export function initWriteSheet(): void {
  const dialog = document.querySelector<HTMLDialogElement>('[data-write-sheet]');
  const opener = document.querySelector<HTMLAnchorElement>('[data-write-open]');
  if (!dialog || !opener || dialog.dataset.writeReady) return;

  const views = Array.from(dialog.querySelectorAll<HTMLElement>('[data-write-view]'));
  const telegram = dialog.querySelector<HTMLAnchorElement>('[data-write-telegram]');
  const mail = dialog.querySelector<HTMLAnchorElement>('[data-write-mail]');
  const brief = dialog.querySelector<HTMLAnchorElement>('[data-write-brief]');
  const estimateBox = dialog.querySelector<HTMLElement>('[data-write-estimate]');
  const estimateText = dialog.querySelector<HTMLElement>('[data-write-estimate-text]');
  const estimateField = dialog.querySelector<HTMLInputElement>('[data-estimate-field]');
  const live = dialog.querySelector<HTMLElement>('[data-write-live]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Адреса без расчёта — к ним возвращаемся, если расчёта нет.
  const base = { telegram: telegram?.href ?? '', mail: mail?.href ?? '', brief: brief?.href ?? '' };
  let estimate: EstimateDetail | null = null;
  let view: View = 'ways';

  /** Показывает один из видов листа; высота карточки меняется плавно. */
  const showView = (name: View, animate: boolean) => {
    if (view === name || !views.some((el) => el.dataset.writeView === name)) return;
    const board = sheet?.board;
    const from = board?.offsetHeight ?? 0;
    for (const el of views) {
      const active = el.dataset.writeView === name;
      el.hidden = !active;
      el.classList.toggle('is-entering', active && animate);
      // Назад вид приходит слева, вперёд — справа.
      el.style.setProperty('--ws-shift', name === 'form' ? '16px' : '-16px');
    }
    view = name;
    if (!animate || !board || reducedMotion.matches || typeof board.animate !== 'function') return;
    const to = board.offsetHeight;
    if (from !== to) {
      board.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration: 260, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
    }
  };

  /** Расчёт из калькулятора попадает в сообщение Telegram, в письмо, в заявку и в адрес брифа. */
  const applyEstimate = () => {
    if (estimateBox) estimateBox.hidden = !estimate;
    if (estimateText) estimateText.textContent = estimate ? `${fullSum(estimate.sum)}, ${estimate.plan}` : '';
    if (estimateField) estimateField.value = estimate ? `Расчёт с сайта: ${estimate.summary}` : '';
    const text = estimate ? `Здравствуйте! Расчёт с сайта: ${estimate.summary}.` : '';
    if (telegram) telegram.href = text ? `${base.telegram}?text=${encodeURIComponent(text)}` : base.telegram;
    if (mail) mail.href = text ? `${base.mail}${base.mail.includes('?') ? '&' : '?'}body=${encodeURIComponent(text)}` : base.mail;
    if (brief) brief.href = estimate?.href ?? base.brief;
  };

  const sheet = createSheet({
    dialog,
    opener,
    beforeOpen: () => {
      refreshAvailability(dialog);
      applyEstimate();
    },
    onCleanup: () => {
      dialog.style.removeProperty('--sheet-kb');
      // Следующее открытие начинается со способов связи; введённое в заявке сохраняется.
      showView('ways', false);
    },
  });
  if (!sheet) return;
  dialog.dataset.writeReady = 'true';

  document.addEventListener(ESTIMATE_EVENT, (event) => {
    estimate = (event as CustomEvent<EstimateDetail>).detail;
  });

  // Кнопка острова — ссылка: открытие в новой вкладке и переход без скрипта работают как обычно.
  opener.setAttribute('aria-haspopup', 'dialog');
  opener.setAttribute('aria-controls', dialog.id);
  opener.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    // Пока другой лист открыт или закрывается, нажатие не должно увести на страницу контактов.
    if (sheet.open() || document.documentElement.classList.contains(SHEET_OPEN_CLASS)) event.preventDefault();
  });

  // --- Копирование адреса почты ------------------------------------------

  const copy = dialog.querySelector<HTMLButtonElement>('[data-write-copy]');
  const mailNote = dialog.querySelector<HTMLElement>('[data-write-mail-note]');
  if (copy && navigator.clipboard?.writeText) {
    const icon = copy.querySelector<SVGElement>('[data-copy-icon]');
    const done = copy.querySelector<HTMLElement>('[data-copy-done]');
    const note = mailNote?.textContent ?? '';
    let reset: number | undefined;
    const mark = (ok: boolean, text: string) => {
      copy.classList.toggle('is-done', ok);
      if (icon) icon.style.display = ok ? 'none' : '';
      if (done) done.hidden = !ok;
      if (mailNote) mailNote.textContent = text || note;
      if (live) live.textContent = text;
    };
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      window.clearTimeout(reset);
      try {
        await navigator.clipboard.writeText(copy.dataset.email ?? '');
        mark(true, 'Адрес скопирован');
      } catch {
        mark(false, 'Не удалось скопировать — выделите адрес');
      }
      reset = window.setTimeout(() => mark(false, ''), COPIED_MS);
    });
  }

  // --- Короткая заявка (есть только при подключённом приёме заявок) ---------

  const formView = views.find((el) => el.dataset.writeView === 'form');
  if (formView) {
    initLeadForms();
    dialog.querySelector<HTMLButtonElement>('[data-write-form-open]')?.addEventListener('click', () => {
      showView('form', true);
      (formView.querySelector<HTMLElement>('input:not([type="hidden"]):not([tabindex="-1"])') ?? formView).focus({ preventScroll: true });
    });
    dialog.querySelector<HTMLButtonElement>('[data-write-back]')?.addEventListener('click', () => {
      showView('ways', true);
      dialog.querySelector<HTMLElement>('[data-write-form-open]')?.focus({ preventScroll: true });
    });

    // Экранная клавиатура не меняет размер страницы — лист поднимается над ней сам.
    const viewport = window.visualViewport;
    if (viewport) {
      const lift = () => {
        if (!dialog.open) return;
        // При увеличении страницы пальцами видимая область тоже меньше, но клавиатуры нет.
        const keyboard = viewport.scale > 1.01 ? 0 : Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
        dialog.style.setProperty('--sheet-kb', `${Math.round(keyboard)}px`);
      };
      viewport.addEventListener('resize', lift);
      viewport.addEventListener('scroll', lift);
    }
  }
}
