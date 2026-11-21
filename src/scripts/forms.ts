/**
 * Отправка заявок.
 * - С Formspree (data-endpoint): без перезагрузки, успех — только после положительного ответа сервиса.
 * - Без Formspree (data-mailto): форма проверяет поля и собирает текст заявки. Кнопка отправки одна;
 *   канал выбирается переключателем «Telegram | Почта» (ChannelSwitch, поле _channel): для почты
 *   открывается письмо в почтовом приложении, для Telegram текст копируется и открывается чат.
 *   Сайт ничего не отправляет сам и не делает вид, что отправил.
 */

interface FormspreeError {
  field?: string;
  message: string;
}

const messages: Record<string, string> = {
  valueMissing: 'Заполните это поле',
  typeMismatch: 'Проверьте формат',
  tooShort: 'Слишком коротко',
  patternMismatch: 'Проверьте формат',
};

function fieldMessage(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
  const v = el.validity;
  if (el instanceof HTMLInputElement && el.type === 'checkbox' && v.valueMissing)
    return 'Нужно согласие, чтобы отправить заявку';
  for (const key of Object.keys(messages)) {
    if (v[key as keyof ValidityState]) return messages[key];
  }
  return '';
}

function showFieldError(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, text: string) {
  const id = el.getAttribute('data-error-id');
  const box = id ? document.getElementById(id) : null;
  el.setAttribute('aria-invalid', text ? 'true' : 'false');
  if (box) box.textContent = text;
  // Состояние поля для оформления: заполнено верно — галочка, ошибка — красная рамка.
  const filled = !(el instanceof HTMLInputElement && el.type === 'checkbox') && el.value.trim() !== '';
  if (text) el.dataset.state = 'invalid';
  else if (filled) el.dataset.state = 'valid';
  else delete el.dataset.state;
}

const plural = (n: number, one: string, few: string, many: string) => {
  const d = n % 10;
  const h = n % 100;
  if (d === 1 && h !== 11) return one;
  if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return few;
  return many;
};

/**
 * Живая подсказка у поля с минимальной длиной (подсказка с [data-count-hint] в aria-describedby):
 * вместо правила «от 20 символов» — сколько осталось, а когда хватает — «Достаточно».
 */
function initCountHint(el: HTMLTextAreaElement | HTMLInputElement) {
  const min = el.minLength;
  if (!(min > 0)) return;
  const hint = (el.getAttribute('aria-describedby') ?? '')
    .split(/\s+/)
    .map((id) => document.getElementById(id))
    .find((node): node is HTMLElement => !!node && node.hasAttribute('data-count-hint'));
  if (!hint) return;
  const initial = hint.textContent ?? '';
  const update = () => {
    const length = el.value.trim().length;
    hint.classList.toggle('is-done', length >= min);
    if (!length) hint.textContent = initial;
    else if (length < min) {
      const left = min - length;
      hint.textContent = `Ещё ${left} ${plural(left, 'символ', 'символа', 'символов')}`;
    } else hint.textContent = 'Достаточно — можно отправлять';
  };
  el.addEventListener('input', update);
  update();
}

type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

/** Короткое покачивание неверного поля при отправке (стили — global.css, .is-shake). */
function shake(el: HTMLElement) {
  const target = el.closest<HTMLElement>('.fl, label') ?? el;
  target.classList.remove('is-shake');
  void target.offsetWidth; // перезапуск анимации при повторной отправке
  target.classList.add('is-shake');
  target.addEventListener('animationend', () => target.classList.remove('is-shake'), { once: true });
}

/** Подпись поля для письма: <label for>, обёртка-<label> или <legend> группы. */
function fieldLabel(el: Field): string {
  const byFor = el.id ? document.querySelector<HTMLLabelElement>(`label[for="${el.id}"]`) : null;
  const group = el instanceof HTMLInputElement && el.type === 'radio' ? el.closest('fieldset')?.querySelector('legend') : null;
  const wrap = el.closest('label')?.querySelector('span');
  const raw = (byFor ?? group ?? wrap)?.textContent ?? el.name;
  return raw.replace(/\s*\*\s*$/, '').replace(/\s*—\s*(необязательно|по желанию)\s*$/, '').trim();
}

/** Текст заявки из заполненных полей — для письма и для Telegram. */
function composeBrief(form: HTMLFormElement, fields: Field[]): string {
  const lines: string[] = [];
  for (const el of fields) {
    if (el instanceof HTMLInputElement && el.type === 'checkbox') continue;
    if (el instanceof HTMLInputElement && el.type === 'radio' && !el.checked) continue;
    const value = el.value.trim();
    if (value) lines.push(`${fieldLabel(el)}: ${value}`);
  }
  // Бриф уже подставляет расчёт в описание задачи. Не дублируем его в готовом письме,
  // но сохраняем отдельную строку, если посетитель удалил подстановку или пишет из короткой формы.
  const estimate = form.querySelector<HTMLInputElement>('[data-estimate-field]')?.value
    .replace(/^(?:Расчёт с сайта:\s*)+/iu, '').trim();
  const inMessage = estimate && fields.some((el) => el.name === 'message' && el.value.includes(estimate));
  if (estimate && !inMessage) lines.push(`Расчёт с сайта: ${estimate}`);
  return lines.join('\n');
}

