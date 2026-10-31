/**
 * Отправка заявок.
 * - С Formspree (data-endpoint): без перезагрузки, успех — только после положительного ответа сервиса.
 * - Без Formspree (data-mailto): форма проверяет поля и собирает письмо, которое открывается в почтовом
 *   приложении посетителя; кнопка [data-send-telegram] копирует тот же текст и открывает Telegram.
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
}

type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

/** Подпись поля для письма: <label for>, обёртка-<label> или <legend> группы. */
function fieldLabel(el: Field): string {
  const byFor = el.id ? document.querySelector<HTMLLabelElement>(`label[for="${el.id}"]`) : null;
  const group = el instanceof HTMLInputElement && el.type === 'radio' ? el.closest('fieldset')?.querySelector('legend') : null;
  const wrap = el.closest('label')?.querySelector('span');
  const raw = (byFor ?? group ?? wrap)?.textContent ?? el.name;
  return raw.replace(/\s*\*\s*$/, '').replace(/\s*—\s*необязательно\s*$/, '').trim();
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
  const estimate = form.querySelector<HTMLInputElement>('[data-estimate-field]')?.value.trim();
  if (estimate) lines.push(`Расчёт с сайта: ${estimate}`);
  return lines.join('\n');
}

export function initLeadForms(): void {
  document.querySelectorAll<HTMLFormElement>('form[data-lead-form]').forEach((form) => {
    const endpoint = form.dataset.endpoint;
    const mailto = form.dataset.mailto;
    const status = form.querySelector<HTMLElement>('[data-status]');
    const submit = form.querySelector<HTMLButtonElement>('[type="submit"]');
    const success = form.parentElement?.querySelector<HTMLElement>('[data-success]');
    if (!submit || (!endpoint && !mailto)) return;

    form.noValidate = true;

    const fields = Array.from(form.querySelectorAll<Field>('input, textarea, select')).filter(
      (el) => el.name && el.type !== 'hidden' && el.name !== '_gotcha',
    );

    const validate = (): boolean => {
      let firstInvalid: HTMLElement | null = null;
      for (const el of fields) {
        const msg = fieldMessage(el);
        showFieldError(el, msg);
        if (msg && !firstInvalid) firstInvalid = el;
      }
      if (firstInvalid) {
        firstInvalid.focus();
        if (status) status.textContent = 'Проверьте отмеченные поля.';
        return false;
      }
      return true;
    };

    fields.forEach((el) => {
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
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validate()) return;
        const body = composeBrief(form, fields);
        window.location.href = `mailto:${mailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        if (status)
          status.textContent = `Открываю почту с готовым письмом — останется нажать «Отправить». Если ничего не открылось, напишите на ${mailto}.`;
      });

      const tgButton = form.querySelector<HTMLButtonElement>('[data-send-telegram]');
      const tgUrl = form.dataset.telegram;
      if (tgButton && tgUrl) {
        tgButton.addEventListener('click', async () => {
          if (!validate()) return;
          const body = `${subject}\n${composeBrief(form, fields)}`;
          let copied = false;
          try {
            await navigator.clipboard.writeText(body);
            copied = true;
          } catch {
            /* буфер обмена недоступен — откроем чат без текста */
          }
          window.open(tgUrl, '_blank', 'noopener');
          if (status)
            status.textContent = copied
              ? 'Текст заявки скопирован. Вставьте его в открывшийся чат и отправьте.'
              : 'Открываю Telegram. Скопировать текст не получилось — опишите задачу в чате.';
        });
      }
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
