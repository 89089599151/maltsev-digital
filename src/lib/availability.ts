export interface WorkHours {
  /** Первый рабочий час, включительно. */
  from: number;
  /** Час окончания, не включается: при `to: 20` в 20:00 уже не на связи. */
  to: number;
  /** Часовой пояс IANA, например `Europe/Moscow`. */
  timeZone: string;
}

/** Попадает ли момент `now` в рабочие часы в указанном часовом поясе. */
export function isOnline(now: Date, hours: WorkHours): boolean {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone: hours.timeZone }).format(now),
  );
  return Number.isFinite(hour) && hour >= hours.from && hour < hours.to;
}