export function initLeadForms(): void {
  document.querySelectorAll<HTMLFormElement>('form[data-lead-form]').forEach((form) => {
    const endpoint = form.dataset.endpoint;
    const mailto = form.dataset.mailto;
    const status = form.querySelector<HTMLElement>('[data-status]');
    const submit = form.querySelector<HTMLButtonElement>('[type="submit"]');
    const success = form.parentElement?.querySelector<HTMLElement>('[data-success]');
    // Формы подключают несколько компонентов одной страницы — каждая форма настраивается один раз.
    if (!submit || (!endpoint && !mailto) || form.dataset.leadReady) return;
    form.dataset.leadReady = 'true';

    form.noValidate = true;

    // Служебные поля (имя с «_»: ловушка для ботов, канал отправки) не проверяются и не попадают в текст.
    const fields = Array.from(form.querySelectorAll<Field>('input, textarea, select')).filter(
      (el) => el.name && el.type !== 'hidden' && !el.name.startsWith('_'),
    );

    const validate = (): boolean => {
      let firstInvalid: HTMLElement | null = null;
      for (const el of fields) {
        const msg = fieldMessage(el);
        showFieldError(el, msg);
        if (msg && !firstInvalid) firstInvalid = el;
      }
      if (firstInvalid) {
        shake(firstInvalid);
        firstInvalid.focus();
        if (status) status.textContent = 'Проверьте отмеченные поля.';
        return false;
      }
      return true;
    };

    fields.forEach((el) => {
      if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) initCountHint(el);
      const evt = el instanceof HTMLInputElement && el.type === 'checkbox' ? 'change' : 'blur';
      el.addEventListener(evt, () => {
        if (el.getAttribute('aria-invalid') === 'true' || el.value) showFieldError(el, fieldMessage(el));
      });
      el.addEventListener('input', () => {
        if (el.getAttribute('aria-invalid') === 'true') showFieldError(el, fieldMessage(el));
      });
    });

    if (!endpoint && mailto) {
      const subject = form.querySelector<HTMLInputElement>('input[name="_subject"]')?.value ?? 'Заявка с сайта';
      const tgUrl = form.dataset.telegram;
      const label = submit.querySelector<HTMLElement>('[data-label]');
      const hint = form.querySelector<HTMLElement>('[data-channel-hint]');
      const channels = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="_channel"]'));
      const channel = (): 'telegram' | 'mail' =>
        channels.find((el) => el.checked)?.value === 'telegram' && tgUrl ? 'telegram' : 'mail';

      // Подпись кнопки говорит, что произойдёт на самом деле: заявка не уходит с сайта, а копируется
      // в чат Telegram или открывается готовым письмом.
      const syncChannel = () => {
        const current = channel();
        if (label) label.textContent = current === 'telegram' ? 'Скопировать заявку и открыть Telegram' : 'Открыть письмо с заявкой';
        if (hint) hint.textContent = (current === 'telegram' ? hint.dataset.hintTelegram : hint.dataset.hintMail) ?? '';
        if (status) status.textContent = '';
      };
      channels.forEach((el) => el.addEventListener('change', syncChannel));
      syncChannel();

      const sendMail = () => {
        const body = composeBrief(form, fields);
        window.location.href = `mailto:${mailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        if (status)
          status.textContent = `Открываю почту с готовым письмом — останется нажать «Отправить». Если ничего не открылось, напишите на ${mailto}.`;
      };

      const sendTelegram = async () => {
        if (!tgUrl) return;
        const body = `${subject}
${composeBrief(form, fields)}`;
        // Копирование запускается и чат открывается в одном обработчике нажатия, без ожидания:
        // Safari блокирует window.open, вызванный после await, как всплывающее окно.
        const copying = navigator.clipboard?.writeText(body);
        window.open(tgUrl, '_blank', 'noopener');
        let copied = false;
        try {
          await copying;
          copied = Boolean(copying);
        } catch {
          /* буфер обмена недоступен — чат уже открыт, текст опишут сами */
        }
        if (status)
          status.textContent = copied
            ? 'Текст заявки скопирован. Вставьте его в открывшийся чат и отправьте.'
            : 'Открываю Telegram. Скопировать текст не получилось — опишите задачу в чате.';
      };

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validate()) return;
        if (channel() === 'telegram') void sendTelegram();
        else sendMail();
      });
      return;
    }
    if (!endpoint) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validate()) return;

      const label = submit.querySelector<HTMLElement>('[data-label]');
      const original = label?.textContent ?? '';
      submit.disabled = true;
      form.setAttribute('aria-busy', 'true');
      if (label) label.textContent = 'Отправляю…';
      if (status) status.textContent = '';

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          form.reset();
          if (success) {
            form.hidden = true;
            success.hidden = false;
            success.focus();
          } else if (status) {
            status.textContent = 'Заявка отправлена. Скоро свяжусь с вами.';
          }
          return;
        }
        let detail = '';
        try {
          const data = (await res.json()) as { errors?: FormspreeError[] };
          detail = data.errors?.map((x) => x.message).join('; ') ?? '';
        } catch {
          /* ответ без JSON */
        }
        if (status)
          status.textContent = `Не получилось отправить (${res.status}${detail ? `: ${detail}` : ''}). Попробуйте ещё раз или напишите напрямую.`;
      } catch {
        if (status)
          status.textContent = 'Нет связи с сервисом заявок. Проверьте интернет и попробуйте ещё раз или напишите напрямую.';
      } finally {
        submit.disabled = false;
        form.removeAttribute('aria-busy');
        if (label) label.textContent = original;
        if (!form.hidden) submit.focus();
      }
    });
  });
}
