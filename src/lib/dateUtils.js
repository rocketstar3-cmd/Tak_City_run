/**
 * Date utilities for TAK City Run
 * Handles Thailand timezone (ICT, UTC+7) properly without browser UTC offset drift.
 */

const THAI_DAYS = [
  'วันอาทิตย์',
  'วันจันทร์',
  'วันอังคาร',
  'วันพุธ',
  'วันพฤหัสบดี',
  'วันศุกร์',
  'วันเสาร์'
];

const THAI_MONTHS_FULL = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม'
];

const THAI_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.'
];

/**
 * Parses event date string safely preserving the literal date and time intended by admin.
 * Avoids browser timezone conversion shifting dates (e.g. 17:00 + 7h = 00:00 next day).
 */
export function parseEventDateTime(dateStr) {
  if (!dateStr) return null;

  const str = String(dateStr).trim();
  // Match YYYY-MM-DD or YYYY-MM-DDTHH:mm or YYYY-MM-DD HH:mm:ss with optional timezone suffix
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);

  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10); // 1-12
    const day = parseInt(match[3], 10);
    const hours = match[4] !== undefined ? parseInt(match[4], 10) : 0;
    const minutes = match[5] !== undefined ? parseInt(match[5], 10) : 0;
    const seconds = match[6] !== undefined ? parseInt(match[6], 10) : 0;

    // Local JS Date object for day of week calculation
    const localDate = new Date(year, month - 1, day, hours, minutes, seconds);
    const dayOfWeek = localDate.getDay();

    // Thailand is UTC+7. Target epoch ms for countdown:
    const targetTimestamp = Date.UTC(year, month - 1, day, hours - 7, minutes, seconds);

    return {
      year,
      buddhistYear: year + 543,
      month, // 1-12
      day,
      hours,
      minutes,
      seconds,
      dayOfWeek,
      dayName: THAI_DAYS[dayOfWeek] || '',
      monthNameFull: THAI_MONTHS_FULL[month - 1] || '',
      monthNameShort: THAI_MONTHS_SHORT[month - 1] || '',
      targetTimestamp
    };
  }

  // Fallback if unexpected format
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const dayOfWeek = d.getDay();

    return {
      year,
      buddhistYear: year + 543,
      month,
      day,
      hours,
      minutes,
      seconds: d.getSeconds(),
      dayOfWeek,
      dayName: THAI_DAYS[dayOfWeek] || '',
      monthNameFull: THAI_MONTHS_FULL[month - 1] || '',
      monthNameShort: THAI_MONTHS_SHORT[month - 1] || '',
      targetTimestamp: d.getTime()
    };
  }

  return null;
}

/**
 * Format date for Hero section:
 * Example: "วันอาทิตย์ที่ 1 พฤศจิกายน 2569"
 */
export function formatThaiDateHero(dateStr) {
  const parsed = parseEventDateTime(dateStr);
  if (!parsed) return '';
  return `${parsed.dayName}ที่ ${parsed.day} ${parsed.monthNameFull} ${parsed.buddhistYear}`;
}

/**
 * Format time for Hero section:
 * Example: "17:00"
 */
export function formatThaiTimeHero(dateStr) {
  const parsed = parseEventDateTime(dateStr);
  if (!parsed) return '05:30';
  const hh = String(parsed.hours).padStart(2, '0');
  const mm = String(parsed.minutes).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Format date for E-Bib / Certificate:
 * Example: "1 พฤศจิกายน 2569"
 */
export function formatThaiDateEBib(dateStr) {
  const parsed = parseEventDateTime(dateStr);
  if (!parsed) return '';
  return `${parsed.day} ${parsed.monthNameFull} ${parsed.buddhistYear}`;
}

/**
 * Format for HTML5 <input type="datetime-local">
 * Always returns "YYYY-MM-DDTHH:mm"
 */
export function formatDatetimeLocal(dateStr) {
  if (!dateStr) return '';
  const parsed = parseEventDateTime(dateStr);
  if (!parsed) return '';
  const y = String(parsed.year).padStart(4, '0');
  const m = String(parsed.month).padStart(2, '0');
  const d = String(parsed.day).padStart(2, '0');
  const hh = String(parsed.hours).padStart(2, '0');
  const mm = String(parsed.minutes).padStart(2, '0');
  return `${y}-${m}-${d}T${hh}:${mm}`;
}
