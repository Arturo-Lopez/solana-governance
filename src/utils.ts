const SECONDS_PER_DAY = 86400;

export function getTimestampFromHours(hours: number) {
  return hours * 60 * 60;
}

export function getTimestampFromDays(days: number) {
  return days * SECONDS_PER_DAY;
}
