import { isOnline } from '@/lib/availability';

/**
 * Обновляет строки [data-availability] (компонент AvailabilityLine): «на связи» или «отвечу после 10:00».
 * Вызывается при каждом открытии листа — в 20:00 статус меняется без перезагрузки страницы.
 */
export function refreshAvailability(scope: ParentNode = document): void {
  for (const line of scope.querySelectorAll<HTMLElement>('[data-availability]')) {
    const text = line.querySelector<HTMLElement>('[data-availability-text]');
    const { from, to, tz, onlineText, offlineText } = line.dataset;
    if (!text || !from || !to || !tz || !onlineText || !offlineText) continue;
    try {
      const online = isOnline(new Date(), { from: Number(from), to: Number(to), timeZone: tz });
      line.dataset.online = String(online);
      text.textContent = online ? onlineText : offlineText;
    } catch {
      // Браузер не знает часовой пояс — остаётся нейтральная строка с часами из разметки.
    }
  }
}
