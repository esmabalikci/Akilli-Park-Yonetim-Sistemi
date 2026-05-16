const TURKEY_TZ = 'Europe/Istanbul';

function parseToDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const normalized =
      value.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(value)
        ? value
        : `${value}Z`;
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Türkiye yerel saati (cihaz saat diliminden bağımsız) */
export function formatTurkeyDateTime(value) {
  const date = parseToDate(value);
  if (!date) return '';

  const parts = new Intl.DateTimeFormat('tr-TR', {
    timeZone: TURKEY_TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type) => parts.find((p) => p.type === type)?.value ?? '';

  return `${get('day')}.${get('month')}.${get('year')} ${get('hour')}:${get('minute')}:${get('second')}`;
}

export function getNowForPicker() {
  return new Date();
}

export function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

/** Tarih kısmını koruyup saati diğer tarihten alır */
export function mergeDateAndTime(datePart, timePart) {
  const result = new Date(datePart);
  const t = new Date(timePart);
  result.setHours(t.getHours(), t.getMinutes(), t.getSeconds(), 0);
  return result;
}

const MIN_DURATION_MS = 15 * 60 * 1000;
const MAX_DURATION_MS = 24 * 60 * 60 * 1000;

/** null = geçerli, aksi halde hata mesajı */
export function validateReservationRange(start, end) {
  const startDate = parseToDate(start);
  const endDate = parseToDate(end);
  const now = getNowForPicker();

  if (!startDate || !endDate) {
    return 'Lütfen başlangıç ve bitiş tarih/saatini seçin.';
  }

  if (startDate.getTime() < now.getTime() - 60 * 1000) {
    return 'Başlangıç tarihi ve saati geçmişte olamaz.';
  }

  if (endDate.getTime() <= startDate.getTime()) {
    return 'Bitiş saati, başlangıç saatinden sonra olmalıdır.';
  }

  const duration = endDate.getTime() - startDate.getTime();
  if (duration < MIN_DURATION_MS) {
    return 'Rezervasyon süresi en az 15 dakika olmalıdır.';
  }

  if (duration > MAX_DURATION_MS) {
    return 'Rezervasyon süresi en fazla 24 saat olabilir.';
  }

  return null;
}
