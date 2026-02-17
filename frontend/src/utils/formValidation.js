/**
 * Минимальная валидация для форм заявок.
 * Телефон: хотя бы 10 цифр (цифры из строки).
 */
export function normalizePhone(value) {
  if (value == null) return '';
  const digits = String(value).replace(/\D/g, '');
  return digits;
}

export function isPhoneValid(value) {
  const digits = normalizePhone(value);
  return digits.length >= 10;
}

export function isRequired(value) {
  return value != null && String(value).trim().length > 0;
}
