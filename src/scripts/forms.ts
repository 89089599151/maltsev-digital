/**
 * Отправка заявок в Formspree без перезагрузки страницы.
 * Успех показывается только после положительного ответа сервиса.
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

export function initLeadForms(): void {
  document.querySelectorAll<HTMLFormElement>('form[data-lead-form]').forEach((form) => {
    const endpoint = form.dataset.endpoint;
    const status = form.querySelector<HTMLElement>('[data-status]');
    const submit = form.querySelector<HTMLButtonElement>('[type="submit"]');
    const success = form.parentElement?.querySelector<HTMLElement>('[data-success]');
    if (!endpoint || !submit) return;

    form.noValidate = true;

    const fields = Array.from(
      form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select'),
    ).filter((el) => el.name && el.type !== 'hidden' && el.name !== '_gotcha');

    fields.forEach((el) => {
      const evt = el instanceof HTMLInputElement && el.type === 'checkbox' ? 'change' : 'blur';
      el.addEventListener(evt, () => {
        if (el.getAttribute('aria-invalid') === 'true' || el.value) showFieldError(el, fieldMessage(el));
      });
      el.addEventListener('input', () => {
        if (el.getAttribute('aria-invalid') === 'true') showFieldError(el, fieldMessage(el));
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let firstInvalid: HTMLElement | null = null;
      for (const el of fields) {
        const msg = fieldMessage(el);
        showFieldError(el, msg);
        if (msg && !firstInvalid) firstInvalid = el;
      }
      if (firstInvalid) {
        firstInvalid.focus();
        if (status) status.textContent = 'Проверьте отмеченные поля.';
        return;
      }

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
