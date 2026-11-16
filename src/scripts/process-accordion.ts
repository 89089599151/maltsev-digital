/** Ширина, на которой этапы на странице услуг сворачиваются в список. */
const PHONE = '(max-width: 767px)';

/**
 * Этапы работы на странице услуг: на телефоне — раскрывающийся список, открыт первый этап.
 * Название этапа становится кнопкой (шаблон «заголовок с кнопкой»); на широком экране кнопка
 * выключена и все этапы видны, как раньше. Без скрипта все этапы открыты.
 */
export function initProcessAccordion(): void {
  const section = document.querySelector<HTMLElement>('.ps--full');
  if (!section || section.dataset.accordionReady) return;
  section.dataset.accordionReady = 'true';

  const phone = window.matchMedia(PHONE);
  const steps = Array.from(section.querySelectorAll<HTMLElement>('.ps__step'));
  const toggles: HTMLButtonElement[] = [];

  const setOpen = (index: number, open: boolean) => {
    steps[index]?.classList.toggle('is-open', open);
    toggles[index]?.setAttribute('aria-expanded', String(open));
  };

  steps.forEach((step, index) => {
    const heading = step.querySelector<HTMLElement>('.ps__name');
    const name = heading?.querySelector<HTMLElement>('[data-ps-name]');
    const icon = heading?.querySelector<HTMLElement>('.ps__name-i');
    const body = step.querySelector<HTMLElement>('[data-ps-body]');
    if (!heading || !name || !body) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ps__toggle';
    if (body.id) button.setAttribute('aria-controls', body.id);
    button.append(name);
    if (icon) {
      icon.hidden = false;
      button.append(icon);
    }
    heading.append(button);
    button.addEventListener('click', () => setOpen(index, !step.classList.contains('is-open')));
    toggles[index] = button;
  });

  const apply = () => {
    section.classList.toggle('is-accordion', phone.matches);
    // На широком экране список не сворачивается — кнопки не должны попадать в порядок обхода.
    toggles.forEach((button) => {
      button.disabled = !phone.matches;
    });
  };

  steps.forEach((_, index) => setOpen(index, index === 0));
  phone.addEventListener('change', apply);
  apply();
}
